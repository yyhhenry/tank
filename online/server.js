const WebSocket=require('ws');
const wss=new WebSocket.Server({port:8060});

let Game;

Game=function(){
	let thisGame=this;
	
	this.init=function(wsa,wsb){
		
	}
}

let lastWs=null;
wss.on('connection',function(ws){
	if(lastWs!=null){
		ws.send(JSON.stringify('alert(\'P2\');'));
		new Game().init(lastWs,ws);
		lastWs=null;
	}else{
		lastWs=ws;
		ws.send(JSON.stringify('alert(\'P1\');'));
	}
	//ws.on('message',function(message){});
});