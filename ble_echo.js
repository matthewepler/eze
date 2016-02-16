/*
 Based on 'Simple bleno echo server' by Shawn Hymel
 http://github.com/sandeepmistry/bleno
 Creates a Bluetooth Low Energy device using bleno and offers
 one service with one characteristic.  */

var exports = module.exports = {};
var os = require('os');
var wifi = require('./wifi.js');

var start = function(cb) {

	// using the bleno module
	var bleno = require('bleno'); 

	// device should have a unique name - use 'configure_edison --setup' to do this
	process.env['BLENO_DEVICE_NAME'] = os.hostname();

	// once bleno starts, begin advertising our BLE address
	bleno.on('stateChange', function(state) {
		console.log('State change: ' + state);
		if (state === 'poweredOn') {
			// this advertises the name, UUID (2nd param), and also the MAC address of the Edison 
			bleno.startAdvertising(process.env['BLENO_DEVICE_NAME'], ['12ab']);
		} else {
			console.log('stopped advertising!');
			bleno.stopAdvertising();
		}
	});

	bleno.on('accept', function(clientAddress) {
		console.log('Accepted connection from address: ' + clientAddress);
	});

	bleno.on('disconnect', function(clientAddress) {
		console.log('Disconnected from address: ' + clientAddress);
		// kill the app - change later if necessary
		process.exit();
	});

	// when we begin advertising, create a new service and characteristic
	bleno.on('advertisingStart', function(error) {
		if (error) {
			console.log('Advertising start error: ' + error);
		} else {
			console.log("Advertising start success...as \'" + process.env['BLENO_DEVICE_NAME']+"\'" + " UUID = 12ab");
			bleno.setServices([
				
				// define a new service
				new bleno.PrimaryService({
					uuid : '12ab',
					characteristics : [

						// define a new characteristic within that service
						new bleno.Characteristic({
							value: null,
							uuid : '34cd',
							properties : ['notify', 'read', 'write'],

							// if the client subscribes, we send out a message every 1 second
							onSubscribe : function(maxValueSize, updateValueCallback) {
								console.log("Device subscribed");
							//	this.intervalId = setInterval( function() {
							//		console.log("Sending: Hi!");
							//		updateValueCallback(new Buffer("Hi!"));
							//	}, 1000);
							},
							
							// if the client unsubscribes, we stop broadcasting the message
							onUnsubscribe : function() {
									console.log("Device unsubscribed");
									clearInterval(this.intervalId);
								},
								
							// send a message back to the client with the characteristic's value
							onReadRequest : function(offset, callback) {
								console.log('Read request received');
								callback(this.RESULT_SUCCESS, new Buffer("Echo: " + (this.value ? this.value.toString('utf-8') : "")));
							},

							// accept a new value for the characteristic's value
							onWriteRequest : function(data, offset, withoutResponse, callback) {
								// Center device should send string w/ format "wifi,<SSID>,<pswd>"
								this.value = data; 
								var readStr = this.value.toString('utf-8').trim();
								console.log('Write request: value = ' + readStr);
								if (readStr.length > 1) {
									var strArray = readStr.split(',');
									if (strArray[0] == 'wifi') {
										// see wifi.js
										wifi.config(strArray[1], strArray[2], function(response) {
												console.log(response);
												if (response == 'wifigood') {
													// test the wifi connection by pinging Google
													wifi.ping(function(pingResponse) {
														if (pingResponse == 'success') {
															console.log('ping success, sending response');
															callback(this.RESULT_SUCCESS, new Buffer("ping success!"));
															// hopefully they see this Buffer response on their side in an event. We'll see...
															// assuming that works, this process is still running. Now what?
														}
													});
												}
										});
									}
								}
							}
						})
					]
				})
			]);
		}
	});
};

// custom, not currently used. 
function disconnect() {
	bleno.disconnect();
}
function write(msg) {
	bleno.updateValueCallback(new Buffer(msg));
};


exports.start = start;
exports.disconnect = disconnect;
//start();
