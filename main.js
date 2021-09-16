/* jshint -W097 */// jshint strict:false
/* jslint node: true */
"use strict";

//var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
const utils = require('@iobroker/adapter-core');
var request = require('request');

// error codes
const ZOEERROR_NONEXTSTEP         = 1;
const ZOEERROR_UNCORRECT_RESPONSE = 2;
const ZOEERROR_UNPARSABLE_JSON    = 3;


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
    return processNextStep({}, 0);
}

// try to JSON-Parse the given variable if it is a string
// return: object or false on error
function safeJSONParse(variable) {
    try {
        if (typeof variable == "string") variable=JSON.parse(variable); 
        return variable;
    } catch {
        return false;
    }
}

// must be called first to initialize all parameters
// curStep is typically set to 0    
function globalInit(curStep) {
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
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from Renault server');
			return processingFailed(globalParams, 0, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from Renault server');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);

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

			processNextStep(globalParams, curStep);
		}
	});

	adapter.log.debug("out: " + methodName);
}

// called on success, start next step
function processNextStep(globalParams, curStep) {
	adapter.log.debug("in: processNextStep, curStep: "+ curStep);
    var nextStep = curStep + 1;

    // only one shot if curStep = -1 (for debugging or testing)
    if (curStep==-1) return;
    
    switch(nextStep) {
        case  1: return globalInit           (nextStep);
        case  2: return loginToGigya         (globalParams, nextStep);
        case  3: return gigyaGetJWT          (globalParams, nextStep);
        case  4: return gigyaGetAccount      (globalParams, nextStep);
        case  5: return getKamereonAccount   (globalParams, nextStep);																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																					
        case  6: return getKamereonCars      (globalParams, nextStep);
        case  7: return getBatteryStatus     (globalParams, nextStep);
        case  8: return getCockpit           (globalParams, nextStep);
        case  9: return getLocation          (globalParams, nextStep);
        case 10: return getHVACStatus        (globalParams, nextStep);
        case 11: return initCheckPreconAndCharge (globalParams, nextStep);
        case 12: return checkPreconNow       (globalParams, nextStep);
        case 13: return checkChargeCancel    (globalParams, nextStep);
        case 14: return checkChargeEnable    (globalParams, nextStep);
        
        case 15: return processingFinished   (globalParams, nextStep);

        default: return processingFailed(globalParams, curStep, ZOEERROR_NONEXTSTEP);
    }
}

// called on error, exiting with error code
function processingFailed(globalParams, curStep, errorCode) {
    // check if failing in step is ok
    if (errorCode==ZOEERROR_UNCORRECT_RESPONSE && globalParams.ignoreApiError) {
        switch(curStep) {
            case  7: return processNextStep(globalParams, curStep);
            case  8: return processNextStep(globalParams, curStep);
            case  9: return processNextStep(globalParams, curStep);
            case 10: return processNextStep(globalParams, curStep);
            default: break;
        }
    }
	adapter.log.debug("in: processingFailed, curStep: "+ curStep);
    adapter.log.error('Error in step '+curStep+', errorCode: '+errorCode);
    adapter.terminate ? adapter.terminate(1) :process.exit(1);
}

// finished processing successfull
function processingFinished(globalParams, curStep) {
    adapter.terminate ? adapter.terminate() :process.exit(0);
}


function loginToGigya(globalParams, curStep) {
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

	request(params, function (error, response, body) {
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from gigyarooturl server');
  			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from gigyarooturl server');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("FullBody:"+JSON.stringify(data));

			var sessionInfo=data.sessionInfo;
			adapter.log.info("sessionInfo:"+JSON.stringify(sessionInfo));

			globalParams.gigyatoken=sessionInfo.cookieValue;
			processNextStep(globalParams, curStep);
		}
	});
}

function gigyaGetJWT(globalParams, curStep) {
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

	request(params, function (error, response, body) {
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from gigyaGetJWT service');
  			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from gigyaGetJWT service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("getJWTFullbody:"+JSON.stringify(data));
			globalParams.gigya_jwttoken=data.id_token;
			adapter.log.info("gigya_jwttoken:"+globalParams.gigya_jwttoken);
			processNextStep(globalParams, curStep);
		}
	});
	adapter.log.debug("out: " + methodName);
}

