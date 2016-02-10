var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

function buildContents( SSID, psk) {
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

function configure( SSID, psk ) {
	async.waterfall([
		function(cb) {
			console.log('reading wpa_supplicant directory...');
			fs.readdir('/etc/wpa_supplicant/', cb);
		}, 
		function(files, cb) {
			console.log('removing configuration file...');
			if (files.indexOf('wpa_supplicant.conf') > -1) {
				exec('rm /etc/wpa_supplicant/wpa_supplicant.conf', cb);
			} else {
				cb(null);
			}
		}, 
		function(cb) {
			console.log('wpa_supplicant.conf deleted');
			var dataString = buildContents(SSID, psk);
			fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', dataString, 'utf8', cb(null));
		},
		function(cb) {
			console.log('wlan0 going up');
			exec('ifconfig wlan0 up', cb);
		},
		function(err, stdout, cb) {
			if (err) console.log('err @ wlan0 up: ' + err);
			if (stdout) console.log('stdout @ wlan0 up: ' + stdout);
			console.log('killing wpa processes');
			exec('killall wpa_supplicant', function(err, stdout, stderr) {
				if (err) {
					console.log(err);
					cb(null);
				} else if (stdout) {
					console.log(stdout);
					cb(null);
				} else {
					cb(null);
				}	
			});	
		},
		function(cb) {
			console.log('restarting wpa...');
			exec('wpa_supplicant -i wlan0 -D nl80211 -c /etc/wpa_supplicant/wpa_supplicant.conf -B', cb);
		},
		function(err, stdout, cb) {
			if (err) console.log(err);
			if (stdout) console.log(stdout);	
			console.log('obtaining dhcp lease...');
			exec('udhcpc -i wlan0', cb);
		},
		function(err, stdout, cb) {
			if (err) console.log(err);
			if (stdout) console.log(stdout);
			cb();
		}
	], 
	function(err, results){
		if (err) console.log("ERROR: " + err);
		// return something here
	});
}

//configure("Human Condition Global 5GHz", "2900fl0z");
//buildContents();
exports.config = configure;

