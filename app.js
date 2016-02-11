var start = require('./startup.js');
var ble = require('./ble_echo.js');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;


async.waterfall([
	function(cb) {
		//console.log('1');
		// find out if this is the first time we run this script after a startup
		fs.readdir('/home/root/eze/', cb);
	},
	function(files, cb) {
		//console.log('2');
		// if it is there will be a file 'test.js' created by a startup script
		// which is /etc/init.d/bootup.sh, run at startup
		if (files.indexOf('test.js') > -1) {
			exec('rm test.js', cb(null, 'rm test.js'));
		} else  {
			// if it's not the first time you've started the bluetooth device
			// you need to run this. this is the reason for the file checking at startup
			exec('hciconfig hci0 down', cb(null, 'hciconfig hci0 down'));
		}
	},
	function(result, cb) {
		//console.log('3');
		console.log('DONE: ' + result);
		// these commands setup the Edison to accept Bluetooth connections
		// see startup.js
		start.runStartupCmds(0, cb());
	},
	function(cb) {
		//console.log('4');
		// this uses the bleno module to listen for bluetooth events
		// it also launches the wifi configuration
		// see ble_echo.js + wifi.js
		var ble_end = ble.start();
		if (ble_end === 'error') cb(err);
		if (ble_end === 'good')  cb(null);
	},
	function(cb) {
		// once connected, test our connection by pinging google
		// see ble_echo.js
		ble.ping();
	}
], function(err, results) {
	err ? console.log(err.toString('utf8')) : console.log(results);
});
