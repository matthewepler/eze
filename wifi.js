var fs = require('fs');
var exec = require('child_process').exec;

function buildContents( SSID, psk, callback) {
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

	var dataString = data.join("\n\n");

	fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', dataString, 'utf8', function() {
			console.log('wpa_supplicant file written:');
			console.log('SSID = ' + SSID);
			console.log('psk = ' + psk);	
			callback();
	});
}

function configure( SSID, psk ) {
	var files = fs.readdirSync('/etc/wpa_supplicant/');
	if (files.indexOf('wpa_supplicant.conf') > 0) {
		exec('rm /etc/wpa_supplicant/wpa_supplicant.conf', function() { 
			console.log('rm wpa_supplicant.conf');
			buildContents( SSID, psk, function() {
					console.log('WiFi config complete, restarting wlan');
				});
		});
	}
}

exports.config = configure;
//buildContents();
