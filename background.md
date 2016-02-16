# Background/Research
A guide to what we learned and used to get EZ Edison working.


### BLE - types, protocols, terminology
BLE is technically Bluetooth 4.0. It is very different from Bluetooth 2.0, the previous standard. 2.0 is always on and comes in three flavors (Serial, Audio, HID). 4.0 operates on a pub/sub model and sleeps whenever it can, allowing for more efficient energy consumption.

**BLE Communication**
- The device initiating the connection is the “center.” The device being connected TO is the “peripheral.”
- Upon connection, the peripheral will tell the center about its available services. Every service has at least one characteristic, or read/write variable. 
- On the Edison side, we are using the ‘bleno’ JS library within a node script. Bleno is for use on the peripheral. Noble, it’s partner library, is used on the center device. 

For a great intro, see [Tom Igoe's BLE Wiki](https://github.com/tigoe/BLEDocs/wiki). 


### Hybrid Apps
We decided to look at building our phone app in JS/HTML/CSS. These types of apps are called 'hybrid apps.'
**Basics**

- hybrid apps are neither compiled nor translated into native code - it is interpreted at runtime by a webview built into every phone.
- hybrid apps are files stored in a package on the mobile device’s filesystem, so the Cordova app’s client is the webview on the device (instead of the browser)
- hybrid apps do not run a server, so most resources the app needs should be found in the app package 
  - you can’t assume the app has a persistent network connection - all of the required resources should be located within the app package (inside your www directory)

**Platforms**
All hybrid platforms seem to rely on [Cordova](https://cordova.apache.org/) as the core technology. The most interesting platforms for hybrid app development (at the time of this writing) are [Phonegap](http://phonegap.com/) and [Intel's XDK](https://software.intel.com/en-us/intel-xdk). Other technologies and approaches exist but these two are development environments that allow you to work with a host of other technologies as plug-ins. 

We went with XDK because of its ability to compile to Windows phones and because it came with a BLE template that worked out of the box.

As a note, that template appears to have been made with [Ionic](http://ionic.io/) and AngularJS. It also uses Bleno (explained below). I used [this tutorial](https://software.intel.com/en-us/xdk/docs/intel-xdk-guided-tutorial) to get going with XDK. 

This is the process for getting an app on an Android phone:
- Build the app in XDK (goes to the XDK cloud)
- use the provided email field to send an email to yourself with a secure link to the app
- open the email on the device and download the file
- find the file in the Android OS (Downloads folder) and install it (click on it and agree)


### BLE on the Edison
Bluetooth on the Edison is usually done in a two stage process.
- Setup the Edison to use bluetooth by issuing commands in the shell. 
- Using the *bluetoothctl* CLI app to send commands to the BLE hardware

I started out following [this video](https://www.youtube.com/watch?v=R2M41n6fyiI) for both processes. To automate the *bluetoothctl* program, I used [Expect](http://linux.die.net/man/1/expect), which actually worked great -- until it didn't. You could also do it with the spawn/exec commands in node (part of child_process module), but I soon found out I could get away with setting up the bluetooth device without the *bluetoothctl* application. 

To set up the Edison's bluetooth capabilities (process 1 above), I used [Bleno](https://github.com/sandeepmistry/bleno) and [Noble](https://github.com/sandeepmistry/noble) Node modules. Here is the [Bleno example](https://github.com/sandeepmistry/bleno/tree/master/examples/echo) used in wifi.js

On the phone side, the [Intel XDK](https://software.intel.com/en-us/intel-xdk) has a BLE template project that uses Bleno/Noble. That is what I used to get the Edison side working while the other devs built the app. 

If you watched the video link above, you'll notice the commands are different than those in startup.js. I couldn't trace exactly how I found that combo to be the best. But it works. So deal. 

### Other Stuff
* [running a script on startup](http://stephaniemoyerman.com/?p=41)
* [another method](https://communities.intel.com/message/292975#292975) of pairing bluetooth devices without the need for bluetoothctl 
* [Intel's Edison Bluetooth Guide](http://www.intel.com/content/dam/support/us/en/documents/edison/sb/edisonbluetooth_331704007.pdf)
