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
        initForm();
        main();
    }
};

var map;
var mapManager;
var raidID = getURLParameter("id",null);
var startCalibrationBtn;
var stopCalibrationBtn;
function main() {

    var disconnection = document.getElementById("disconnect");
	disconnection.addEventListener("click", disconnect);

    enableMenu();

    mapManager = new MapManager();
    mapManager.initialize();

    startCalibrationBtn = document.getElementById('startCalibration');
    stopCalibrationBtn = document.getElementById('stopCalibration');
    startCalibrationBtn.addEventListener('click',startCalibration);
    stopCalibrationBtn.addEventListener('click',stopCalibration);

    document.getElementById('addTrack_submit').addEventListener('click', function () {
        var trName = document.getElementById('addTrack_name').value;
        var trColor = document.getElementById('addTrack_color').value;

        mapManager.startCalibration(trName, trColor);
        toggleCalibrationButtons();

        MicroModal.close('add-track-popin');
        document.getElementById('addTrack_name').value = "";
        document.getElementById('addTrack_color').value = "#000000";
    });

    document.getElementById('editTrack_submit').addEventListener('click', function () {
        var trName = document.getElementById('editTrack_name').value;
        var trColor = document.getElementById('editTrack_color').value;
        var trId = document.getElementById('editTrack_id').value;

        var track = mapManager.tracksMap.get(parseInt(trId));

        track.setName(trName);
        track.setColor(trColor);
        track.push();
        MicroModal.close('edit-track-popin');
    });

    document.getElementById('editTrack_delete').addEventListener('click', function () {
        var trId = document.getElementById('editTrack_id').value;

        var track = mapManager.tracksMap.get(parseInt(trId));

        track.remove();
        MicroModal.close('edit-track-popin');
    });

    document.getElementById('addPoiButton').addEventListener('click', function(){
        mapManager.addPoiAtCurrentLocation();
    });

    var options = { frequency: 1000 };
    var watchID = navigator.compass.watchHeading(function(heading){
        mapManager.currentPositionMarker.setRotationAngle(heading.magneticHeading);
    }, null, options);


}

function startCalibration(){
    closeTabs();
    MicroModal.show('add-track-popin');
}

function stopCalibration(){
    mapManager.stopCalibration();
}

function toggleCalibrationButtons(){
    if(startCalibrationBtn.classList.contains('btn--hide')){
        startCalibrationBtn.classList.remove('btn--hide');
    } else {
        startCalibrationBtn.classList.add('btn--hide');
    }

    if(stopCalibrationBtn.classList.contains('btn--hide')){
        stopCalibrationBtn.classList.remove('btn--hide');
    } else {
        stopCalibrationBtn.classList.add('btn--hide');
    }
}

function enableMenu(){
    document.querySelectorAll('.nav--tab > ul > li > button').forEach(function (value, key, map) {
        value.addEventListener('click', toggleTabs);
    });
}

function toggleTabs(){
    var li = this.parentNode;
    if(li.classList.contains("tab--active")){
        document.getElementById(li.dataset.panel).classList.remove('nav--tab-panel-active');
        li.classList.remove('tab--active');
    }else{

        closeTabs();

        document.getElementById(li.dataset.panel).classList.add('nav--tab-panel-active');
        li.classList.add('tab--active');
    }
}

function closeTabs(){
    document.querySelectorAll('.nav--tab-panel').forEach(function (value, key, map) {
        value.classList.remove('nav--tab-panel-active');
    });

    document.querySelectorAll('.nav--tab > ul > li').forEach(function (value, key, map) {
        value.classList.remove('tab--active');
    });
}

var UID = {
    _current: 0,
    getNew: function(){
        this._current++;
        return this._current;
    }
};

HTMLElement.prototype.pseudoStyle = function(element,prop,value){
    var _this = this;
    var _sheetId = "pseudoStyles";
    var _head = document.head || document.getElementsByTagName('head')[0];
    var _sheet = document.getElementById(_sheetId) || document.createElement('style');
    _sheet.id = _sheetId;
    var className = "pseudoStyle" + UID.getNew();

    _this.className +=  " "+className;

    _sheet.innerHTML += " ."+className+":"+element+"{"+prop+":"+value+"}";
    _head.appendChild(_sheet);
    return this;
};
