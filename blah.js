var exec = require('child_process').exec;

function go() {
	exec('ps', function(err, stdout, sterr) {
		var list = stdout;
		var array = list.split("\n");
		//console.log(array);
		for (var i=0; i<array.length; i++) {
			s = array[i];
			if (s.indexOf('wpa_supplicant') > -1) {
				console.log(s);
			}
		}
	});
}

go();
