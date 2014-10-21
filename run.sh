#!/usr/bin/bash

cordova platform ls
cordova prepare android
cordova compile android
cordova run android --device
