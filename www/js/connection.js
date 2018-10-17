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
		console.log("CONNECTION");
        initForm();
		main()
    }
};

function main() {
	var form = document.getElementsByTagName('form');
	form = form[0];
	form.addEventListener('submit', function(e) {
		e.preventDefault();
		submitConnection();
		return false;
	})
}

function submitConnection(e) {
	var email = document.getElementById('email');
	var pwd = document.getElementById('password');

	var data = {email: email.value, password: pwd.value};
	
	var r = function(response, http_code) {
		response = JSON.parse(response);
		if (http_code==200) {
			localStorage.setItem('isAuthenticated', 'true');
			localStorage.setItem('token', response.token);
			localStorage.setItem('name', email.value);
			window.location.replace("home.html");
		} else {
			console.log(response.code);
			var msgBox = document.getElementById('form-error');
			if (response.message = "Bad credentials") {
				msgBox.innerHTML = "Mauvais identifiants";
			} else {
				msgBox.innerHTML = response.message;
			}
		}
	};
	apiCall("POST",'auth-tokens',data, r);
}