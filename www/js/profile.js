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
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
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
	var r = function(response, code) {
		console.log(response);
		response = JSON.parse(response);
		console.log(response);
		if (response.code==200) {
			console.log(response.message);
			var data = JSON.parse(response.message);
			var name = localStorage.getItem('name');
			document.getElementById('name').innerHTML = data.name;
			document.getElementById('first').innerHTML = data.firstname;
			document.getElementById('last').innerHTML = data.lastname;
			document.getElementById('phone').innerHTML = data.phone;
			document.getElementById('email').innerHTML = data.email;
		} else {
			console.log(response.message);
		}
	};
	
	apiCall('GET','profile',null,r);
	

	var disconnection = document.getElementById("disconnect");
	disconnection.addEventListener("click", disconnect);
}