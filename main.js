/* jshint -W097 */// jshint strict:false
/* jslint node: true */
"use strict";

//var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
const utils = require('@iobroker/adapter-core');
var request = require('request');

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file
// name excluding extension
// adapter will be restarted automatically every time as the configuration
// changed, e.g system.adapter.mobile-alerts.0
//var adapter = utils.adapter('zoe2');
let adapter;
function startAdapter(options) {
  options = options || {};
  Object.assign(options, {
       name: 'zoe2',
       ready: main,
       unload: callback => {
	       	try {
			adapter.log.debug('cleaned everything up...');
			callback();
		} catch (e) {
			callback();
		}
       }
       
  });

  adapter = new utils.Adapter(options);
  return adapter;
}

async function main() {
	var methodName = "main";
	adapter.log.debug("in:  " + methodName + " v0.01");

	// All states changes inside the adapter's namespace are subscribed
	adapter.subscribeStates('*');

	var zoe_username = adapter.config.username;
	var zoe_password = adapter.config.password;
	var zoe_locale   = adapter.config.locale;
	var zoe_vin      = adapter.config.vin;
        var ignoreApiError = adapter.config.ignoreApiError;
        var kamereonapikey = adapter.config.kamereonApiKey;

	var localeParts=zoe_locale.split("_");
	var country="FR";
	if (localeParts.length>=2) country=localeParts[1];


	adapter.log.info("Username:"+zoe_username);
	//adapter.log.info("Password:"+zoe_password);
	adapter.log.info("Locale:"  +zoe_locale  );
	adapter.log.info("VIN:"     +zoe_vin     );
	adapter.log.info("Country:" +country     );
	adapter.log.info("ignoreApiError:"+(ignoreApiError?'true':'false'));

	var params={
		url:"https://renault-wrd-prod-1-euw1-myrapp-one.s3-eu-west-1.amazonaws.com/configuration/android/config_"+zoe_locale+".json",
		method:"get"
	};
	adapter.log.info("URL: "+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from Renault server');
			 adapter.terminate ? adapter.terminate(1) :process.exit(1);
  		} else {
			adapter.log.debug('Data received from Renault server');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			//adapter.log.info("FullBody:"+body.toString());

			var gigyarooturl = data.servers.gigyaProd.target;
			var gigyaapikey  = data.servers.gigyaProd.apikey;
			var kamereonrooturl = data.servers.wiredProd.target;
			// var kamereonapikey  = data.servers.wiredProd.apikey;

			adapter.log.info("gigyarooturl:"+gigyarooturl);
			adapter.log.info("gigyaapikey:"+gigyaapikey);
			adapter.log.info("kamereonrooturl:"+kamereonrooturl);
			adapter.log.info("kamereonapikey:"+kamereonapikey);

			var globalParams = {
				zoe_username:zoe_username,
				zoe_password:zoe_password,
				zoe_locale:zoe_locale,
				zoe_vin:zoe_vin,
				gigyarooturl:gigyarooturl,
				gigyaapikey:gigyaapikey,
				kamereonrooturl:kamereonrooturl,
				kamereonapikey:kamereonapikey,
				country:country,
				ignoreApiError:ignoreApiError,
				useLocationApi:adapter.config.useLocationApi,
				useHVACApi:adapter.config.useHVACApi,
				stopChargeWorkaroundHour:adapter.config.stopChargeWorkaroundHour
			};

			// create root config element
	                adapter.setObjectNotExists(zoe_vin, {
				type : 'device',
				common : {
					name : zoe_vin,
					type : 'string',
					role : 'sensor',
					ack : true
				},
				native : {}
			});

			loginToGigya(globalParams);
		}
	});

	adapter.log.debug("out: " + methodName);
}

