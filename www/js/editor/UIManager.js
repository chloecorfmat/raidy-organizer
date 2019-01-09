var UIManager = function() {

}

UIManager.prototype.displayRecordStatusBar = function(message) {
    document.getElementById('recordStatusBar').classList.add('statusBar--visible');
}

UIManager.prototype.hideRecordStatusBar = function(message) {
    document.getElementById('recordStatusBar').classList.remove('statusBar--visible');
}

UIManager.prototype.displayMapDownloadBar = function(message) {
    document.getElementById('downloadStatusBar').classList.add('statusBar--visible');
}

UIManager.prototype.hideMapDownloadBar = function(message) {
    document.getElementById('downloadStatusBar').classList.remove('statusBar--visible');
}

UIManager.prototype.setMapDownloadStatus = function(message) {
    document.getElementById('downloadStatusBar').innerHTML = message;
}

UIManager.prototype.enableMapDownloadBarHide = function() {
    document.getElementById('downloadStatusBar').addEventListener('click', function() {
        this.classList.remove("statusBar--visible");
    });
}

UIManager.prototype.updateRecordedDistance = function(distance) {
    document.getElementById('recordStatusBar--distance').innerHTML = Math.round(10 * distance / 1000) / 10 + " Km";
}

UIManager.prototype.resetAddPOIPopin = function(distance) {
    document.getElementById('addPoi_name').value = "";
    document.getElementById('addPoi_nbhelper').value = "";
    document.getElementById('addPoi_description').value = "";
    document.getElementById('addPoi_image').value = "";
    document.getElementById('addPoi_isCheckpoint').checked = false;
}

UIManager.prototype.buildOfflineTracksList = function() {
    var tracks = mapManager.tracksToSyncMap;
    document.querySelector('#offline--list').innerHTML = "";
    for (var track of tracks) {

        track = track[1];

        track.calculDistance();

        var li = document.createElement('li');
        li.classList.add("checkbox-item");
        li.innerHTML = `
            <label class="checkbox-item--label">
                <input data-id = "` + track.offlineId + `" type="checkbox" checked="checked">
                <input type="checkbox" checked="checked">
                <span style ="background-color : ` + track.color + `; border-color :` + track.color + `" class="checkmark">
                <i class="fas fa-check"></i>
                </span>
                <span>` + track.name + `</span>
                <span style="font-size : 0.75rem;"> (` + Math.round(10 * track.distance / 1000) / 10 + ` km)</span>
            </label>
            <button data-id = "`+track.offlineId+`" class="btn--track--settings btn--editor-ico">
                <i class="fas fa-ellipsis-v"></i>
            </button>`;

        document.querySelector('#offline--list').appendChild(li);

        li.querySelector("button").addEventListener('click', function(){
                console.log(track);
                document.querySelector('#editOfflineTrack_name').value  = track.name;
                document.querySelector('#editOfflineTrack_color').value = track.color;
                document.querySelector('#editOfflineTrack_id').value    = track.offlineId;

                MicroModal.show('edit-offline-track-popin');
        });

        li.querySelectorAll('input').forEach(function(input) {
            input.addEventListener('change', function() {
                if (input.checked) {
                    mapManager.showOfflineTrack(parseInt(input.dataset.id));
                    li.querySelector("label > span.checkmark").style.backgroundColor = li.querySelector("label > span.checkmark").style.borderColor;
                } else {
                    li.querySelector("label > span.checkmark").style.backgroundColor = "#ffffff";
                    if (mapManager.currentEditID == input.dataset.id) {
                        document.querySelectorAll('.track--edit').forEach(function(el) {
                            el.classList.remove('track--edit')
                        })
                        mapManager.switchMode(EditorMode.READING);
                    }
                    mapManager.hideOfflineTrack(parseInt(input.dataset.id))
                }
            });
        });

    }
}

UIManager.prototype.buildOfflinePoisList = function (){
    var pois = mapManager.poisToSyncMap;
    document.querySelector('#list--offline-pois').innerHTML = "";
    for(var poi of pois){
        poi = poi[1];
        poi.color = poi.poiType.color;
        const markerHtmlStyles = `
                background-color: ` + poi.color + `;
                width: 2rem;
                height: 2rem;
                display: block;

                position: relative;
                border-radius: 3rem 3rem 0;
                transform: translateX(-1rem) translateY(-2rem) rotate(45deg);`;

        poi.marker.bindPopup('' +
            '<header style="' +
            'background: ' + poi.color + ' ;' +
            'color: #ffffff ;' +
            'padding: 0rem 3rem;">' +
            '<h3>' + htmlentities.encode(poi.name) + '</h3>' +
            '</header>' +
            '<div> ' +
            '<h4>Bénévoles</h4>' +
            '<p>' + poi.requiredHelpers + ' Requis </p>' +
            '</div>');
        var icon = L.divIcon({
            className: "my-custom-pin",
            iconAnchor: [0, 5],
            labelAnchor: [0, 0],
            popupAnchor: [0, -35],
            html: `<span style="${markerHtmlStyles}" />`
        });

        poi.marker.setIcon(icon);

        poi.li = document.createElement('li');
        poi.li.classList.add("list--pois-items");
        poi.li.innerHTML = `<span>` + htmlentities.encode(poi.name) + `</span>` +
            `<button data-id = "` + poi.offlineId + `" class="btn--poi--settings">
                <i class="fa fa-ellipsis-v"></i>
                </button>`;

        poi.li.querySelector('button').addEventListener("click", function(){
            document.getElementById('editOfflinePoi_id').value = poi.offlineId;
            document.getElementById('editOfflinePoi_name').value = poi.name;
            document.getElementById('editOfflinePoi_nbhelper').value = poi.requiredHelpers;
            document.querySelector("#editOfflinePoi_type option[value='"+poi.poiType.id+"']").selected = "selected";
            document.getElementById('editOfflinePoi_description').value = poi.description;
            document.getElementById('editOfflinePoi_isChecked').checked = poi.isCheckpoint;

            MicroModal.show('edit-offline-poi-popin');
        });

        document.getElementById("list--offline-pois").appendChild(poi.li);
        poi.li.pseudoStyle("before", "background-color", poi.color);
    }
}
