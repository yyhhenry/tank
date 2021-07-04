window.onload=function(){
	let canvas=document.getElementById('canvas');
	const servers=['ws://yyhhenry.imwork.net:80','ws://localhost:5208'];
	const usingServer=1;
	let ws=new WebSocket(servers[usingServer]);
	console.log(servers[usingServer]);
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