function loginToGigya(globalParams) {
	var methodName = "loginToGigya";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var payload = {loginID: globalParams.zoe_username, password: globalParams.zoe_password, ApiKey: globalParams.gigyaapikey};
	var params={
		url:globalParams.gigyarooturl + 
			'/accounts.login?apiKey=' + encodeURIComponent(globalParams.gigyaapikey) + 
			'&loginID=' + encodeURIComponent(globalParams.zoe_username) + 
			'&password=' + encodeURIComponent(globalParams.zoe_password) + 
			'&include=data',
		method:"get"
	};
	//adapter.log.info("url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from gigyarooturl server');
  		} else {
			adapter.log.debug('Data received from gigyarooturl server');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("FullBody:"+JSON.stringify(data));

			var sessionInfo=data.sessionInfo;
			adapter.log.info("sessionInfo:"+JSON.stringify(sessionInfo));

			globalParams.gigyatoken=sessionInfo.cookieValue;
			
			gigyaGetJWT(globalParams);
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function gigyaGetJWT(globalParams) {
	var methodName = "gigyaGetJWT";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.gigyarooturl + 
			'/accounts.getJWT?login_token=' + encodeURIComponent(globalParams.gigyatoken) + 
			'&ApiKey=' + encodeURIComponent(globalParams.gigyaapikey) +
			'&fields=' + encodeURIComponent('data.personId,data.gigyaDataCenter') + 
			'&expiration=' + encodeURIComponent('900'),
		method:"get"
	};
	//adapter.log.info("url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from gigyaGetJWT service');
  		} else {
			adapter.log.debug('Data received from gigyaGetJWT service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getJWTFullbody:"+JSON.stringify(data));
			globalParams.gigya_jwttoken=data.id_token;
			adapter.log.info("gigya_jwttoken:"+globalParams.gigya_jwttoken);
			gigyaGetAccount(globalParams);
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function gigyaGetAccount(globalParams) {
	var methodName = "gigyaGetAccount";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.gigyarooturl + 
			'/accounts.getAccountInfo?login_token=' + encodeURIComponent(globalParams.gigyatoken) + 
			'&ApiKey=' + encodeURIComponent(globalParams.gigyaapikey),
		method:"get"
	};
	//adapter.log.info("url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from gigyagetAccountInfo service');
  		} else {
			adapter.log.debug('Data received from gigyagetAccountInfo service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getgetAccountInfo:"+JSON.stringify(data));
			globalParams.kamereonpersonid=data.data.personId;
			adapter.log.info("kamereonpersonid:"+globalParams.kamereonpersonid);

			getKamereonAccount(globalParams);																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																					
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function getKamereonAccount(globalParams) {
	var methodName = "getKamereonAccount";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/persons/' + globalParams.kamereonpersonid+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"get",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey
		}
	};
	//adapter.log.info("url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from getKamereonAccount service');
  		} else {
			adapter.log.debug('Data received from getKamereonAccount service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getKamereonAccount:"+JSON.stringify(data));
			var accounts=data.accounts;
			adapter.log.info("accounts:"+JSON.stringify(accounts));
			globalParams.kamereonaccountid=accounts[0].accountId;
			adapter.log.info("kamereonaccountid:"+globalParams.kamereonaccountid);

			getKamereonCars(globalParams);
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function getKamereonCars(globalParams) {
	var methodName = "getKamereonCars";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/accounts/' + globalParams.kamereonaccountid+'/vehicles'+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"get",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey,
		}
	};
	//adapter.log.info("url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from getKamereonCars service');
  		} else {
			adapter.log.debug('Data received from getKamereonCars service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getKamereonCars:"+JSON.stringify(data));

		/*
			var vehicleLinks=data.vehicleLinks;
			for (var i=0;i<vehicleLinks.length;i++) {
				if (vehicleLinks[i].vin==globalParams.zoe_vin) {
					setValue(globalParams.zoe_vin,"mileage","float",vehicleLinks[i].mileage,"data");
				}
			}
		*/

			getBatteryStatus(globalParams);

		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function getBatteryStatus(globalParams) {
	var methodName = "getBatteryStatus";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
			'/kamereon/kca/car-adapter/v2/cars/' + globalParams.zoe_vin + '/battery-status'+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"get",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey,
			'Content-Type':'application/vnd.api+json'
		}
	};
	adapter.log.info("getBatteryStatus-url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from getBatteryStatus service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));

			if (globalParams.ignoreApiError) getCockpit(globalParams);
  		} else {
			adapter.log.debug('Data received from getBatteryStatus service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getBatteryStatus:"+JSON.stringify(data));
			var attributes=data.data.attributes;

			var charge_level   =attributes.batteryLevel;
			var plugged        =attributes.plugStatus==1;
			var charging       =attributes.chargingStatus==1;
			var remaining_range=attributes.batteryAutonomy;
			var remaining_time =attributes.chargingRemainingTime;
			var batteryTemperature=attributes.batteryTemperature;
			var chargingPower  =attributes.chargingInstantaneousPower;
			var batteryCapacity=attributes.batteryCapacity;
			var batteryAvailableEnergy=attributes.batteryAvailableEnergy;

			var batteryTS=attributes.timestamp;
			if (batteryTS) {
				setValue(globalParams.zoe_vin,"batteryTS","string",new Date(batteryTS),"date");
			} else {
				setValue(globalParams.zoe_vin,"batteryTS","string",null,"date");
			}
			

			if (!charging) {
				chargingPower = 0;
				remaining_time = 0;
			}
				

			if (remaining_time === undefined) remaining_time = 0;
			var chargingFinishedAt=new Date(Date.now() + remaining_time * 60000);
			if (remaining_time == 0) chargingFinishedAt=null;

			if (!charging) chargingPower = 0;

                        setValue(globalParams.zoe_vin,"charge_level","float",charge_level,"data");
                        setValue(globalParams.zoe_vin,"remaining_range","float",remaining_range,"data");
                        setValue(globalParams.zoe_vin,"remaining_time","float",remaining_time),"data";
                        setValue(globalParams.zoe_vin,"charging_finished_at","string",chargingFinishedAt,"date");
                        setValue(globalParams.zoe_vin,"plugged","boolean",plugged,"data");
                        setValue(globalParams.zoe_vin,"charging","boolean",charging,"data");
                        setValue(globalParams.zoe_vin,"batteryTemperature","float",batteryTemperature,"data");
                        setValue(globalParams.zoe_vin,"chargingPower","float",chargingPower,"data");
                        setValue(globalParams.zoe_vin,"batteryCapacity","float",batteryCapacity,"data");
                        setValue(globalParams.zoe_vin,"batteryAvailableEnergy","float",batteryAvailableEnergy,"data");
			

			getCockpit(globalParams);			
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function getCockpit(globalParams) {
	var methodName = "getCockpit";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
			'/kamereon/kca/car-adapter/v2/cars/' + globalParams.zoe_vin + '/cockpit'+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"get",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey,
			'Content-Type':'application/vnd.api+json'
		}
	};
	adapter.log.info("getCockpit-url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from getCockpit service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));

			if (globalParams.ignoreApiError) getLocation(globalParams);
  		} else {
			adapter.log.debug('Data received from getCockpit service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getCockpit:"+JSON.stringify(data));

			var totalMileage=data.data.attributes.totalMileage;
			if (totalMileage !== undefined) setValue(globalParams.zoe_vin,"totalMileage","float",totalMileage,"data");

			getLocation(globalParams);
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function getLocation(globalParams) {
	var methodName = "getLocation";
	adapter.log.debug("in:  " + methodName + " v0.01");
	if (!globalParams.useLocationApi) {
		adapter.log.info(methodName+" not enabled in config");
		return getHVACStatus(globalParams);
	}

	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
			'/kamereon/kca/car-adapter/v1/cars/' + globalParams.zoe_vin + '/location'+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"get",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey,
			'Content-Type':'application/vnd.api+json'
		}
	};
	adapter.log.info("getLocation-url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from getLocation service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));

			if (globalParams.ignoreApiError) getHVACStatus(globalParams);
  		} else {
			adapter.log.debug('Data received from getLocation service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getLocation:"+JSON.stringify(data));
			
			var gpsLatitude=data.data.attributes.gpsLatitude;
			adapter.log.info('gpsLatitude:'+gpsLatitude);
			if (gpsLatitude !== undefined) setValue(globalParams.zoe_vin,"gpsLatitude","float",gpsLatitude,"data");

			var gpsLongitude=data.data.attributes.gpsLongitude;
			adapter.log.info('gpsLongitude:'+gpsLongitude);
			if (gpsLongitude !== undefined) setValue(globalParams.zoe_vin,"gpsLongitude","float",gpsLongitude,"data");

			getHVACStatus(globalParams);
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}


function getHVACStatus(globalParams) {
	var methodName = "getHVACStatus";
	adapter.log.debug("in:  " + methodName + " v0.01");

	if (!globalParams.useHVACApi) {
		adapter.log.info(methodName+" not enabled in config");
		return checkPreconAndCharge(globalParams);
	}


	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
			'/kamereon/kca/car-adapter/v1/cars/' + globalParams.zoe_vin + '/hvac-status'+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"get",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey,
			'Content-Type':'application/vnd.api+json'
		}
	};
	adapter.log.info("getHVACStatus-url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from getHVACStatus service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));

			if (globalParams.ignoreApiError) checkPreconAndCharge(globalParams);
  		} else {
			adapter.log.debug('Data received from getHVACStatus service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("getHVACStatus:"+JSON.stringify(data));

			var attributes=data.data.attributes;
			var hvacOn=attributes.hvacStatus!="off";

			setValue(globalParams.zoe_vin,"externalTemperature","float",attributes.externalTemperature,"data");
                        setValue(globalParams.zoe_vin,"hvacOn","boolean",hvacOn,"data");

			checkPreconAndCharge(globalParams);
		}
	});

	// Force terminate
	globalParams.timeout=setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		 adapter.terminate ? adapter.terminate(1) :process.exit(1);
	}, 3 * 60 * 1000);
	adapter.log.debug("out: " + methodName);
}

