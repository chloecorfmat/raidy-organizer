/*
 * Map editor mode :
 * 0 = reading
 * 1 = add poi
 */

var EditorMode = Object.freeze({
    "READING": 0,
    "ADD_POI": 1,
    "FOLLOW_POSITION": 2,
    "POI_EDIT": 3,
    properties: {
        0: {
            name: "READING",
            value: 0
        },
        1: {
            name: "ADD_POI",
            value: 1
        },
        2: {
            name: "FOLLOW_POSITION",
            value: 1
        },
        3: {
            name: "POI_EDIT",
            value: 3
        }

    }
});

var MapManager = function(uimanager) {

    this.map = L.map('editorMap', {
        editable: true
    }).setView([48.742917, -3.459180], 15);

    this.UIManager = uimanager;

    this.group = new L.featureGroup();
    this.group.addTo(this.map);

    this.waitingPoi = null;
    this.poiTypesMap = new Map();
    this.tracksMap = new Map();
    this.poiMap = new Map();
    this.tracksToSyncMap = new Map();
    this.poisToSyncMap = new Map();

    if (localStorage.tracks == undefined || localStorage.tracks == "") {
        localStorage.tracks = "{}";
    }

    if (localStorage.pois == undefined || localStorage.pois == "") {
        localStorage.pois = "{}";
    }

    if (localStorage.poiTypes == undefined || localStorage.poiTypes == "") {
        localStorage.poiTypes = "{}";
    }

    if (localStorage.poisToSync == undefined || localStorage.poisToSync == "") {
        localStorage.poisToSync = "[]";
    }

    if (localStorage.tracksToSync == undefined || localStorage.tracksToSync == "") {
        localStorage.tracksToSync = "[]";
    }

    this.currentPositionMarker;
    this.recordTrack = false;
    this.recordedTrack = null;
    this.recorder = null;
    this.intervalRecord = 5000;
    this.newPoiPosition = null;

    this.currentPosition = null;

    this.waypoints = [];

    this.distance = 0;

    this.mode = EditorMode.FOLLOW_POSITION;

    var keepThis = this;

    var baseLayer = L.tileLayer.offline('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
        subdomains: 'abc',
        minZoom: 5,
        maxZoom: 19,
    }).addTo(this.map);

    var progress;
    var tilesToSave = 0;

    baseLayer.on('savestart', function(e) {
        progress = 0;
        tilesToSave = e._tilesforSave.length;
        console.log("Start downloading " + e._tilesforSave.length + " tiles");
    });

    baseLayer.on('savetileend', function(e) {
        progress++;
        var val = Math.round((progress * 100) / tilesToSave);
        var message = "Début du téléchargement de la carte";

        if (val > 1) {
            message = "Téléchargement de la carte - " + val + "%";
        }

        keepThis.UIManager.setMapDownloadStatus(message);
        console.log(progress + " tiles downloaded");
    });

    baseLayer.on('loadend', function(e) {
        keepThis.UIManager.setMapDownloadStatus("Téléchargement de la carte terminé");
        keepThis.UIManager.enableMapDownloadBarHide();
    });

    var BackToLocationCtrl = L.Control.extend({
        options: {
            position: 'topleft'
        },

        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.backgroundImage = "url('img/icon-center-position.svg')";
            container.onclick = function() {
                keepThis.backToLocation();
            }
            return container;
        },
    });

    this.map.addControl(new BackToLocationCtrl());

    this.saveTilesControl = L.control.savetiles(baseLayer, {
        'zoomlevels': [16],
        'position': 'topright',
        'confirm': function(layer, succescallback) {
            console.log("download " + layer._tilesforSave.length + " tiles");
            keepThis.UIManager.displayMapDownloadBar();
            succescallback();
        },
        'saveText': '<i class="fa fa-download" aria-hidden="true" title="Save tiles"></i>',
    });
    this.saveTilesControl.addTo(this.map);

    //Hack to not allow user to remove cached map
    var btn = document.querySelector('.rmtiles');
    btn.parentNode.removeChild(btn);
};

