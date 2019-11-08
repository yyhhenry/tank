window.onload=function(){
	let canvas=document.getElementById('canvas');
	let ws;
	ws=new WebSocket("ws://10.176.20.22:8060");
	ws.onopen=function(){}
	ws.onmessage=function(data){
		eval(JSON.parse(data.data));
	}
}