function checkPreconAndCharge(globalParams) {
	var methodName = "checkPreconAndCharge";
	adapter.log.debug("in:  " + methodName + " v0.01");

	adapter.setObjectNotExists(globalParams.zoe_vin+".preconNow", {
		type : 'state',
		common: {
			name : 'preconNow',
			type : 'boolean',
			role : 'button',
			ack : true
		},
		native : {}
	});
        adapter.setObjectNotExists(globalParams.zoe_vin+".chargeCancel", {
                type : 'state',
                common: {
                        name : 'chargeCancel',
                        type : 'boolean',
                        role : 'button',
                        ack : true
                },
                native : {}
        });
        adapter.setObjectNotExists(globalParams.zoe_vin+".chargeEnable", {
                type : 'state',
                common: {
                        name : 'chargeEnable',
                        type : 'boolean',
                        role : 'button',
                        ack : true
                },
                native : {}
        });




	// read status of button precon and charge
	adapter.getState(globalParams.zoe_vin+".preconNow", function (err, state) {
		if (state!=null && state.val) {
			adapter.log.info("preconNow pressed!!!");
			adapter.setState(globalParams.zoe_vin+".preconNow",false,true); // set back to false
			startStopPrecon(globalParams,true,21);
		}

                globalParams.timeout=setTimeout(function() {
                         adapter.terminate ? adapter.terminate() :process.exit(0);
                        if (globalParams.timeout) clearTimeout(globalParams.timeout);
                }, 10000);
	});

	adapter.getState(globalParams.zoe_vin+".chargeCancel", function (err, state) {
                if (state!=null && state.val) {
                        adapter.log.info("chargeCancel pressed!!!");
                        chargeStartOrCancel(globalParams,false,resetChargeButtons);
                }

                globalParams.timeout=setTimeout(function() {
                         adapter.terminate ? adapter.terminate() :process.exit(0);
                        if (globalParams.timeout) clearTimeout(globalParams.timeout);
                }, 10000);
        });
        adapter.getState(globalParams.zoe_vin+".chargeEnable", function (err, state) {
                if (state!=null && state.val) {
                        adapter.log.info("chargeEnable pressed!!!");
                        chargeStartOrCancel(globalParams,true,resetChargeButtons);
                }

                globalParams.timeout=setTimeout(function() {
                         adapter.terminate ? adapter.terminate() :process.exit(0);
                        if (globalParams.timeout) clearTimeout(globalParams.timeout);
                }, 10000);
        });
}

