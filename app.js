var startup = require('./startup.js');
var ble = require('./ble_echo.js');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;

async.waterfall([
	function(cb) {
		var files = fs.readdirSync('/home/root/eze/');
		cb(null, files);
	},
	function(files, cb) {
		var check;
		if (files.indexOf('test.js') > 0) {
			exec('rm test.js', cb(null, 'rm test.js'));
		} else  {
			exec('hciconfig hci0 down', cb(null, 'hciconfig hci0 down'));
		}
	},
	function(result, cb) {
		console.log('DONE: ' + result);
		startup.runStartupCmds(cb(null, true));
	},
	function(done, cb) {
		done ? ble.start() : cb(new Error('could not run ble.start()'));
	}
], function(err, results) {
	err ? console.log(err) : console.log(results);
});
