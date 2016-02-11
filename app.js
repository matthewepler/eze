var start = require('./startup.js');
var ble = require('./ble_echo.js');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;


async.waterfall([
	function(cb) {
		//console.log('1');
		fs.readdir('/home/root/eze/', cb);
	},
	function(files, cb) {
		//console.log('2');
		//console.log(files);
		if (files.indexOf('test.js') > -1) {
			exec('rm test.js', cb(null, 'rm test.js'));
		} else  {
			exec('hciconfig hci0 down', cb(null, 'hciconfig hci0 down'));
		}
	},
	function(result, cb) {
		//console.log('3');
		console.log('DONE: ' + result);
		start.runStartupCmds(0, cb());
	},
	function(cb) {
		//console.log('4');
		ble.start(cb);
	},
	function(cb) {
		ble.ping(cb);
	}
], function(err, results) {
	err ? console.log(err.toString('utf8')) : console.log(results);
});