function resetChargeButtons(globalParams) {
	adapter.setState(globalParams.zoe_vin+".chargeEnable",false,true);
	adapter.setState(globalParams.zoe_vin+".chargeCancel",false,true); 
}


function startStopPrecon(globalParams,startIt,temperature) {
	var methodName = "startStopPrecon";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
			'/kamereon/kca/car-adapter/v1/cars/' + globalParams.zoe_vin + '/actions/hvac-start'+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"post",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey,
			'Content-Type':'application/vnd.api+json'
		},
		json: {
			data: {
				'type': 'HvacStart',
                		'attributes': {
					'action': startIt?'start':'stop',
					'targetTemperature': temperature
				}
			}
		}
	};
	adapter.log.info("startStopPrecon-url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from startStopPrecon service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
  		} else {
			adapter.log.debug('Data received from startStopPrecon service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("startStopPrecon:"+JSON.stringify(data));
		}
	});
}

function chargeStartOrCancel(globalParams,startIt,onSuccess) {
	var methodName = "chargeStartOrCancel";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.kamereonrooturl + 
			'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
			'/kamereon/kca/car-adapter/v1/cars/' + globalParams.zoe_vin + '/actions/charge-mode'+
			'?country='+ encodeURIComponent(globalParams.country),
		method:"post",
		headers: {
    			'x-gigya-id_token': globalParams.gigya_jwttoken,
    			'apikey': globalParams.kamereonapikey,
			'Content-Type':'application/vnd.api+json'
		},
		json: {
			data: {
				'type': 'ChargeMode',
                		'attributes': {
					'action': startIt?'always_charging':'schedule_mode'
				}
			}
		}
	};
	adapter.log.info("chargeStartOrCancel-url:"+params.url);

	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from chargeStartOrCancel service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
  		} else {
			adapter.log.debug('Data received from chargeStartOrCancel service');
			var data = body;
			if (typeof body == "string") data=JSON.parse(body); 
			adapter.log.info("chargeStartOrCancel:"+JSON.stringify(data));

			if (startIt) {
				// trigger charge-start
				params.url=globalParams.kamereonrooturl + 
				'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
				'/kamereon/kca/car-adapter/v1/cars/' + globalParams.zoe_vin + '/actions/charging-start'+
				'?country='+ encodeURIComponent(globalParams.country);
				
				params.json={
					data: {
						'type': 'ChargingStart',
                				'attributes': {
                    					'action': 'start'
                				}
					}		
				};
				
				request(params, function (error, response, body) {
		  			if (error || response.statusCode != 200) {
	  					adapter.log.error('No valid response from chargeStartOrCancel2 service');
						adapter.log.info('error:'+error);
						adapter.log.info('response:'+JSON.stringify(response));
	  				} else {
						adapter.log.debug('Data received from chargeStartOrCancel2 service');
						data = body;
						if (typeof body == "string") data=JSON.parse(body); 
						adapter.log.info("chargeStartOrCancel2:"+JSON.stringify(data));
						onSuccess(globalParams);
					}
				});
				
			} else {
				// Set start time to configured parameter
				params.url=globalParams.kamereonrooturl + 
				'/commerce/v1/accounts/'+ globalParams.kamereonaccountid+
				'/kamereon/kca/car-adapter/v2/cars/' + globalParams.zoe_vin + '/actions/charge-schedule'+
				'?country='+ encodeURIComponent(globalParams.country);
				
				var startTimeString='T';
				if (globalParams.stopChargeWorkaroundHour<10) startTimeString+='0';
				startTimeString+=globalParams.stopChargeWorkaroundHour+':00Z';
				adapter.log.info('startTimeString:'+startTimeString);
				
				params.json={
					data: {
						'type': 'ChargeSchedule',
                				'attributes': {
							'schedules': [{'id':1,'activated':true,
								'monday':{'startTime':startTimeString,'duration':15},
								'tuesday':{'startTime':startTimeString,'duration':15},
								'wednesday':{'startTime':startTimeString,'duration':15},
								'thursday':{'startTime':startTimeString,'duration':15},
								'friday':{'startTime':startTimeString,'duration':15},
								'saturday':{'startTime':startTimeString,'duration':15},
								'sunday':{'startTime':startTimeString,'duration':15}
								}]
						}
					}		
				};
				
				request(params, function (error, response, body) {
		  			if (error || response.statusCode != 200) {
	  					adapter.log.error('No valid response from chargeStartOrCancel2 service');
						adapter.log.info('error:'+error);
						adapter.log.info('response:'+JSON.stringify(response));
	  				} else {
						adapter.log.debug('Data received from chargeStartOrCancel2 service');
						data = body;
						if (typeof body == "string") data=JSON.parse(body); 
						adapter.log.info("chargeStartOrCancel2:"+JSON.stringify(data));
						onSuccess(globalParams);
					}
				});
			} // if (!startIt)
		}
	});
}

