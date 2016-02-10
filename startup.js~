// startup commands
var exports = module.exports = {};
var exec = require('child_process').exec;

var commands = [
	'rfkill unblock bluetooth',
	'systemctl disable bluetooth', 
	'hciconfig hci0 up',
	'hcitool dev'
];

function runCmds(errCount) {
	var errCount = errCount || 0;
	var cmd = commands.shift();
	if (!cmd) {
		console.log('bluetooth startup complete');
		return;
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
				//
			}
		}
		runCmds(errCount);
	});
}

//runCmds(); // for running as stand-alone script
exports.runStartupCmds = runCmds;
//exports.MAC = MAC;