MapManager.prototype.initialize = function() {
    /* MAP LISTENERS */
    var keepThis = this;

    this.map.addEventListener('click', function(e) {
        // console.log("Mode : "+EditorMode.properties[keepThis.mode].name);
        switch (keepThis.mode) {
            case EditorMode.READING:
                break;
            case EditorMode.ADD_POI:
                MicroModal.show('add-poi-popin');
                keepThis.waitingPoi = new Poi(keepThis.map);
                keepThis.waitingPoi.marker.setLatLng(e.latlng);

                break;
            case EditorMode.TRACK_EDIT:
                break;
            case EditorMode.POI_EDIT:
                break;
            default:
                // console.log("Something goes wrong with the map editor mode. " + this.mode);
        }
    });

    this.map.addEventListener('drag', function() {
        keepThis.switchMode(EditorMode.READING);
    });

    if (localStorage.recordedTrack != undefined && localStorage.recordedTrack != "") {
        var track = new Track();
        track.fromJSON(localStorage.recordedTrack);
        track.calibration = true;

        document.getElementById('track-name').innerHTML = track.name;
        MicroModal.show("restart-calibration-popin");

        document.getElementById('res-popin-stop-calibration').addEventListener('click', function() {
            keepThis.recordedTrack = track;
            keepThis.stopCalibration();
            toggleCalibrationButtons();
            disableBackgroundMode();
            MicroModal.close("restart-calibration-popin");
        });

        document.getElementById('res-popin-restart-calibration').addEventListener('click', function() {
            keepThis.recordedTrack = track;
            keepThis.recordTrack = true;
            keepThis.recordedTrack.line.addTo(mapManager.map);
            keepThis.recorder = setInterval(function() {
                console.log("Record current location");
                keepThis.recordLocation();
            }, keepThis.intervalRecord);
            toggleCalibrationButtons();
            enableBackgroundMode();
            MicroModal.close("restart-calibration-popin");
        });

        document.getElementById('res-popin-abort-calibration').addEventListener('click', function() {
          console.log("ABORT");
            mapManager.recordedTrack = null;
            mapManager.recordTrack = false;
            localStorage.recordedTrack = "";
            disableBackgroundMode();
            MicroModal.close("restart-calibration-popin");
        });
    }

    this.loadRessources()
        .then(function(res){
            return keepThis.loadPois();
        })
        .then(function(res){
            return keepThis.loadTracks();
        })
        .then(function(){
            return keepThis.syncOfflineData();
        });

    this.startFollowLocation(); //Start geolocation follow
}

MapManager.prototype.startCalibration = function(name, color) {
    var keepThis = this;
    if (!keepThis.recordTrack) {
        keepThis.recordedTrack = new Track();
        keepThis.recordedTrack.name = name;
        keepThis.recordedTrack.color = color;
        keepThis.recordedTrack.calibration = true;

        keepThis.recordedTrack.line.addTo(mapManager.map);

        keepThis.recordTrack = true;

        keepThis.UIManager.displayRecordStatusBar();
        keepThis.UIManager.updateRecordedDistance(keepThis.recordedTrack.distance);

        localStorage.recordedTrack = keepThis.recordedTrack.toJSON();

        keepThis.recorder = setInterval(function() {
            console.log("Record current location");
            keepThis.recordLocation();
        }, keepThis.intervalRecord);

    }
};

MapManager.prototype.stopCalibration = function() {
    var keepThis = this;
    if (localStorage.online == "true") {
        JSONApiCall('PUT', "organizer/raid/" + raidID + "/track", this.recordedTrack.toJSON(), function(responseText, status) {
            if (status === 200) {
                var track = JSON.parse(responseText);
                mapManager.addTrack(track);
                mapManager.recordedTrack = null;
                mapManager.recordTrack = false;
                localStorage.recordedTrack = "";
                toggleCalibrationButtons();
                disableBackgroundMode();
                clearInterval(keepThis.recorder);
                keepThis.UIManager.hideRecordStatusBar();
            }
        });
    } else {
        var offlineId = Date.now();

        var localTrackToSync = JSON.parse(localStorage.tracksToSync);

        var jsonTrack = JSON.parse(this.recordedTrack.toJSON())
        jsonTrack.offlineId = offlineId;
        this.recordedTrack.offlineId = offlineId;
        localTrackToSync.push(JSON.stringify(jsonTrack));

        localStorage.tracksToSync = JSON.stringify(localTrackToSync);

        mapManager.tracksToSyncMap.set(offlineId, this.recordedTrack);

        mapManager.UIManager.buildOfflineTracksList();
        mapManager.recordedTrack = null;
        mapManager.recordTrack = false;
        localStorage.recordedTrack = "";
        toggleCalibrationButtons();
        disableBackgroundMode();
        clearInterval(keepThis.recorder);
        keepThis.UIManager.hideRecordStatusBar();
    }
};

