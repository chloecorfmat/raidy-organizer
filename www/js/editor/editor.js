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
    if (mapManager != undefined) {
      mapManager.syncOfflineData();
    }
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    console.log("Device is ready");
    console.log("EDITOR");
    var b = check_authentification();

    if (cordova.plugins.backgroundMode != undefined) {
      cordova.plugins.backgroundMode.configure({
        color: '#78e08f',
        text: 'Enregistrement en cours',
        resume: 'Raidy Organizer calibre un parcours'
      });
      cordova.plugins.backgroundMode.on('activate', function() {
        cordova.plugins.backgroundMode.disableWebViewOptimizations();
      });
    }

    //Lock the screen on
    window.plugins.insomnia.keepAwake()

    //Lock the screen orientation
    window.screen.orientation.lock('portrait');

    initForm();
    main();
  }
};

var map;
var mapManager;
var raidID = getURLParameter("id", null);
var startCalibrationBtn;
var stopCalibrationBtn;

function main() {
  var disconnection = document.getElementById("disconnect");
  disconnection.addEventListener("click", disconnect);

  enableMenu();

  var uiManager = new UIManager();
  mapManager = new MapManager(uiManager);
  mapManager.initialize();

  if (localStorage.online == "true") {
    mapManager.syncOfflineData();
  }

  startCalibrationBtn = document.getElementById('startCalibration');
  stopCalibrationBtn = document.getElementById('stopCalibration');
  startCalibrationBtn.addEventListener('click', startCalibration);
  stopCalibrationBtn.addEventListener('click', stopCalibration);

  document.getElementById('addTrack_form').addEventListener('submit', function(e) {
    e.preventDefault();
    var trName = document.getElementById('addTrack_name').value;
    var trColor = document.getElementById('addTrack_color').value;

    mapManager.startCalibration(trName, trColor);
    toggleCalibrationButtons();
    enableBackgroundMode();

    MicroModal.close('add-track-popin');
    document.getElementById('addTrack_name').value = "";
    document.getElementById('addTrack_color').value = "#000000";
  });

  document.getElementById('editTrack_form').addEventListener('submit', function(e) {
    e.preventDefault();
    var trName = document.getElementById('editTrack_name').value;
    var trColor = document.getElementById('editTrack_color').value;
    var trId = document.getElementById('editTrack_id').value;

    var track = mapManager.tracksMap.get(parseInt(trId));

    track.setName(trName);
    track.setColor(trColor);

    if (localStorage.online == "true") {
      track.push();
    } else {
      var tracksToSync = JSON.parse(localStorage.tracksToSync);
      tracksToSync[track.id] = track.toJSON();
      localStorage.tracksToSync = JSON.stringify(tracksToSync);
    }

    MicroModal.close('edit-track-popin');
  });

  document.getElementById('editOfflineTrack_form').addEventListener('submit', function(e) {
    e.preventDefault();
    var trName = document.getElementById('editOfflineTrack_name').value;
    var trColor = document.getElementById('editOfflineTrack_color').value;
    var trId = document.getElementById('editOfflineTrack_id').value;

    var track = mapManager.tracksToSyncMap.get(parseInt(trId));

    track.name = trName;
    track.color = trColor;

    var idx = getLocalOfflineTrackIndexByOfflineId(parseInt(trId));

    if(idx != null){
        mapManager.tracksToSyncMap.set(parseInt(trId), track);
        var tracksToSync = JSON.parse(localStorage.tracksToSync);
        var strObj = track.toJSON();

        var obj = JSON.parse(strObj);
        obj.offlineId = parseInt(trId);

        tracksToSync[idx] = JSON.stringify(obj);
        localStorage.tracksToSync = JSON.stringify(tracksToSync);
        mapManager.UIManager.buildOfflineTracksList();
    }

    MicroModal.close('edit-offline-track-popin');
  });

  document.getElementById('addPoiButton').addEventListener('click', function() {
    mapManager.addPoiAtCurrentLocation();
  });

  document.getElementById('addPoi_form').addEventListener('submit', function(e) {
    e.preventDefault();
    var poiName = document.getElementById('addPoi_name').value;
    var poiType = document.getElementById('addPoi_type').value;
    var poiHelpersCount = document.getElementById('addPoi_nbhelper').value;

    MicroModal.close('add-poi-popin');
    mapManager.requestNewPoi(poiName, poiType, poiHelpersCount);

    document.getElementById('addPoi_name').value = "";
    document.getElementById('addPoi_type').value = "";
    document.getElementById('addPoi_nbhelper').value = "";
  });

  document.getElementById('editPoi_form').addEventListener('submit', function(e) {
    e.preventDefault();
    var poiId = document.getElementById('editPoi_id').value;
    var poi = mapManager.poiMap.get(parseInt(poiId));

    poi.name = document.getElementById('editPoi_name').value;
    poi.poiType = mapManager.poiTypesMap.get(parseInt(document.querySelector('#editPoi_type').value));
    poi.requiredHelpers = parseInt(document.getElementById('editPoi_nbhelper').value);


    if (localStorage.online == "true") {
      poi.push();
    } else {
      var poisToSync = JSON.parse(localStorage.poisToSync);
      poisToSync[poi.id] = poi.toJSON();
      localStorage.poisToSync = JSON.stringify(poisToSync);
    }

    poi.name = htmlentities.encode(poi.name);
    poi.updateUI();
    MicroModal.close('edit-poi-popin');

    document.getElementById('editPoi_name').value = '';
    document.getElementById('editPoi_type').value = '';
    document.getElementById('editPoi_nbhelper').value = '';
  });

  document.getElementById('editOfflinePoi_form').addEventListener('submit', function(e) {
    e.preventDefault();
    var poiId = document.getElementById('editOfflinePoi_id').value;
    var poi = mapManager.poisToSyncMap.get(parseInt(poiId));

    poi.name = document.getElementById('editOfflinePoi_name').value;
    poi.poiType = mapManager.poiTypesMap.get(parseInt(document.querySelector('#editOfflinePoi_type').value));
    poi.requiredHelpers = parseInt(document.getElementById('editOfflinePoi_nbhelper').value);

    var idx = getLocalOfflinePoiIndexByOfflineId(parseInt(poiId));

    if(idx != null){
        mapManager.poisToSyncMap.set(parseInt(poiId), poi);
        var poisToSync = JSON.parse(localStorage.poisToSync);
        var strObj = poi.toJSON();

        var obj = JSON.parse(strObj);
        obj.offlineId = parseInt(poiId);

        poisToSync[idx] = JSON.stringify(obj);
        localStorage.poisToSync = JSON.stringify(poisToSync);
        mapManager.UIManager.buildOfflinePoisList();
    }

    MicroModal.close('edit-poi-popin');

    document.getElementById('editOfflinePoi_name').value = '';
    document.getElementById('editOfflinePoi_type').value = '';
    document.getElementById('editOfflinePoi_nbhelper').value = '';
  });

  var options = {
    frequency: 1000
  };
  var watchID = navigator.compass.watchHeading(function(heading) {
    if (mapManager.currentPositionMarker != undefined) {
      mapManager.currentPositionMarker.setRotationAngle(heading.magneticHeading);
    }
  }, null, options);
}