function setValue(baseId,name,type,value,role) {
	var id=baseId+"."+name;
	adapter.setObjectNotExists(id, {
		type : 'state',
		common : {
			name : name,
			type : type,
			role : role,
			ack : true
		},
		native : {}
	});


	adapter.setState(id, {
		val : value,
		ack : true
	});
}



function setDevices(result) {
	var methodName = "setDevices";
	adapter.log.debug("in:  " + methodName);

	var i = 0;
	var deviceId = "";

	while (result.a[i] != undefined) {

		var deviceName = result.a[i]["#"].trim();
		var href = result.a[i]["href"];
		var deviceId = getHrefParamValue(href, "deviceid");

		adapter.log.debug(deviceName + ": " + deviceId);

		adapter.setObjectNotExists(deviceId, {
		  type : 'device',
		  common : {
		    name : deviceName,
		    type : 'string',
		    role : 'sensor',
		    ack : true
		  },
		  native : {}
		});
		
		i++;
	}

	adapter.log.debug("out: " + methodName);
}

function setObjects(result) {
	var methodName = "setObjects";
	adapter.log.debug("in:  " + methodName);

	var i = 0;
	var deviceId = "";

	while ((result.a[i] != undefined || result.h4[i] != undefined || result.h5[i] != undefined)) {

		if (result.h4[i] != undefined && result.h4[i] != undefined) {
			var key = result.h5[i];
			var value = result.h4[i];

			if (key == "ID") {
				deviceId = value;

			} else {
				var normalizedKey = normalize(key);
				adapter.setObjectNotExists(deviceId + "." + normalizedKey, {
				  type : 'state',
				  common : {
				    name : key,
				    type : 'string',
				    role : 'data',
				    ack : true
				  },
				  native : {}
				});

			}

		}

		i++;
	}

	adapter.log.debug("out: " + methodName);
}

