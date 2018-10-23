var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('online', this.onOnline, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
	onOffline: function() {
		localStorage.setItem('online', false);
	},
	onOnline: function() {
		localStorage.setItem('online', true);
	},
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		console.log("Device is ready");
		console.log("EDITOR");
		var b = check_authentification();
        main();
    }
};

var map;
var mapManager;
console.log(getURLParameter);
var raidID = getURLParameter(window.location.href, "id");

function main() {
	var disconnection = document.getElementById("disconnect");
	disconnection.addEventListener("click", disconnect);

  mapManager = new MapManager();
  mapManager.initialize();

  var positionWatchId = navigator.geolocation.watchPosition(function(e){
    let latLng = new L.LatLng(e.coords.latitude, e.coords.longitude)
    mapManager.updateCurrentPosition(latLng);
  }, function(){
    console.log("Geoloc error !")
  }, {'enableHighAccuracy':true});
}
