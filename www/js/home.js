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
		console.log("OFFLINE");
		localStorage.setItem('online', false);
	},
	onOnline: function() {
		console.log("ONLINE");
		localStorage.setItem('online', true);
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
	var disconnection = document.getElementById("disconnect");
	disconnection.addEventListener("click", disconnect);

	// show raids
	var raids = localStorage.getItem('raids');
	if (raids==null) {
		document.getElementById('connection-error').innerHTML = "Liste des raids indisponible sans internet";
	} else {
		var raids_json = JSON.parse(raids);
		show_raids_into_list(raids_json);
	}

	//refresh if online
	var online = localStorage.getItem('online');
	console.log(online);
	if (online == 'true' || online == true) {
		var r = function(response, http_code) {
			var response_json = JSON.parse(response);
			if (http_code==200) {
				localStorage.setItem('raids', response);

				show_raids_into_list(response_json)

			} else {
				console.log(response.code);
			}
		};
		apiCall("GET",'organizer/raid',null, r);
	}
}

function show_raids_into_list(response_json) {
	var raids = document.getElementById("raids--list");
	raids.innerHTML="<h1>Mes raids</h1>"; // clear div

	for (var i=0; i<response_json.length; i=i+1) {
		var raid = response_json[i];
		console.log(raid);
		var date = new Date(raid.date.date);
		var month = date.getMonth()+1;
		date = date.getDate() +"/"+ month +"/"+ date.getFullYear();

		var e = document.createElement('div');
		e.innerHTML = '<div class="raids--list-items">'+
		'<div class="raid" id="raid-'+raid.id+'">'+
			'<a href="editor.html?id='+raid.uniqid+'">'+
				'<div class="raid--content">'+
					'<div class="raid--content-container">'+
						'<p class="raid--name">'+raid.name+'</p>'+
						'<p class="raid--date">'+date+'</p>'+
					'</div></div></a></div></div>';

		raids.append(e);
		var online = localStorage.getItem('online');
		if (online == 'true' || online == true) {
			document.getElementById('raid-'+raid.id).style.backgroundImage = 'url("'+api_path+"/uploads/raids/"+raid.picture+'")';
		}
	}
}
