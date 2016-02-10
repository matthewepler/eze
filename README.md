#EDISON DEV SETUP
*How to setup an Edison from scratch for our purposes*
*Before doing any of this, backup any files you may have created on the Edison.*

1. [Reflash the OS](https://communities.intel.com/docs/DOC-25154)
2. [Login via screen utility in Terminal](https://software.intel.com/en-us/get-started-edison-osx-step3)
3. run `configure_edison --setup` 
  * set pswd
  * give your edison a unique name, like 'edison6' This will be used to identify your device on Bluetooth scan!
  * Y to wifi, follow prompts
4. run `vi /etc/opkg/base-feeds.conf`
  * press ‘i’ to insert a cursor into the document. 
  * paste these lines into the document:
    * `src/gz all http://repo.opkg.net/edison/repo/all`
    * `src/gz edison http://repo.opkg.net/edison/repo/edison`
    * `src/gz core2-32 http://repo.opkg.net/edison/repo/core2-32`
  * type `:wq` to save and quit. 
5. run `opkg update`
6. run `opkg install git`
7. run `opkg install nodejs` to upgrade the default version of Node.
8. run `opkg install bluez5-dev`
9. *[optional]* run `opkg install vim'. Default editor is ‘vi.’
  * Add your .vimrc file and install any plugins as necessary (use Filezilla or scp). 
  * In my case this requires installing [Vundle](https://github.com/VundleVim/Vundle.vim) first.
10. clone this repo 
  * cd into repo dir before proceeding
11. run the following commands:
  * `npm install --save async`
  * `npm install --save noble`
  * `npm install --save bleno`
12. Make a [startup script](http://stephaniemoyerman.com/?p=41) that contains the following:
  * `#! /bin/sh`
  * `touch /home/root/eze/test.js`
