/*
 Simple bleno echo server
 Author: Shawn Hymel
 Date: November 22, 2015

 Creates a Bluetooth Low Energy device using bleno and offers
 one service with one characteristic. Users can use a BLE test
 app to read, write, and subscribe to that characteristic. 
 Writing changes the characteristic's value, reading returns that
 value, and subscribing results in a string message every 1 second.

 This example is Beerware (https://en.wikipedia.org/wiki/Beerware).
 */
var async = require('async');
var exports = module.exports = {};
var fs = require('fs');
var exec = require('child_process').exec;

function writeWPAconfig(callback) {
	var files = fs.readdirSync('/etc/wpa_supplicant/');	
	if (files.indexOf('wpa_supplicant.conf') > 0) {
		exec('rm wpa_supplicant.conf', function() {
				
		});
	}
}

var start = function() {
// using the bleno module
var bleno = require('bleno');


// set the device name unique string 
process.env['BLENO_DEVICE_NAME'] = 'edison_1235';

// once bleno starts, begin advertising our BLE address
bleno.on('stateChange', function(state) {
	console.log('State change: ' + state);
	if (state === 'poweredOn') {
		bleno.startAdvertising(process.env['BLENO_DEVICE_NAME'], ['12ab']);
	} else {
		console.log('stopped advertising!');
		bleno.stopAdvertising();
	}
});

// notify the console that we've accepted a connection
bleno.on('accept', function(clientAddress) {
	console.log('Accepted connection from address: ' + clientAddress);
});

// notify the console that we've disconnected from a client
bleno.on('disconnect', function(clientAddress) {
	console.log('Disconnected from address: ' + clientAddress);
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
							this.value = data;
							var readStr = this.value.toString('utf-8').trim();
							console.log('Write request: value = ' + readStr);
							callback(this.RESULT_SUCCESS);
							// Center device should send string w/ format "wifi,<SSID>,<pswd>"
							// split
							if (readStr.length > 1) {
								var strArray = readStr.split(',');
								if (strArray[0] == 'wifi') {
									console.log("here, sucka");
									writeWPAconfig();
								}
							}
							// execute commands
							// reset wlan0
							// ping
							// send confirmation
							// update opkg

						}
					})
				]
			})
		]);
	}
});
};


exports.start = start;