window.onload=function(){
	let canvas=document.getElementById('canvas');
	let ws=new WebSocket("ws://localhost:5208");
	ws.onopen=function(){}
	ws.onmessage=function(data){
		eval(JSON.parse(data.data));
	}
	window.onkeydown=function(event){
		ws.send(JSON.stringify({key:event.keyCode,sta:true}));
	}
	window.onkeyup=function(event){
		ws.send(JSON.stringify({key:event.keyCode,sta:false}));
	}
}