function gigyaGetAccount(globalParams, curStep) {
	var methodName = "gigyaGetAccount";
	adapter.log.debug("in:  " + methodName + " v0.01");

	var params={
		url:globalParams.gigyarooturl + 
			'/accounts.getAccountInfo?login_token=' + encodeURIComponent(globalParams.gigyatoken) + 
			'&ApiKey=' + encodeURIComponent(globalParams.gigyaapikey),
		method:"get"
	};

	request(params, function (error, response, body) {
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from gigyagetAccountInfo service');
  			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from gigyagetAccountInfo service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("getgetAccountInfo:"+JSON.stringify(data));
			globalParams.kamereonpersonid=data.data.personId;
			adapter.log.info("kamereonpersonid:"+globalParams.kamereonpersonid);
			processNextStep(globalParams, curStep);
		}
	});
	adapter.log.debug("out: " + methodName);
}

function getKamereonAccount(globalParams, curStep) {
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

	request(params, function (error, response, body) {
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from getKamereonAccount service');
  			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from getKamereonAccount service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("getKamereonAccount:"+JSON.stringify(data));
			var accounts=data.accounts;
			adapter.log.info("accounts:"+JSON.stringify(accounts));
			globalParams.kamereonaccountid=accounts[0].accountId;
			adapter.log.info("kamereonaccountid:"+globalParams.kamereonaccountid);
			processNextStep(globalParams, curStep);
		}
	});
	adapter.log.debug("out: " + methodName);
}

function getKamereonCars(globalParams, curStep) {
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

	request(params, function (error, response, body) {
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from getKamereonCars service');
  			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from getKamereonCars service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("getKamereonCars:"+JSON.stringify(data));
			processNextStep(globalParams, curStep);
		}
	});
	adapter.log.debug("out: " + methodName);
}

function getBatteryStatus(globalParams, curStep) {
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
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from getBatteryStatus service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
            return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from getBatteryStatus service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
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
			    var bts=new Date(batteryTS);
				setValue(globalParams.zoe_vin,"batteryTS","string",bts.toString(),"date");
			} else {
				setValue(globalParams.zoe_vin,"batteryTS","string",null,"date");
			}
			

			if (!charging) {
				chargingPower = 0;
				remaining_time = 0;
			}
				

			if (remaining_time === undefined || remaining_time === null) remaining_time = 0;
			var chargingFinishedAt=new Date(Date.now() + remaining_time * 60000);
			if (remaining_time == 0) chargingFinishedAt=null;
			var cfa='9999-12-31';
			if (remaining_time > 0) cfa=chargingFinishedAt.toString(); 
			adapter.log.info('remaining_time:'+remaining_time);
			adapter.log.info('cfa:'+cfa);

			if (!charging) chargingPower = 0;

            setValue(globalParams.zoe_vin,"charge_level","number",charge_level,"data");
            setValue(globalParams.zoe_vin,"remaining_range","number",remaining_range,"data");
            setValue(globalParams.zoe_vin,"remaining_time","number",remaining_time),"data";
            setValue(globalParams.zoe_vin,"charging_finished_at","string",cfa,"date");
            setValue(globalParams.zoe_vin,"plugged","boolean",plugged,"data");
            setValue(globalParams.zoe_vin,"charging","boolean",charging,"data");
            setValue(globalParams.zoe_vin,"batteryTemperature","number",batteryTemperature,"data");
            setValue(globalParams.zoe_vin,"chargingPower","number",chargingPower,"data");
            setValue(globalParams.zoe_vin,"batteryCapacity","number",batteryCapacity,"data");
            setValue(globalParams.zoe_vin,"batteryAvailableEnergy","number",batteryAvailableEnergy,"data");
			processNextStep(globalParams, curStep);
		}
	});
}

function getCockpit(globalParams, curStep) {
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
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from getCockpit service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
            return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from getCockpit service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("getCockpit:"+JSON.stringify(data));

			var totalMileage=data.data.attributes.totalMileage;
			if (totalMileage !== undefined) setValue(globalParams.zoe_vin,"totalMileage","number",totalMileage,"data");
			processNextStep(globalParams, curStep);
		}
	});
	adapter.log.debug("out: " + methodName);
}

function getLocation(globalParams, curStep) {
	var methodName = "getLocation";
	adapter.log.debug("in:  " + methodName + " v0.01");
	if (!globalParams.useLocationApi) {
		adapter.log.info(methodName+" not enabled in config");
		return processNextStep(globalParams, curStep);
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
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from getLocation service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
            return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from getLocation service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("getLocation:"+JSON.stringify(data));
			
			var gpsLatitude=data.data.attributes.gpsLatitude;
			adapter.log.info('gpsLatitude:'+gpsLatitude);
			if (gpsLatitude !== undefined) setValue(globalParams.zoe_vin,"gpsLatitude","number",gpsLatitude,"data");

			var gpsLongitude=data.data.attributes.gpsLongitude;
			adapter.log.info('gpsLongitude:'+gpsLongitude);
			if (gpsLongitude !== undefined) setValue(globalParams.zoe_vin,"gpsLongitude","number",gpsLongitude,"data");
			processNextStep(globalParams, curStep);
		}
	});
}


