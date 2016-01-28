// startup commands

var exec = require('child_process').exec;

var commands = [
	'rfkill unblock bluetooth',
	'hciconfig hci0 up',
	'rm /etc/opkg/base-feeds.conf',
	'echo "src/gz all http://repo.opkg.net/edison/repo/all" >> /etc/opkg/base-feeds.conf',
	'echo "src/gz edison http://repo.opkg.net/edison/repo/edison" >> /etc/opkg/base-feeds.conf',
	'echo "src/gz core2-32 http://repo.opkg.net/edison/repo/core2-32" >> /etc/opkg/base-feeds.conf'
];

function runCmd(errCount) {
	var errCount = errCount || 0;
	var cmd = commands.shift();
	if (!cmd) {
		console.log('bluetooth init complete');
		return;
	}
	if (errCount > 10) {
		throw('too many errors: ' + cmd);
	}

	exec(cmd, function(err, stdout, stderr) {
		if (err || (stdout && commands.length > 0)) {
			commands.unshift(cmd);
			console.log("problem completing " + cmd + " [" + errCount + "}");
			if (err) console.log(err.toString('utf8'));
			errCount += 1;
		} else {
			errCount = 0;
			console.log("DONE: " + cmd);
			if (stdout) console.log(stdout.toString('utf8'));
		}
		runCmd(errCount);
	});
}

runCmd();

// script located at /lib.systemd/system/bluetooth-pair.service
// is resp. for allowing all pairing attempts to succeed ** verify?
// This is the package from Intel forums thread. It is currently NOT INSTALLED.
