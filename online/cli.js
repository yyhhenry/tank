window.onload=function(){
	let canvas=document.getElementById('canvas');
	let ws=new WebSocket("wss://10.176.20.22:8080");
	ws.onopen=function(){}
	ws.onmessage=function(data){
		eval(JSON.parse(data.data));
	}
}