/* jshint -W097 */// jshint strict:false
/* jslint node: true */
"use strict";

var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file
// name excluding extension
// adapter will be restarted automatically every time as the configuration
// changed, e.g system.adapter.mobile-alerts.0
var adapter = utils.adapter('zoe');

// is called when adapter shuts down - callback has to be called under any
// circumstances!
adapter.on('unload', function(callback) {
	try {
		adapter.log.debug('cleaned everything up...');
		callback();
	} catch (e) {
		callback();
	}
});

// is called if a subscribed object changes
adapter.on('objectChange', function(id, obj) {
	// Warning, obj can be null if it was deleted
	adapter.log.debug('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function(id, state) {
	// Warning, state can be null if it was deleted
	
	adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));

	// you can use the ack flag to detect if it is status (true) or command
	// (false)
	if (state && !state.ack) {
		adapter.log.debug('ack is not set!');
	}
});

// Some message was sent to adapter instance over message box. Used by email,
// pushover, text2speech, ...
adapter.on('message', function(obj) {
	if (typeof obj == 'object' && obj.message) {
		if (obj.command == 'send') {
			// e.g. send email or pushover or whatever
			console.log('send command');

			// Send response in callback if required
			if (obj.callback)
				adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
		}
	}
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function() {
	main();
});

function main() {
	var methodName = "main";
	adapter.log.debug("in:  " + methodName + " v1.00");

	// All states changes inside the adapter's namespace are subscribed
	adapter.subscribeStates('*');

	var zoe_username = adapter.config.username;
	var zoe_password = adapter.config.password;
	var zoe_vin      = adapter.config.vin;

	adapter.log.info("Username:"+zoe_username);
	//adapter.log.info("Password:"+zoe_password);
	adapter.log.info("VIN:"     +zoe_vin     );
	
	var params={
		url:"https://www.services.renault-ze.com/api/user/login",
		method:"post",
		json: { username: zoe_username, password: zoe_password }
		
	};
	request(params, function (error, response, body) {
	  	if (error || response.statusCode != 200) {
  			adapter.log.error('No valid response from Renault server');
  		} else {
			adapter.log.debug('Data received from Renault server');
			var data = body;
			var token = data.token;
			adapter.log.info("token: "+token);
			fetchCarDetails(token,zoe_username,zoe_password,zoe_vin);
		}
	});

	// Force terminate
	setTimeout(function() {
		adapter.log.error('Termination forced due to timeout !');
		process.exit(1);
	}, 3 * 60 * 1000);

	adapter.log.debug("out: " + methodName);
}

function fetchCarDetails(token,zoe_username,zoe_password,zoe_vin) {
	var url="https://www.services.renault-ze.com/api/vehicle/"+zoe_vin+"/battery";
	adapter.log.info("fetchCarDetails user:"+zoe_username);
	adapter.log.info("fetchCarDetails url:"+url);

	var params={
		url:url,
		json:"",
		method:"get",
		auth:{bearer:token}
	};

	request(params, function (error, response, body) {
		if (error || response.statusCode != 200) {
			adapter.log.error('fetchCarDetails: No valid response from Renault server');
		} else {
			adapter.log.debug('Data received from Renault server');
			var data=body;
			if (typeof body == "string") data=JSON.parse(body); 

			var charge_level   =data.charge_level;
			var plugged        =data.plugged;
			var charging       =data.charging;
			var remaining_range=data.remaining_range;
			var remaining_time =data.remaining_time;
			if (remaining_time === undefined) remaining_time = 0;

			adapter.log.info("Data from Server: "+charge_level+";"+plugged+";"+charging+";"+remaining_range+";"+remaining_time);
			adapter.log.info("FullBody:"+body.toString());

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
			setValue(zoe_vin,"charge_level","float",charge_level);
			setValue(zoe_vin,"remaining_range","float",remaining_range);
			setValue(zoe_vin,"remaining_time","float",remaining_time);
			setValue(zoe_vin,"plugged","boolean",plugged);
			setValue(zoe_vin,"charging","boolean",charging);

		        setTimeout(function() {
                		process.exit(0);
        		}, 10000);
		}
	});
}

function setValue(baseId,name,type,value) {
	var id=baseId+"."+name;
	adapter.setObjectNotExists(id, {
		type : 'state',
		common : {
			name : name,
			type : type,
			role : 'data',
			ack : true
		},
		native : {}
	});


	adapter.setState(id, {
		val : value,
		ack : true
	});
}


function parseData(xml) {
	var methodName = "parseData";
	adapter.log.debug("in:  " + methodName);
	adapter.log.debug("parameter: xml: " + xml);

	if (!xml) {
		setTimeout(function() {
			process.exit(0);
		}, 5000);
		return;
	}

	var options = {
	  explicitArray : false,
	  mergeAttrs : true
	};

	var parser = new xml2js.Parser(options);
	parser.parseString(xml, function(err, result) {

		if (err || result == undefined || (result.a == undefined || result.h4 == undefined || result.h5 == undefined)) {
			var msg;
			if (err) {
				msg = err;
			} else {
				adapter.log.debug("result: " + JSON.stringify(result));
				msg = "Matching HTML tags not found";
			}
			adapter.log.error("parseString error: " + msg);

		} else {

			adapter.log.debug("result: " + JSON.stringify(result));

			setDevices(result);
			setObjects(result);
			setStates(result);
		}

	});

	setTimeout(function() {
		process.exit(0);
	}, 10000);

	adapter.log.debug("out: " + methodName);

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