function enableBackgroundMode() {
  cordova.plugins.backgroundMode.setEnabled(true);
  cordova.plugins.backgroundMode.overrideBackButton();
}

function disableBackgroundMode() {
  cordova.plugins.backgroundMode.setEnabled(false);
}

function startCalibration() {
  closeTabs();
  MicroModal.show('add-track-popin');
}

function stopCalibration() {
  mapManager.stopCalibration();
}

function toggleCalibrationButtons() {
  if (startCalibrationBtn.classList.contains('btn--hide')) {
    startCalibrationBtn.classList.remove('btn--hide');
  } else {
    startCalibrationBtn.classList.add('btn--hide');
  }

  if (stopCalibrationBtn.classList.contains('btn--hide')) {
    stopCalibrationBtn.classList.remove('btn--hide');
  } else {
    stopCalibrationBtn.classList.add('btn--hide');
  }
}

function enableMenu() {
  document.querySelectorAll('.nav--tab > ul > li > button').forEach(function(value, key, map) {
    value.addEventListener('click', toggleTabs);
  });
}

function toggleTabs() {
  var li = this.parentNode;
  if (li.classList.contains("tab--active")) {
    document.getElementById(li.dataset.panel).classList.remove('nav--tab-panel-active');
    li.classList.remove('tab--active');
  } else {

    closeTabs();

    document.getElementById(li.dataset.panel).classList.add('nav--tab-panel-active');
    li.classList.add('tab--active');
  }
}

function closeTabs() {
  document.querySelectorAll('.nav--tab-panel').forEach(function(value, key, map) {
    value.classList.remove('nav--tab-panel-active');
  });

  document.querySelectorAll('.nav--tab > ul > li').forEach(function(value, key, map) {
    value.classList.remove('tab--active');
  });
}

var UID = {
  _current: 0,
  getNew: function() {
    this._current++;
    return this._current;
  }
};

var getLocalOfflineTrackIndexByOfflineId = function(id){
    var tracksToSync = JSON.parse(localStorage.tracksToSync);
    for(var idx in tracksToSync){
        var tr = tracksToSync[idx];
        if(tr != null){
            var obj = JSON.parse(tr);
            if(obj.offlineId == id){
                return idx;
            }
        }
    }
    return null;
}

var getLocalOfflinePoiIndexByOfflineId = function(id){
    var poisToSync = JSON.parse(localStorage.poisToSync);
    for(var idx in poisToSync){
        var poi = poisToSync[idx];
        if(poi != null){
            var obj = JSON.parse(poi);
            if(obj.offlineId == id){
                return idx;
            }
        }
    }
    return null;
}

HTMLElement.prototype.pseudoStyle = function(element, prop, value) {
  var _this = this;
  var _sheetId = "pseudoStyles";
  var _head = document.head || document.getElementsByTagName('head')[0];
  var _sheet = document.getElementById(_sheetId) || document.createElement('style');
  _sheet.id = _sheetId;
  var className = "pseudoStyle" + UID.getNew();

  _this.className += " " + className;

  _sheet.innerHTML += " ." + className + ":" + element + "{" + prop + ":" + value + "}";
  _head.appendChild(_sheet);
  return this;
};
