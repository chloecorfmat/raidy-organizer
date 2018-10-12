function apiCall(method, url, jsonData) {
    var xhttp = new XMLHttpRequest();
	var response;
    xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
             response = JSON.parse(this.responseText);
         }
    };
    xhttp.open(method, url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(jsonData);
	
	return response;
}