MapManager.prototype.syncOfflineData = function() {
    console.log("syncOfflineData");
    var keepThis = this;
    var tracksToSync = JSON.parse(localStorage.tracksToSync);

    for (idx in tracksToSync) {

        if(mapManager.tracksMap.size == 0){
            return;
        }

        var jsonTrack = tracksToSync[idx];
        if (jsonTrack != null) {

            var track = new Track();
            var trackObj = JSON.parse(jsonTrack);
            var offlineId = trackObj.offlineId;

            if(trackObj.id != ""){
                track = keepThis.tracksMap.get(trackObj.id);
            } else {
                track.fromJSON(jsonTrack);
            }

            var keyword = "PATCH";
            var trackIdPath = "";
            if (track.id == "") {
                keyword = "PUT";
            } else {
                trackIdPath = "/"+track.id
            }

            JSONApiCall(keyword, "organizer/raid/" + raidID + "/track"+trackIdPath, jsonTrack, function(responseText, status) {
                if (status === 200) {
                    track = JSON.parse(responseText);

                    if(trackObj.id == ""){
                        mapManager.addTrack(track);
                    }

                    tracksToSync[idx] = null;
                    console.log("offlineId");
                    console.log(offlineId);
                    mapManager.tracksToSyncMap.delete(offlineId);
                    localStorage.tracksToSync = JSON.stringify(tracksToSync);

                    keepThis.UIManager.buildOfflineTracksList();

                    if(allElementNull(JSON.parse(localStorage.tracksToSync))) {
                        localStorage.tracksToSync = "[]";
                    }

                }
            });
        }
    }

    var poisToSync = JSON.parse(localStorage.poisToSync);
    for (idx in poisToSync) {
        var jsonPoi = poisToSync[idx];
        if (jsonPoi != null) {

            var poi = new Poi();
            var poiObj = JSON.parse(jsonPoi);
            var offlineId = poiObj.offlineId;

            if(poiObj.id != ""){
                poi = mapManager.poiMap.get(poiObj.id)
            } else {
                poi.fromJSON(jsonPoi);
            }

            var keyword = "PATCH";
            var poiIdPath = "";
            if (poi.id == "") {
                keyword = "PUT";
            } else {
                poiIdPath = "/"+poi.id
            }

            JSONApiCall(keyword, "organizer/raid/" + raidID + "/poi"+poiIdPath, jsonPoi, function(responseText, status) {
                if (status === 200) {

                    poi = JSON.parse(responseText);
                    if(poiObj.id == ""){
                        mapManager.addPoi(poi);
                    }

                    poisToSync[idx] = null;
                    mapManager.poisToSyncMap.delete(offlineId);
                    localStorage.poisToSync = JSON.stringify(poisToSync);
                    keepThis.UIManager.buildOfflinePoisList();

                    if(allElementNull(JSON.parse(localStorage.poisToSync))) {
                        localStorage.poisToSync = "[]";
                    }
                }
            });
        }
    }
}

MapManager.prototype.startFollowLocation = function() {
    var keepThis = this;
    var positionWatchId = navigator.geolocation.watchPosition(
        function(e) {
            var latLng = new L.LatLng(e.coords.latitude, e.coords.longitude);
            keepThis.currentPosition = latLng;
            if (keepThis.mode == EditorMode.FOLLOW_POSITION) {
                mapManager.updateCurrentPosition(latLng);
            }
        }, null, {
            'enableHighAccuracy': true,
            'maximumAge': 0
        });
    mapManager.switchMode(EditorMode.FOLLOW_POSITION);
}

MapManager.prototype.backToLocation = function() {
    mapManager.switchMode(EditorMode.FOLLOW_POSITION);

    if (mapManager.currentPosition != null) {
        mapManager.updateCurrentPosition(mapManager.currentPosition);
    }
}

MapManager.prototype.recordLocation = function() {
    if (mapManager.currentPosition != null) {
        this.recordedTrack.line.addLatLng(this.currentPosition);
        this.recordedTrack.calculDistance();
        localStorage.recordedTrack = this.recordedTrack.toJSON();
        this.UIManager.updateRecordedDistance(this.recordedTrack.distance);
    }
}

MapManager.prototype.addPoiAtCurrentLocation = function() {

    mapManager.UIManager.resetAddPOIPopin();

    if (this.currentPosition != null) {
        mapManager.waitingPoi = new Poi(mapManager.map);
        mapManager.waitingPoi.latitude = this.currentPosition.lat;
        mapManager.waitingPoi.longitude = this.currentPosition.lng;
        mapManager.waitingPoi.marker.setLatLng(this.currentPosition);
        MicroModal.show('add-poi-popin');
    }
}

