const WebSocket=require('ws');
let wss=new WebSocket.Server({port:5208});
let Game;
let Tank;
let Bullet;
let Ground;
Tank=function(){
	let thisTank=this;
	let wsa;
	let wsb;
	let x;
	let y;
	let f;
	let color;
	let bulletCount;
	let lastFireTime;
	let died;
	this.init=function(_wsa,_wsb,_x,_y,_f,_color){
		wsa=_wsa;
		wsb=_wsb;
		x=_x;
		y=_y;
		f=_f;
		color=_color;
		bulletCount=5;
		died=false;
		lastFireTime=new Date().getTime();
		return this;
	}
	this.getPos=function(){
		return {x:x,y:y};
	}
	this.draw=function(rg){
		let t=rg({x:x,y:y});
		let ff=f-Math.PI/2;
		let tcos=Math.cos(ff);
		let tsin=Math.sin(ff);
		if(color=='red'){
			wsa.addDraw(`ctx.fillStyle='rgb(250,140,140)';`);
			wsb.addDraw(`ctx.fillStyle='rgb(140,250,140)';`);
		}else{
			wsa.addDraw(`ctx.fillStyle='rgb(140,250,140)';`);
			wsb.addDraw(`ctx.fillStyle='rgb(250,140,140)';`);
		}
		let todo=`
		ctx.rotate(${-ff});
		ctx.fillRect(${t.x*tcos-t.y*tsin-7},${t.x*tsin+t.y*tcos-10},14,20);
		ctx.fillRect(${t.x*tcos-t.y*tsin-2},${t.x*tsin+t.y*tcos-16},4,6);`;
		if(died){
			todo+=`
			ctx.fillStyle='rgba(0,0,0,0.4)';
			ctx.fillRect(${t.x*tcos-t.y*tsin-14},${t.x*tsin+t.y*tcos-20},28,40);
			ctx.fillRect(${t.x*tcos-t.y*tsin-4},${t.x*tsin+t.y*tcos-32},8,12);`;
		}
		todo+=`ctx.rotate(${ff});`;
		wsa.addDraw(todo);
		wsb.addDraw(todo);
	}
	this.die=function(){
		died=true;
	}
	this.move=function(rv,tl,tr,tg,tb){
		if(died)return;
		let v=rv({x:x,y:y});
		if(tl&&!tr){
			f+=Math.PI/50;
		}else if(tr&&!tl){
			f-=Math.PI/50;
		}
		let np;
		if(tg&&!tb){
			np={x:x+Math.cos(f)/30,y:y-Math.sin(f)/30};
		}else if(tb&&!tg){
			np={x:x-Math.cos(f)/30,y:y+Math.sin(f)/30};
		}else{
			np={x:x,y:y};
		}
		if(Math.floor(x-0.25)<Math.floor(x)){
			v.t=v.t||rv({x:x,y:y-1}).l||rv({x:x-1,y:y}).t;
			v.b=v.b||rv({x:x,y:y+1}).l||rv({x:x-1,y:y}).b;
		}else if(Math.floor(x+0.25)>Math.floor(x)){
			v.t=v.t||rv({x:x,y:y-1}).r||rv({x:x+1,y:y}).t;
			v.b=v.b||rv({x:x,y:y+1}).r||rv({x:x+1,y:y}).b;
		}
		if(Math.floor(y-0.25)<Math.floor(y)){
			v.l=v.l||rv({x:x-1,y:y}).t||rv({x:x,y:y-1}).l;
			v.r=v.r||rv({x:x+1,y:y}).t||rv({x:x,y:y-1}).r;
		}else if(Math.floor(y+0.25)>Math.floor(y)){
			v.l=v.l||rv({x:x-1,y:y}).b||rv({x:x,y:y+1}).l;
			v.r=v.r||rv({x:x+1,y:y}).b||rv({x:x,y:y+1}).r;
		}
		if(v.l&&Math.floor(x-0.3)<Math.floor(x)){
			np.x=x+1/30;
		}else if(v.r&&Math.floor(x+0.3)>Math.floor(x)){
			np.x=x-1/30;
		}
		if(v.t&&Math.floor(y-0.3)<Math.floor(y)){
			np.y=y+1/30;
		}else if(v.b&&Math.floor(y+0.3)>Math.floor(y)){
			np.y=y-1/30;
		}
		x=np.x;
		y=np.y;
	}
	this.fire=function(callback){
		if(died)return;
		let thisFireTime=new Date().getTime();
		if(thisFireTime-lastFireTime>200&&bulletCount>0){
			lastFireTime=thisFireTime;
			bulletCount--;
			callback(new Bullet().init(wsa,wsb,x+Math.cos(f)*0.27,y-Math.sin(f)*0.27,f,function(){bulletCount++;}));
		}
	}
}
Bullet=function(){
	let thisBullet=this;
	let wsa;
	let wsb;
	let life=true;
	let x;
	let y;
	let f;
	let dis;
	let cb;
	this.init=function(_wsa,_wsb,_x,_y,_f,_cb){
		wsa=_wsa;
		wsb=_wsb;
		x=_x;
		y=_y;
		f=_f;
		cb=_cb;
		dis=30;
		return this;
	}
	this.move=function(rv){
		if(!life)return;
		let v=rv({x:x,y:y});
		let np={x:x+Math.cos(f)/20,y:y-Math.sin(f)/20};
		dis-=1/20;
		if(v.l==null||dis<0){
			life=false;
			cb();
			return;
		}
		const tp=0.07;
		if(Math.floor(x-tp/2)<Math.floor(x)){
			v.t=v.t||rv({x:x,y:y-1}).l||rv({x:x-1,y:y}).t;
			v.b=v.b||rv({x:x,y:y+1}).l||rv({x:x-1,y:y}).b;
		}else if(Math.floor(x+tp/2)>Math.floor(x)){
			v.t=v.t||rv({x:x,y:y-1}).r||rv({x:x+1,y:y}).t;
			v.b=v.b||rv({x:x,y:y+1}).r||rv({x:x+1,y:y}).b;
		}
		if(Math.floor(y-tp/2)<Math.floor(y)){
			v.l=v.l||rv({x:x-1,y:y}).t||rv({x:x,y:y-1}).l;
			v.r=v.r||rv({x:x+1,y:y}).t||rv({x:x,y:y-1}).r;
		}else if(Math.floor(y+tp/2)>Math.floor(y)){
			v.l=v.l||rv({x:x-1,y:y}).b||rv({x:x,y:y+1}).l;
			v.r=v.r||rv({x:x+1,y:y}).b||rv({x:x,y:y+1}).r;
		}
		if(v.l&&Math.floor(np.x-tp)<Math.floor(x)){
			np.x=Math.floor(x)+tp;
			f=Math.PI-f;
		}else if(v.r&&Math.floor(np.x+tp)>Math.floor(x)){
			np.x=Math.floor(x)+1-tp;
			f=Math.PI-f;
		}
		if(v.t&&Math.floor(np.y-tp)<Math.floor(y)){
			np.y=Math.floor(y)+tp;
			f=-f;
		}else if(v.b&&Math.floor(np.y+tp)>Math.floor(y)){
			np.y=Math.floor(y)+1-tp;
			f=-f;
		}
		x=np.x;
		y=np.y;
	}
	this.draw=function(rg){
		if(!life)return;
		let t=rg({x:x,y:y});
		let todo=`
		ctx.beginPath();
		ctx.arc(${t.x},${t.y},3,0,2*Math.PI);
		ctx.closePath();
		ctx.fillStyle='rgb(0,0,0)';
		ctx.fill()`;
		wsa.addDraw(todo);
		wsb.addDraw(todo);
	}
	this.hit=function(tank){
		if(!life)return false;
		let v=tank.getPos();
		if(Math.sqrt((x-v.x)*(x-v.x)+(y-v.y)*(y-v.y))<0.3){
			life=false;
			cb();
			tank.die();
			return true;
		}
		return false;
	};
}
Ground=function(){
	let thisGround=this;
	let wsa;
	let wsb;
	let x;
	let y;
	let width;
	let height;
	let v;
	const wb=20;
	const hb=10;
	let rg;
	let rv;
	let redOne;
	let greenOne;
	let bullets;
	let addBullet;
	let win;
	this.init=function(_wsa,_wsb,_x,_y,_width,_height){
		wsa=_wsa;
		wsb=_wsb;
		x=_x;
		y=_y;
		width=_width;
		height=_height;
		v=[];
		for(let i=0;i<wb;i++){
			v[i]=[];
			for(let j=0;j<hb;j++){
				v[i][j]={
					r:i==wb-1||Math.random()<1/2,
					b:j==hb-1||Math.random()<1/4,
				};
			}
		}
		let t1={x:Math.floor(Math.random()*wb),y:Math.floor(Math.random()*hb)};
		let t2;
		(function(){
			let q=[];
			for(let i=0;i<wb;i++){
				q[i]=[];
				for(let j=0;j<hb;j++){
					q[i][j]=false;
				}
			}
			let vt=[];
			let dfs=function(tx,ty){
				if(q[tx][ty])return;
				q[tx][ty]=true;
				vt.push({x:tx,y:ty});
				if(!v[tx][ty].r)dfs(tx+1,ty);
				if(!v[tx][ty].b)dfs(tx,ty+1);
				if(tx>0&&!v[tx-1][ty].r)dfs(tx-1,ty);
				if(ty>0&&!v[tx][ty-1].b)dfs(tx,ty-1);
			}
			dfs(t1.x,t1.y);
			t2=vt[Math.floor(Math.random()*vt.length)];
		})();
		rg=function(vv){
			return {x:x+(vv.x+1)*width/(wb+2),y:y+(vv.y+1)*height/(hb+2)};
		}
		rv=function(vv){
			let hv={x:Math.floor(vv.x),y:Math.floor(vv.y)};
			if(hv.x<0||hv.y<0||hv.x>=wb||hv.y>=hb)return {};
			return {
				l:hv.x==0||v[hv.x-1][hv.y].r,
				r:v[hv.x][hv.y].r,
				t:hv.y==0||v[hv.x][hv.y-1].b,
				b:v[hv.x][hv.y].b
			};
		}
		bullets=[];
		addBullet=function(bullet){
			bullets.push(bullet);
		}
		redOne=new Tank().init(wsa,wsb,t1.x+0.5,t1.y+0.5,Math.random()*2*Math.PI,'red');
		greenOne=new Tank().init(wsa,wsb,t2.x+0.5,t2.y+0.5,Math.random()*2*Math.PI,'green');
		win='none';
		return this;
	}
	this.iswin=function(){
		return win;
	}
	this.draw=function(keys){
		let todo=`
		ctx.fillStyle='rgb(250,250,230)';
		ctx.fillRect(${x},${y},${width},${height});
		ctx.beginPath();
		ctx.moveTo(${x+width/(wb+2)},${y+height/(hb+2)});
		ctx.lineTo(${x+width-width/(wb+2)},${y+height/(hb+2)});
		ctx.moveTo(${x+width/(wb+2)},${y+height/(hb+2)});
		ctx.lineTo(${x+width/(wb+2)},${y+height-height/(hb+2)});`;
		for(let i=0;i<wb;i++){
			for(let j=0;j<hb;j++){
				if(v[i][j].r){
					todo+=`
					ctx.moveTo(${Math.floor(x+(i+2)*width/(wb+2))},${Math.floor(y+(j+1)*height/(hb+2))});
					ctx.lineTo(${Math.floor(x+(i+2)*width/(wb+2))},${Math.floor(y+(j+2)*height/(hb+2))});`;
				}
				if(v[i][j].b){
					todo+=`
					ctx.moveTo(${Math.floor(x+(i+1)*width/(wb+2))},${Math.floor(y+(j+2)*height/(hb+2))});
					ctx.lineTo(${Math.floor(x+(i+2)*width/(wb+2))},${Math.floor(y+(j+2)*height/(hb+2))});`;
				}
			}
		}
		todo+=`
		ctx.closePath();
		ctx.lineWidth=3;
		ctx.fillColor='rgb(230,200,230)';
		ctx.stroke();`;
		wsa.addDraw(todo);
		wsb.addDraw(todo);
		if(win=='none')redOne.move(rv,keys[65],keys[68],keys[87],keys[83]);
		redOne.draw(rg);
		if(keys[81])redOne.fire(addBullet);
		if(win=='none')greenOne.move(rv,keys[37],keys[39],keys[38],keys[40]);
		greenOne.draw(rg);
		if(keys[77])greenOne.fire(addBullet);
		for(let i=0;i<bullets.length;i++){
			if(win=='none'){
				bullets[i].move(rv);
				if(bullets[i].hit(redOne)){
					win='green';
				}else if(bullets[i].hit(greenOne)){
					win='red';
				}
			}
			bullets[i].draw(rg);
		}
	}
}
Game=function(){
	let thisGame=this;
	let life;
	let ground;
	let keys;
	let greenCnt;
	let redCnt;
	let stop;
	let wsa;
	let wsb;
	this.init=function(_wsa,_wsb){
		wsa=_wsa;
		wsb=_wsb;
		wsa.send(JSON.stringify(`
		canvas.style.position='fixed';
		canvas.style.left=0;
		canvas.style.right=0;
		canvas.style.top=0;
		canvas.style.bottom=0;`));
		wsb.send(JSON.stringify(`
		canvas.style.position='fixed';
		canvas.style.left=0;
		canvas.style.right=0;
		canvas.style.top=0;
		canvas.style.bottom=0;`));
		ground=new Ground().init(wsa,wsb,50,50,800,400);
		keys=[];
		wsa.on('message',function(data){
			if(!life)return;
			data=JSON.parse(data);
			if(data.key==37){
				keys[65]=data.sta;
			}else if(data.key==39){
				keys[68]=data.sta;
			}else if(data.key==38){
				keys[87]=data.sta;
			}else if(data.key==40){
				keys[83]=data.sta;
			}else if(data.key==77){
				keys[81]=data.sta;
			}
		});
		wsb.on('message',function(data){
			if(!life)return;
			data=JSON.parse(data);
			if(data.key==37){
				keys[37]=data.sta;
			}else if(data.key==39){
				keys[39]=data.sta;
			}else if(data.key==38){
				keys[38]=data.sta;
			}else if(data.key==40){
				keys[40]=data.sta;
			}else if(data.key==77){
				keys[77]=data.sta;
			}
		});
		greenCnt=0;
		redCnt=0;
		stop=false;
		life=true;
		thisGame.draw();
		return this;
	}
	this.clear=function(){
		page.innerHTML='';
		life=false;
	}
	this.draw=function(){
		if(!life)return;
		if(!stop&&ground.iswin()!='none'){
			if(ground.iswin()=='red'){
				redCnt++;
			}else{
				greenCnt++;
			}
			stop=true;
			setTimeout(function(){
				ground=new Ground().init(wsa,wsb,50,50,800,400);
				stop=false;
			},3000);
		}
		wsa.addDraw(`
		canvas.width=window.outerWidth;
		canvas.height=window.outerHeight;
		let ctx=canvas.getContext('2d');
		ctx.fillStyle='rgb(200,220,250)';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle='rgb(0,0,0)';
		ctx.font='20px 黑体';
		ctx.textAlign='center';
		ctx.textBaseline='middle';
		ctx.fillText('红色 '+${redCnt},150,500);
		ctx.fillText('绿色 '+${greenCnt},550,500);
		ctx.fillText('方向键+M',150,530);`);
		wsb.addDraw(`
		canvas.width=window.outerWidth;
		canvas.height=window.outerHeight;
		let ctx=canvas.getContext('2d');
		ctx.fillStyle='rgb(200,220,250)';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle='rgb(0,0,0)';
		ctx.font='20px 黑体';
		ctx.textAlign='center';
		ctx.textBaseline='middle';
		ctx.fillText('红色 '+${greenCnt},150,500);
		ctx.fillText('绿色 '+${redCnt},550,500);
		ctx.fillText('方向键+M',150,530);`);
		ground.draw(keys);
		wsa.sendAll();
		wsb.sendAll();
		setTimeout(thisGame.draw,20);
	}
}

let lastWs=null;
wss.on('connection',function(ws){
	ws.drawCode='';
	ws.addDraw=function(v){
		ws.drawCode+=v;
	}
	ws.sendAll=function(){
		ws.send(JSON.stringify(ws.drawCode));
		ws.drawCode='';
	}
	if(lastWs!=null){
		new Game().init(lastWs,ws);
		lastWs=null;
	}else{
		lastWs=ws;
	}
});