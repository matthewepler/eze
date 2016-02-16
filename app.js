// node modules
var fs = require('fs');
var exec = require('child_process').exec;

// project files
var startup = require('./startup.js');
var ble = require('./ble_echo.js');


function start() {
	checkFirstTime(); 			// see func def below	
	startup.runStartupCmds();   // see startup.js
	ble.start();			    // see ble_echo.js, launches wifi.js
}

function checkFirstTime() {
	// On startup, a script creates an empty file 'test.js' in the project dir.
	// Startup script is located in /etc/init.d
	
	// Look for file. If it exists, it's the first time since bootup we're running
	// the scrip tand need to avoid the hciconfig 'down' command.
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
		// if it's NOT the first time since bootup, we do need to run this
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
