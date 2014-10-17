'use strict';
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        listButton.style.display = "none";
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        connectButton.ontouchstart = app.connect;
        listButton.ontouchstart = app.list;

        sendButton.ontouchstart = app.sendData;
        chatform.onsubmit = app.sendData;
        disconnectButton.ontouchstart = app.disconnect;

        // listen for messages
        bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));

        // get a list of peers
        setTimeout(app.list, 2000);
    },


    list: function(event) {
        deviceList.firstChild.innerHTML = "Discovering...";
        app.setStatus("Looking for Bluetooth Devices...");
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
    },
    connect: function() {
        var device = deviceList[deviceList.selectedIndex].value;
        app.disable(connectButton);
        app.setStatus("Conectando...");
        console.log("Requesting connection to " + device) ;
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
    },
    disconnect: function(event) {
        if (event) {
            event.preventDefault();
        }

        app.setStatus("Desconectando..");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    sendData: function(event) {
        event.preventDefault();
        var text = message.value + "\n";

        if ( message.value == 'up' )
            text = 'a';
        if ( message.value == 'right' )
            text = 'd';
        if ( message.value == 'left' )
            text = 'i';
        if ( message.value == 'down' )
            text = 'r';
        if ( message.value == 'none' ){
            text = 's';
        }

        var success = function () {
            message.value = "";
            messages.value += ( "User: " + text );
            messages.scrollTop = messages.scrollHeight;
        };

        bluetoothSerial.write( text , success );
        return false;
    },
    sendDataC: function( aux ) {
        var text = aux;
        if ( aux == 'up' )
            text = "a";
        if ( aux == 'right' )
            text = "d";
        if ( aux == 'left' )
            text = "i";
        if ( aux == 'down' )
            text = "r";
        if ( aux == 'none' ){
            text = "s";
        }

        bluetoothSerial.write( text , false );
        return false;
    },
    ondevicelist: function(devices) {
        var option;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");

        devices.forEach(function(device) {

            option = document.createElement('option');
            if (device.hasOwnProperty("uuid")) {
                option.value = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                option.value = device.address;
            } else {
                option.value = "ERROR " + JSON.stringify(device);
            }
            option.innerHTML = device.name;
            deviceList.appendChild(option);
        });

        if (devices.length === 0) {

            option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            deviceList.appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android
                app.setStatus("Please Pair a Bluetooth Device.");
            }

            app.disable(connectButton);
            listButton.style.display = "";
        } else {
            app.enable(connectButton);
            listButton.style.display = "none";
            app.setStatus( devices.length + " dispositivo" + (devices.length === 1 ? "." : "s."));
        }

    },
    onconnect: function() {
        connection.style.display = "none";
        chat.style.display = "block";
        app.setStatus("Conectado");
    },
    ondisconnect: function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        connection.style.display = "block";
        app.enable(connectButton);
        chat.style.display = "none";
        app.setStatus("Desconectado");
    },
    onmessage: function(message) {
        messages.value += "Them: " + message;
        messages.scrollTop = messages.scrollHeight;
    },
    setStatus: function(message) { // setStatus
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';

        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
            statusMessage.className = 'fadeout';
        }, 5000);
    },
    enable: function(button) {
        button.className = button.className.replace(/\bis-disabled\b/g,'');
    },
    disable: function(button) {
        if (!button.className.match(/is-disabled/)) {
            button.className += " is-disabled";
        }
    },
    generateFailureFunction: function(message) {
        var func = function(reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