MapManager.prototype.loadRessources = function() {
    var keepThis = this;
    return new Promise(function(resolve, reject) {
        if (localStorage.online == "true") {
            console.log("Load poiTypes from server");
            apiCall('GET', "organizer/raid/"+raidID+"/poitype", null, function(responseText, status) {
                if (status === 200) {

                    localPoiTypes = JSON.parse(localStorage.poiTypes);
                    localPoiTypes[raidID] = responseText;

                    localStorage.poiTypes = JSON.stringify(localPoiTypes);
                    var select = document.getElementById('addPoi_type');
                    var html = "";
                    var poiTypes = JSON.parse(responseText);
                    for (poiType of poiTypes) {
                        keepThis.poiTypesMap.set(poiType.id, poiType);
                        html += "<option value='" + poiType.id + "'>" + poiType.type + "</option>";
                    }
                    select.innerHTML = html;
                    resolve();
                } else {
                    reject();
                }
            });
        } else {
            console.log("Load poiTypes from local");
            var poiTypes = JSON.parse(localStorage.poiTypes)[raidID];
            var select = document.getElementById('addPoi_type');
            var html = "";
            for (poiType of poiTypes) {
                keepThis.poiTypesMap.set(poiType.id, poiType);
                html += "<option value='" + poiType.id + "'>" + poiType.type + "</option>";
            }
            select.innerHTML = html;
            resolve();
        }
    });
}

MapManager.prototype.switchMode = function(mode) {
    console.log("switchMode to " + mode);
    if (this.mode != mode) this.lastMode = this.mode;
    this.mode = mode;
    // console.log("Switch mode to : "+EditorMode.properties[mode].name);
    switch (mode) {
        case EditorMode.READING:
            document.getElementById('addPoiButton').classList.remove("add--poi");
            this.setPoiEditable(false);
            break;
    }
}

MapManager.prototype.addTrack = function(track) {
    newTrack = new Track(this.map);
    newTrack.fromObj(track);
    this.tracksMap.set(track.id, newTrack);

    var li = document.createElement('li');

    li = newTrack.buildUI(li);

    document.querySelector('.editor--list').appendChild(li);
}

MapManager.prototype.showTrack = function(id) {
    this.tracksMap.get(id).show();
}

MapManager.prototype.hideTrack = function(id) {
    this.tracksMap.get(id).hide();
}

MapManager.prototype.showOfflineTrack = function(id) {
    this.tracksToSyncMap.get(id).show();
}

MapManager.prototype.hideOfflineTrack = function(id) {
    this.tracksToSyncMap.get(id).hide();
}

MapManager.prototype.requestNewPoi = function(name, type, requiredHelpers, description, image) {
    var poi = this.waitingPoi;
    poi.poiType = mapManager.poiTypesMap.get(parseInt(type));
    poi.name = name != "" ? name : poi.poiType.type;
    poi.requiredHelpers = requiredHelpers != "" ? parseInt(requiredHelpers) : 0;
    poi.description = description != "" ? description : "";
    poi.image = image != "" ? image : "";
    if (localStorage.online == "true") {
        JSONApiCall('PUT', "organizer/raid/" + raidID + "/poi", poi.toJSON(), function(responseText, status) {
            if (status === 200) {
                poi = JSON.parse(responseText);
                mapManager.addPoi(poi);
            }
        });
    } else {
        var offlineId = Date.now();

        var localPoiToSync = JSON.parse(localStorage.poisToSync);
        poi.offlineId = offlineId;
        mapManager.poisToSyncMap.set(offlineId, poi);

        var poiJsonStr = poi.toJSON();
        var poiJson = JSON.parse(poiJsonStr);
        poiJson.offlineId = offlineId;
        poiJsonStr = JSON.stringify(poiJson);

        poi.marker = L.marker([poi.latitude, poi.longitude]);
        poi.marker.addTo(mapManager.group);

        mapManager.UIManager.buildOfflinePoisList();

        localPoiToSync.push(poiJsonStr);
        localStorage.poisToSync = JSON.stringify(localPoiToSync);
    }
}

