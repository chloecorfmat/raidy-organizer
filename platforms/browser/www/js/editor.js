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
var raidID = getURLParameter("id",null);
console.log(raidID);
function main() {
    var disconnection = document.getElementById("disconnect");
	disconnection.addEventListener("click", disconnect);

    enableMenu();

    mapManager = new MapManager();
    mapManager.initialize();
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