function getHVACStatus(globalParams, curStep) {
	var methodName = "getHVACStatus";
	adapter.log.debug("in:  " + methodName + " v0.01");

	if (!globalParams.useHVACApi) {
		adapter.log.info(methodName+" not enabled in config");
		return processNextStep(globalParams, curStep);
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
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from getHVACStatus service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from getHVACStatus service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("getHVACStatus:"+JSON.stringify(data));

			var attributes=data.data.attributes;
			var hvacOn=attributes.hvacStatus!="off";

			setValue(globalParams.zoe_vin,"externalTemperature","number",attributes.externalTemperature,"data");
                        setValue(globalParams.zoe_vin,"hvacOn","boolean",hvacOn,"data");
			processNextStep(globalParams, curStep);
		}
	});
	adapter.log.debug("out: " + methodName);
}

function initCheckPreconAndCharge(globalParams, curStep) {
	var methodName = "initCheckPreconAndCharge";
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
    processNextStep(globalParams, curStep);
}

function checkPreconNow(globalParams, curStep) {
	var methodName = "checkPreconNow";
	adapter.log.debug("in:  " + methodName + " v0.01");
	adapter.getState(globalParams.zoe_vin+".preconNow", function (err, state) {
		if (state!=null && state.val) {
			adapter.log.info("preconNow pressed!!!");
			adapter.setState(globalParams.zoe_vin+".preconNow",false,true); // set back to false
			startStopPrecon(globalParams,true,21, curStep);
		    processNextStep(globalParams, curStep);
		} else {
		    processNextStep(globalParams, curStep);
        }
	});
}

function checkChargeCancel(globalParams, curStep) {
	var methodName = "checkChargeCancel";
	adapter.log.debug("in:  " + methodName + " v0.01");
	adapter.getState(globalParams.zoe_vin+".chargeCancel", function (err, state) {
        if (state!=null && state.val) {
            adapter.log.info("chargeCancel pressed!!!");
            chargeStartOrCancel(globalParams,false,resetChargeButtons, curStep);
		    processNextStep(globalParams, curStep);
		} else {
		    processNextStep(globalParams, curStep);
        }
    });
}

function checkChargeEnable(globalParams, curStep) {
	var methodName = "checkChargeEnable";
	adapter.log.debug("in:  " + methodName + " v0.01");
    adapter.getState(globalParams.zoe_vin+".chargeEnable", function (err, state) {
        if (state!=null && state.val) {
            adapter.log.info("chargeEnable pressed!!!");
            chargeStartOrCancel(globalParams,true,resetChargeButtons, curStep);
		    processNextStep(globalParams, curStep);
		} else {
		    processNextStep(globalParams, curStep);
        }
    });
}

function resetChargeButtons(globalParams) {
	adapter.setState(globalParams.zoe_vin+".chargeEnable",false,true);
	adapter.setState(globalParams.zoe_vin+".chargeCancel",false,true); 
}


function startStopPrecon(globalParams,startIt,temperature,curStep) {
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
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from startStopPrecon service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
  			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from startStopPrecon service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
			adapter.log.info("startStopPrecon:"+JSON.stringify(data));
		}
	});
}

function chargeStartOrCancel(globalParams,startIt,onSuccess, curStep) {
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
	  	if (error || !response || response.statusCode != 200) {
  			adapter.log.error('No valid response from chargeStartOrCancel service');
			adapter.log.info('error:'+error);
			adapter.log.info('response:'+JSON.stringify(response));
  			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
  		} else {
			adapter.log.debug('Data received from chargeStartOrCancel service');
			var data = safeJSONParse(body);
			if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
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
		  			if (error || !response || response.statusCode != 200) {
	  					adapter.log.error('No valid response from chargeStartOrCancel2 service');
						adapter.log.info('error:'+error);
						adapter.log.info('response:'+JSON.stringify(response));
              			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
	  				} else {
						adapter.log.debug('Data received from chargeStartOrCancel2 service');
			            var data = safeJSONParse(body);
			            if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
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
		  			if (error || !response || response.statusCode != 200) {
	  					adapter.log.error('No valid response from chargeStartOrCancel2 service');
						adapter.log.info('error:'+error);
						adapter.log.info('response:'+JSON.stringify(response));
              			return processingFailed(globalParams, curStep, ZOEERROR_UNCORRECT_RESPONSE);
	  				} else {
						adapter.log.debug('Data received from chargeStartOrCancel2 service');
			            var data = safeJSONParse(body);
			            if (data===false) return processingFailed(globalParams, 0, ZOEERROR_UNPARSABLE_JSON);
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


