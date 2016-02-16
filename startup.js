// startup commands run as bash commands on the edison
// used to get edison ready to use bluetooth without need of bluetoothctl CLI
// for more info, see the background doc in the repo (Matt to-do)

var exports = module.exports = {};
var exec = require('child_process').exec;

var commands = [
	'rfkill unblock bluetooth',
	'systemctl disable bluetooth', 
	'hciconfig hci0 up',
	'hcitool dev'
];

function runCmds(errCount, callback) {
	var errCount = errCount || 0;
	var cmd = commands.shift();
	if (!cmd) {
		console.log('startup complete');
		callback();
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
				callback(new Error("Bluetooth did not initiate. No MAC address reported from hcitool"));
			} 
		}
		runCmds(errCount, callback);
	});
}

//runCmds(0); 
exports.runStartupCmds = runCmds;