function setStates(result) {
	var methodName = "setStates";
	adapter.log.debug("in:  " + methodName);

	var i = 0;
	var deviceId = "";

	while ((result.a[i] != undefined || result.h4[i] != undefined || result.h4[i] != undefined)) {

		if (result.h4[i] != undefined && result.h4[i] != undefined) {
			var key = result.h5[i];
			var value = result.h4[i];

			if (key == "ID") {
				deviceId = value;
			} else {
				adapter.setState(deviceId + "." + normalize(key), {
				  val : formatNum(value),
				  ack : true
				});
			}
		}

		i++;
	}

	adapter.log.debug("out: " + methodName);
}

// Utils

function formatNum(s) {

	if (extractNumbers == undefined) {
		var extractNumbers = adapter.config.extractNumbers;
		if (extractNumbers && patternNumber == undefined) {
			var patternNumber = /^(-|\+)?\d+(,|\.)?\d* *(C|F|%)$/;
		}
	}

	if (extractNumbers && patternNumber.test(s)) {
		s = s.replace(" ", "");
		s = s.replace("C", "");
		s = s.replace("F", "");
		s = s.replace("%", "");
		s = s.replace(",", ".");
		s = parseFloat(s);
		//s = ("" + s).replace(".", ",");
	}
	return s;
}

function normalize(s) {
	s = s.toLowerCase();
	s = s.replace(" ", "_");
	s = s.replace("ä", "ue");
	s = s.replace("ö", "oe");
	s = s.replace("ü", "üe");
	s = s.replace("ß", "ss");
	return s;
}

function getHrefParamValue(href, paramName) {
	var paramValue;
	var params = href.split("?")[1];

	params = params.split("&");
	for (var i = 0; i < params.length; i++) {
		var param = params[i].split("="); // ['this','true'], ...
		if (param[0] == paramName) {
			paramValue = param[1];
			break;
		}
	}
	return paramValue;
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}


