var fs = require('fs');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var async = require('async');
var ping = require('net-ping');

function buildContents(SSID, psk) {
	var data = [];
	 data[0] = [
		"ctrl_interface=/var/run/wpa_supplicant",
		"ctrl_interface_group=0",
		"config_methods=virtual_push_button virtual_display push_button keypad",
		"update_config=1",
		"fast_reauth=1",
		"device_name=Edison",
		"manufacturer=Intel",
		"model_name=Edison"
	].join("\n");

	data[1] = [
		"network={",
		"  ssid=\"" + SSID + "\"",
		"  psk=\"" + psk + "\"",
		"  key_mgmt=WPA-PSK",
		"  pairwise=CCMP TKIP",
		"  group=CCMP TKIP WEP104 WEP40",
		"  eap=TTLS PEAP TLS",
		"}"
	].join("\n");
	
	return data.join("\n\n");
}


function ping(callback) {
	console.log('ping a ling ding dong.');
	return callback;
}


function configure(SSID, psk) {
	async.waterfall([
		function(cb) {
			console.log('writing new conf file...');
			var dataString = buildContents(SSID, psk);
			fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', dataString, 'utf8', cb);
		},
		function(cb) {
			console.log('wlan0 going up');
			exec('ifconfig wlan0 up', cb);
		},
		function(err, stdout, cb) {
			if (err) console.log('err @ wlan0 up: ' + err);
			if (stdout) console.log('stdout @ wlan0 up: ' + stdout);
			console.log('killing wpa processes');
			execSync('ps', function(err, stdout, sterr) {
				var list = stdout.split("\n");
				for (var i=0; i<list.length; i++) {
					s = list[i];
					if (s.indexOf('wpa_supplicant') > -1) {
						exec('killall wpa_supplicant', function(err, stdout, stderr) {
							console.log('process killed');
							cb(null);
						});
					}	 
				}
			});
			console.log('no process found, moving on...'); 
			cb(null);
		},
		function(cb) {
			console.log('restarting wpa...');
			var p = spawnSync('wpa_supplicant', ['-i', 'wlan0', '-D', 'nl80211', '-c', '/etc/wpa_supplicant/wpa_supplicant.conf', '-B']);
			cb(null, p);
		},
		function(p, cb) {
			console.log('p.stdout: ' + p.stdout.toString('utf8'));
			console.log('p.status: ' + p.status);
			if (p.error) console.log('p.error: ' + p.error);
			console.log('obtaining dhcp lease...');
			spawnSync('udhcpc', ['-i', 'wlan0', '-v']);
			cb(null);
		}
	], 
	function(err, results){
		if (err) {
			console.log("Waterfall Error: " + err.toString('utf8'));
			return 'error';
		} else {
			console.log('WiFi config setup complete.');
			return 'good';
		}
	});
}



//configure("Human Condition Global 5GHz", "2900fl0z");
//buildContents();
exports.config = configure;
exports.ping = ping;

