/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('online', this.onOnline, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
	onOffline: function() {
		localStorage.setItem('online', false);
		document.getElementById("btn-edition").style.display = "none";
	},
	onOnline: function() {
		localStorage.setItem('online', true);
		document.getElementById("btn-edition").style.display = "inline";
	},
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		console.log("Device is ready");
		console.log("HOME");
		var b = check_authentification();
        main();
    }
};

function main() {
	var profile = localStorage.getItem('profile');
	console.log(profile);
	if (profile==null) {
		document.getElementById('connection-error').innerHTML = "Profil indisponible sans internet";
	} else {
		var profile_json = JSON.parse(profile);
		show_profile(profile_json);
	}
	
	var online = localStorage.getItem('online');
	console.log(online);
	if (online == 'true' || online == true) {
		document.getElementById('connection-error').innerHTML = "";
		var r = function(response, http_code) {
			response_json = JSON.parse(response);
			if (http_code==200) {
				localStorage.setItem('profile', response);
				var name = localStorage.getItem('name');
				
				show_profile(response_json);
				console.log(response);
				
			} else {
				console.log(response.message);
				console.log(response.code);
			}
		};

		apiCall('GET','profile',null,r);
	}

	var disconnection = document.getElementById("disconnect");
	disconnection.addEventListener("click", disconnect);
}
	
function show_profile(response) {
	document.getElementById('name').innerHTML = response.username;
	document.getElementById('firstname').innerHTML = response.firstname;
	document.getElementById('lastname').innerHTML = response.lastname;
	document.getElementById('phone').innerHTML = response.phone;
	document.getElementById('email').innerHTML = response.email;
}