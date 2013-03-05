/*
*	ReprofileJS
*
*	use a Profiling global to define options BEFORE import this file, as a JS object
*	Es:
*	<script type="text/javascript">Profiling = {"url" : "/logpage"}</script>
*	<script type="text/javascript" src="/js-files/reprofile.js"></script>
*
*/

Profiling = window.Profiling || {};


//Frameworks check
Profiling.fw = {
	"MooTools" : !!window.MooTools,
	"jQuery" : !!window.jQuery
};

Profiling.jsonify = false; //cannot send JSON
if (window.JSON && window.JSON.stringify) {Profiling.jsonify = window.JSON.stringify;}
if (!Profiling.jsonify && Profiling.fw.MooTools) {Profiling.jsonify = JSON.encode;}

//merge with default settings
Profiling.default_setting = {
	"url" : "",
	"method" : "POST",
	"interval" : 1000, //milliseconds
	"callback" : function () {}, //args: array with time steps, arguments of log
	"serverCallback" : function () {} //args: 
};

for (var k in Profiling.default_setting) {
	if (Profiling.default_setting.hasOwnProperty(k) && !(k in Profiling)) {
		Profiling[k] = Profiling.default_setting[k];
	}
}

/////////////
if (window.ActiveXObject) {
	try {
		Profiling.ajax = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		Profiling.ajax = new ActiveXObject("Microsoft.XMLHTTP");
	}
}
if (window.XMLHttpRequest) {
	Profiling.ajax = new XMLHttpRequest();
}
Profiling.setPOSTAjaxHeaders = function () {};
if (Profiling.method.toUpperCase() == "POST") {
	Profiling.setPOSTAjaxHeaders = function (data) {
		Profiling.ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		Profiling.ajax.setRequestHeader("Content-Length", data.length);
	};
}

Profiling.ajax.onreadystatechange = function () {
	var logItem,
		self = Profiling;

	Profiling.serverCallback.apply(this, arguments);

	if (this.readyState == 4 && this.status == 200) {
		Profiling.__sendLogs();
	} else {self.startAutoSending();}
};

Profiling.sendAllow = true;
Profiling.__stackedLogs = [];
Profiling.__sendLogs = function () {
	var logItem,
		self = Profiling;

	self.stopAutoSending(); //stops the __sendLogs timeout.

	if (self.__stackedLogs.length) {
		logItem = self.__stackedLogs.shift();
		self.__sendServer(logItem[0], logItem[1], logItem[2]); //method, url, args

	//if no elemnts, function will be called again
	} else {self.startAutoSending();}
};

Profiling.serverLog = function (data, url) {
	var	method = this.method.toUpperCase();

	Profiling.__stackedLogs.push([method, url, data]);

	return 0
};

Profiling.__sendServer = function (method, url, data) {
	var send_str = this.__getSendString(data);
	url = url || this.url;

	if (method == "POST") {
		Profiling.ajax.open("POST", url, true);
		Profiling.setPOSTAjaxHeaders(send_str);
		Profiling.ajax.send(send_str)
		return Profiling.ajax
	}

	url += "?" + send_str;
	Profiling.ajax.open("GET", url, true);
	return Profiling.ajax
};

Profiling.__getSendString = function (data) {
	var data_type = "string", data_value = data.toString(),
		time_steps = this.__time_steps(),
		send_str = ["ts=" + time_steps[0]];
		send_str.push("ts_last=" + time_steps[1]);

	data_type = ((data instanceof Object) || (data instanceof Array)) ? "json" : data_type;
	if (data_type == "json" && this.jsonify) {
		data_value = this.jsonify(data);
	}
	
	send_str.push("type=" + data_type);
	send_str.push("data=" + data_value);
	send_str = send_str.join("&");
	return send_str
};

///////////////////////

if (window.console && window.console.log) {
	Profiling.log = function () {
		var time_steps = this.__time_steps(),
			args = [].slice.call(arguments, 0);
		
		window.console.log((new Array(11)).join("*"))
		window.console.log("Time from start:", time_steps[0])
		window.console.log("Time from last log:", time_steps[1])
		window.console.log.apply(window, arguments)
		window.console.log((new Array(16)).join("*"))

		this.callback(time_steps, args);
	};

} else {
	Profiling.log = function () {
		var alert_str,
			time_steps = this.__time_steps(),
			args = [].slice.call(arguments, 0);
		
		alert_str = ["Time from start:" + time_steps[0]];
		alert_str.push("Time from last log:" + time_steps[1]);
		alert_str.push(args.join("\n"))
		alert_str = alert_str.join("\n");
			
		alert(alert_str);
		this.callback(time_steps, args);
	};
}


Profiling.tsReset = function () {
	this.ts_start = (new Date()).getTime();
	this.ts_last = this.ts_start;	
};

Profiling.__time_steps = function () {
	var delta = this.delta_ts(),
		delta_last = this.__getTime() - this.ts_last;
	
	this.ts_last = this.__getTime();
	return [delta, delta_last];
};

Profiling.__getTime = function () {
	return (new Date()).getTime();
};

Profiling.delta_ts = function () {
	return this.__getTime() - this.ts_start;
};
Profiling.ts_start = (new Date()).getTime();
Profiling.ts_last = Profiling.ts_start;
Profiling.startAutoSending = function () {
	Profiling.startAutoSending.timeid = setTimeout(Profiling.__sendLogs, Profiling.interval);
};
Profiling.stopAutoSending = function () {clearTimeout(Profiling.startAutoSending.timeid);};
Profiling.startAutoSending();