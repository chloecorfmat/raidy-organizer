
function sendToAPI(method, url, jsonData=null, callback=null){
	if (callback==null) {
		callback=function(a) {return true;}
	}
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		 if (this.readyState == 4) {
			 console.log(this.responseText);
			 console.log(this.status);
			 callback(this.responseText, this.status);
		 }
	};
	xhttp.open(method, api_path+'api/'+url, true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.setRequestHeader("Access-Control-Allow-Origin", api_path);
	if (localStorage.getItem('token')!=null) {
		xhttp.setRequestHeader("X-Auth-Token", localStorage.getItem('token'));
	}
	if (jsonData!=null) {
		xhttp.send(jsonData);
	} else {
		xhttp.send();
	}
}

function apiCall(method, url, jsonData=null, callback=null) {
	sendToAPI(method, url, JSON.stringify(jsonData), callback);
}

function JSONApiCall(method, url, jsonData=null, callback=null){
	sendToAPI(method, url, jsonData, callback);
}

function check_authentification() {
	var status = localStorage.getItem('isAuthenticated');
	console.log (status);
	if (status!="true") {
		window.location.replace("connection.html");
		return false;
	} else {
		return true;
	}
}

function disconnect() {
	localStorage.setItem('isAuthenticated', 'false');
	var token = localStorage.getItem('token');

	apiCall('DELETE', 'auth-tokens', {token: token});
	localStorage.removeItem('token');
	localStorage.removeItem('name');
	window.location.replace("connection.html");
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function getURLParameter(name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}

function allElementNull(arr){
	for(elem of arr){
		if(elem != null){
			return false;
		}
	}
	return true;
}
