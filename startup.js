// startup commands
var exports = module.exports = {};
var exec = require('child_process').exec;

var MAC;
var commands = [
	'rfkill unblock bluetooth',
	'hciconfig hci0 down',
//	'systemctl disable bluetooth', // on startup only, should be in app.js (?)
	'hciconfig hci0 up',
//	'hciconfig hci0 piscan',
	'echo "src intel-iotdk http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf',
//	'hciconfig hci0 sspmode',
	'hcitool dev'
];

function runCmds(fn, errCount) {
	var errCount = errCount || 0;
	var cmd = commands.shift();
	if (!cmd) {
		console.log('bluetooth init complete');
		return fn();
	}
	if (errCount > 10) {
		throw('too many errors: ' + cmd);
	}

	exec(cmd, function(err, stdout, stderr) {
		if (err || (stdout && commands.length > 1)) {
			commands.unshift(cmd);
			console.log("problem completing " + cmd + " [" + errCount + "]");
			if (err) console.log(err.toString('utf8'));
			errCount += 1;
		} else {
			errCount = 0;
			console.log("DONE: " + cmd);
			if (stdout) console.log(stdout.toString('utf8'));
			if (commands.length == 0 && stdout == null) {
				throw("Bluetooth did not initiate. No MAC address reported from hcitool");
			} else if (commands.length == 0 && stdout) {
				var tmp = stdout.toString('utf8');
				MAC = tmp.slice(tmp.length - 18);
			}
		}
		runCmds(fn, errCount);
	});
}

//runCmds(); // for running as stand-alone script
exports.runStartupCmds = runCmds;
//exports.MAC = MAC;
//
//fn passed to runCmds to solve synchronous need in app.js. Other option
// would be to use async library's waterfall function or (according to Sanjay),
// using a Promise. If we start adding synchronous functionality to app.js, I
// recommend looking at the async library's waterfall function

