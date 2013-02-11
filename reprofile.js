/*
*	JS Profiling System
*
*/

Profiling = window.Profiling || {};


//merge with default settings
Profiling.default_setting = {
	"prepend" : "",
	"postend" : "",
	"url" : "",
	"method" : "POST",
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
if (Profiling.method.toUpperCase() == "POST") {
	Profiling.ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
}

Profiling.ajax.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
		Profiling.serverCallback.apply(this, arguments);
	} 
};

Profiling.serverLog = function () {
	var	send_str,
		url = this.url,
		method = this.method.toUpperCase(),
		args = [].slice.call(arguments, 0);

	return this.__sendServer(method, url, args);
};

Profiling.serverUrlLog = function () {
	var	send_str,
		url = arguments[0],
		method = this.method.toUpperCase(),
		args = [].slice.call(arguments, 1);

	return this.__sendServer(method, url, args);
};

Profiling.__sendServer = function (method, url, data) {
	var send_str = this.__getSendString(data);
		
	if (method == "POST") {
		Profiling.ajax.open("POST", url, true);
		Profiling.ajax.send(send_str)
		return Profiling.ajax
	}

	url += "?" + send_str;
	Profiling.ajax.open("GET", url, true);
	return Profiling.ajax
};

Profiling.__getSendString = function (args) {
	var time_steps = this.__time_steps(),
		send_str = ["ts=" + time_steps[0]];
		send_str.push("ts_last=" + time_steps[1]);
		
	for (var i=0, len=args.length; len < i; i++) {
		send_str.push("var" + i + "=" + encodeURIComponent(args[i]));
	}
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

Profiling.__time_steps = function () {
	var delta = this.delta_ts(),
		delta_last = this.ts_last - this.__getTime();
	
	this.ts_last = this.__getTime();
	return [delta, delta_last]
};

Profiling.__getTime = function () {
	return (new Date()).getTime()
};

Profiling.delta_ts = function () {
	return this.ts_start - this.__getTime()
};
Profiling.ts_start = (new Date()).getTime();
Profiling.ts_last = Profiling.ts_start;