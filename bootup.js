var exec = require('child_process').exec;

exec('systemctl disable bluetooth', function(err, stdout, stderr) {
	if (err) {
		console.log(err);
		throw("ERROR disabling bluetooth. See /home/root/eze/bootup.js");
	}	
	console.log("!!!!>>&&&&<<!!!! bluetooth defaults disabled successfully.");
	process.exit();
});
