(function(){function binary_sensor_button(e
) {
var out=' <div id="'+(e.id)+'-state" class="binary-sensor';if(e.state){out+=' checked';}out+='"></div> <img src="onoff.svg" id="'+(e.id)+'" class="toggle-button" onclick="onToggle(this)">';return out;
}function binary_sensor(e
) {
var out=' <div id="'+(e.id)+'-state" class="binary-sensor';if(e.state){out+=' checked';}out+='"></div>';return out;
}function dashboard(it
) {
var out='<!DOCTYPE html><html> <head> <title>Zuhause</title> <meta name="viewport" content="width=device-width,initial-scale=1.0"> <link rel="stylesheet" href="dashboard.css"> <script src="index.js" defer></script> </head> <body> <main> ';var arr1=it.cards;if(arr1){var c,i1=-1,l1=arr1.length-1;while(i1<l1){c=arr1[i1+=1];out+=' <div class="card"> <h1>'+(c.title)+'</h1> ';var arr2=c.entities;if(arr2){var e,i2=-1,l2=arr2.length-1;while(i2<l2){e=arr2[i2+=1];out+='  '; e.state = it.states[e.id]; out+=' <div class="entity"> <span>'+(e.name)+'</span> ';if(e.type === 'binary_sensor_button'){out+='  <div id="'+(e.id)+'-state" class="binary-sensor';if(e.state){out+=' checked';}out+='"></div> <img src="onoff.svg" id="'+(e.id)+'" class="toggle-button" onclick="onToggle(this)"> ';}else if(e.type === 'binary_sensor'){out+='  <div id="'+(e.id)+'-state" class="binary-sensor';if(e.state){out+=' checked';}out+='"></div> ';}out+=' </div> ';} } out+=' </div> ';} } out+=' </main> <div id="disconnect-message">Verbindung getrennt. Verbinde erneut…</div> </body></html>';return out;
}var itself=dashboard, _encodeHTML=(function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());itself.binary_sensor_button=binary_sensor_button;itself.binary_sensor=binary_sensor;if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {__page.render=__page.render||{};__page.render['dashboard']=itself;}}());