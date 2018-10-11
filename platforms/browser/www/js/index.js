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
        initForm()
    }
};


function initForm () {
  var exceptedInputs = ['hidden', 'date', 'file']
  var forms = Array.prototype.slice.call(document.getElementsByTagName('form'))
  Array.prototype.slice.call(forms).forEach(function (form) {
    var inputs = Array.prototype.slice.call(form.getElementsByTagName('input'))

    inputs.forEach(function (input) {
      if (exceptedInputs.indexOf(input.type) === -1) {
        if (input.value !== '') {
          input.parentNode.classList.add('form--input-focused')
        }

        input.addEventListener('focusin', inputFocusIn)
        input.addEventListener('focusout', inputFocusOut)
        input.addEventListener('change', inputFocusIn)
        input.addEventListener('change', inputFocusOut)
      }
    })
  })
}

function inputFocusIn (e) {
  if (!this.parentNode.classList.contains('form--input-focused')) {
    this.parentNode.classList.add('form--input-focused')
  }
}

function inputFocusOut (e) {
  if (this.value === '' && this.parentNode.classList.contains('form--input-focused')) {
    this.parentNode.classList.remove('form--input-focused')
  }
}