MapManager.prototype.loadTracks = function() {
    return new Promise(function(resolve, reject) {
        if (localStorage.online == "true") {
            console.log("Load tracks from server");
            apiCall('GET', "organizer/raid/" + raidID + "/track", null, function(responseText, status) {
                if (status === 200) {
                    var tracks = JSON.parse(responseText);

                    var localTracks = JSON.parse(localStorage.tracks);
                    localTracks[raidID] = responseText;
                    localStorage.tracks = JSON.stringify(localTracks);

                    for (track of tracks) {
                        mapManager.addTrack(track);
                    }

                    if (tracks.length > 0) {
                        mapManager.map.fitBounds(mapManager.group.getBounds());
                        mapManager.saveTilesControl.setBounds(mapManager.group.getBounds());
                    }
                    resolve();
                } else {
                    reject();
                }
            });
        } else {
            console.log("load tracks from localStorage");
            var allTracks = JSON.parse(localStorage.tracks)[raidID];

            if (allTracks == undefined) {
                console.error('This raid is not saved on localStorage');
                reject();
            }

            var tracks = JSON.parse(allTracks);

            for (track of tracks) {
                mapManager.addTrack(track);
            }

            if (tracks.length > 0) {
                mapManager.map.fitBounds(mapManager.group.getBounds());
                mapManager.saveTilesControl.setBounds(mapManager.group.getBounds());
            }
        }
        mapManager.switchMode(EditorMode.FOLLOW_POSITION);
        resolve();
    });
}

MapManager.prototype.loadPois = function() {

    return new Promise(function(resolve, reject) {
        if (localStorage.online == "true") {
            console.log("Load Pois from server");
            apiCall('GET', "organizer/raid/" + raidID + "/poi", null, function(responseText, status) {
                if (status === 200) {
                    // console.log("Réponse reçue: %s", xhr_object.responseText);
                    var pois = JSON.parse(responseText);

                    var localPois = JSON.parse(localStorage.pois);
                    localPois[raidID] = responseText;
                    localStorage.pois = JSON.stringify(localPois);

                    for (poi of pois) {
                        mapManager.addPoi(poi);
                    }
                    if (pois.length > 0) {
                        mapManager.map.fitBounds(mapManager.group.getBounds());
                    }
                    resolve();
                } else {
                    reject();
                }

            });
        } else {
            console.log("Load Pois from local");

            var allPois = JSON.parse(localStorage.pois)[raidID];

            if (allPois == undefined) {
                console.error('This raid is not saved on localStorage');
                return;
            }

            var pois = JSON.parse(allPois);

            for (poi of pois) {
                mapManager.addPoi(poi);
            }
            if (pois.length > 0) {
                mapManager.map.fitBounds(mapManager.group.getBounds());
            }

            resolve();
        }
    });
    mapManager.switchMode(EditorMode.FOLLOW_POSITION);
}

MapManager.prototype.saveTracksLocal = function() {
    var tracks = "[";
    for (var track of this.tracksMap) {
        tracks += track[1].toJSON() + ",";
    }
    var tracks = tracks.substring(0, tracks.length - 1);
    tracks += "]";

    var localTracks = JSON.parse(localStorage.tracks);
    localTracks[raidID] = tracks;
    localStorage.tracks = JSON.stringify(localTracks);
}

MapManager.prototype.savePoisLocal = function() {
    var pois = "[";
    for (var poi of this.poiMap) {
        pois += poi[1].toJSON() + ",";
    }
    var pois = pois.substring(0, pois.length - 1);
    pois += "]";

    var localPois = JSON.parse(localStorage.pois);
    localPois[raidID] = pois;
    localStorage.pois = JSON.stringify(localPois);
}

MapManager.prototype.addPoi = function(poi) {
    newPoi = new Poi(this.map);
    newPoi.fromObj(poi);
    //newPoi.name = htmlentities.decode(newPoi.name);
    newPoi.buildUI();
    this.poiMap.set(poi.id, newPoi);
}

MapManager.prototype.setPoiEditable = function(b) {
    this.poiMap.forEach(function(value, key, map) {
        value.setEditable(b);
    })
}

MapManager.prototype.updateCurrentPosition = function(latLng) {

    this.map.setView(latLng, 20);

    if (this.currentPositionMarker == null) {

        var icon = L.icon({
            iconUrl: 'img/current-position-marker.png',
            iconSize: [50, 50], // size of the icon
            iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
            popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        });


        this.currentPositionMarker = L.marker(latLng, {
            icon: icon
        }).addTo(this.map);
    } else {
        this.currentPositionMarker.setLatLng(latLng);
    }
}
