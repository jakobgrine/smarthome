(function(){function switch_(e
) {
var out=' <div class="binary-sensor';if(e.state){out+=' checked';}out+='"></div> <img src="onoff.svg" id="'+(e.id)+'" class="toggle-button" onclick="onSwitchToggle(this)">';return out;
}function binary_sensor(e
) {
var out=' <div id="'+(e.id)+'" class="binary-sensor';if(e.state){out+=' checked';}out+='"></div>';return out;
}function entities(it
) {
var out='';return out;
}var itself=entities, _encodeHTML=(function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());itself.switch_=switch_;itself.binary_sensor=binary_sensor;if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {__page.render=__page.render||{};__page.render['entities']=itself;}}());