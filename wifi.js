var fs = require('fs');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var async = require('async');
var ping = require('net-ping');
var exports = module.exports = {};

// this mirrors the default wpa_supplicant.conf file on the edison
// this text is written to a file in the config() func below
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

// called from ble_echo.js after string is received and parsed from center device (phone)
// for more info see background doc in repo
exports.config = function(SSID, psk, callback) {
	console.log('writing new conf file...');
	var dataString = buildContents(SSID, psk); // see above
	fs.writeFileSync('/etc/wpa_supplicant/wpa_supplicant.conf', dataString, 'utf8');
	
	console.log('wlan0 going up');
	execSync('ifconfig wlan0 up');
	
	console.log('killing wpa processes');
	execSync('ps', function(err, stdout, sterr) {
		var list = stdout.split("\n");
		for (var i=0; i<list.length; i++) {
			s = list[i];
			if (s.indexOf('wpa_supplicant') > -1) {
				exec('killall wpa_supplicant', function(err, stdout, stderr) {
					console.log('process killed');
				});
			}	 
		}
	});

	console.log('restarting wpa...');
	var wpa = spawnSync('wpa_supplicant', ['-i', 'wlan0', '-D', 'nl80211', '-c', '/etc/wpa_supplicant/wpa_supplicant.conf', '-B']);
	if (wpa.error) {
		console.log('wpa.error: ' + wpa.error);
		callback( 'error at wpa_supplicant func call in wifi.js' );
	}
	//if (wpa.stdout) console.log('wpa.stdout: ' + wpa.stdout.toString('utf8'));
	if (wpa.status) console.log('wpa.status: ' + wpa.status);
	if (wpa.status == 255) {	
		console.log('obtaining dhcp lease...');
		var udhcpc = spawnSync('udhcpc', ['-i', 'wlan0', '-v']);
		if (udhcpc.error) {
			console.log('udhcpc.error: ' + udhcpc.error);
			callback( 'error at udhcpc func call in wifi.js' );
		}
		//if (udhcpc.stdout) console.log('udhcpc.stdout: ' + udhcpc.toString('utf8'));
		if (udhcpc.status) console.log('udhcpcp.status: ' + udhcpc.status);

		callback( 'wifigood' );
	} else {
		callback('error: wpa.status no good');
	}
}

exports.ping = function(callback) {
	var p = spawn('ping', ['8.8.8.8']);
	p.stdout.on('data', function(data) {
		var output = data.toString('utf8');
		if (output.indexOf('ms') > -1) {
			callback('success');
		}
		p.kill();
	});
}

//for running by itself:
//configure("Human Condition Global 5GHz", "2900fl0z", function(msg){console.log(msg)});

