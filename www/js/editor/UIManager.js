var UIManager = function(){

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
}
