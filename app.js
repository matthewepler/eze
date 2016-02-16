var startup = require('./startup.js');
var ble = require('./ble_echo.js');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var wifi = require('./wifi.js');


function start() {
	checkFirstTime(); 			// see func def below	
	startup.runStartupCmds();   // see startup.js
	ble.start();			    // see ble_echo.js line 103
}

function checkFirstTime() {
	var files = fs.readdirSync('/home/root/eze/');

	if (files.indexOf('test.js') > -1) {
		exec('rm test.js', function(err, stdout, stderr) {
			if (err) {
				console.log(err);
			} else {
				if (stdout) console.log(stdout);
				console.log('temp file removed');
			}
		});
	} else  {
		exec('hciconfig hci0 down', function(err, stdout, stderr) {
			if (err) {
				console.log(err);	
			} else {
				if (stdout) console.log(stdout);	
				console.log('DONE: hciconfig hci0 down');
			}
		});
	}
}

start();
