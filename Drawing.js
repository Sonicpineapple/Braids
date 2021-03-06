class Tile {
	ctx;
	width = 0;
	height = 0;
	x;
	y;
	col = "#333333";
	crossing = [false,true,false];
	top = false;
	constructor(ctx,x,y,width,height,col="#333333") {
		this.ctx = ctx;
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.col = col;
	}
	
	cross(side) {
		if (side==1) {
			this.crossing[side] = true;
			this.crossing[(side+1)%3] = false;
			this.crossing[(side+2)%3] = false;
		} else {
			this.crossing[side] = !this.crossing[side];
			this.crossing[(side+1)%3] = false;
			this.crossing[(side+2)%3] = false;
			this.crossing[1] = !this.crossing[side];
		}
	}
	
	setTop(top) {
		this.top = top;
	}
	
	setCol(col) {
		this.col = col;
	}

	draw() {		
		if (this.crossing[0]){
			drawS(this.ctx,this.col,this.x,this.y+this.height/2,this.x+this.width,this.y-this.height/2);
		} else if (this.crossing[2]) {
			drawS(this.ctx,this.col,this.x,this.y+this.height/2,this.x+this.width,this.y+3*this.height/2);
		} else if (this.crossing[1]) {
			drawLine(this.ctx,this.col,this.x,this.y+this.height/2,this.x+this.width,this.y+this.height/2)
		}
	}
	
	onClick(side) {
		this.cross(side);
	}
}

function drawLine(ctx, col, startx, starty, endx, endy) {
	ctx.strokeStyle = col;
	ctx.beginPath();
	ctx.moveTo(startx,starty);
	ctx.lineTo(endx,endy);
	ctx.stroke();
}

function drawS(ctx, col, startx, starty, endx, endy) {
	ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(startx,starty);
    let midX = (startx + endx) / 2;
    ctx.bezierCurveTo(midX, starty, midX, endy, endx, endy);
    ctx.stroke();
}

const colours = ['springgreen', 'skyblue', 'lightcoral', 'yellow', "#8db2f7", 'orange', 'lavender', "#2753a3"];
let tiles = [];

function initialise() {
	let canvas = document.getElementById('canvas');
    const canvasLeft = canvas.offsetLeft + canvas.clientLeft;
    const canvasTop = canvas.offsetTop + canvas.clientTop;
    const ctx = canvas.getContext('2d');

	// Add event listener for `click` events.
	canvas.addEventListener('click', function(event) {
		var x = event.pageX - canvasLeft,
			y = event.pageY - canvasTop;
		console.log(x, y);
		for (let i = 0; i < tiles.length; i++) {
			for (let j = 0; j < tiles[0].length; j++) {
				const tile = tiles[i][j];
				const extra = tile.height/4;
				if (y > tile.y - extra && y < tile.y + tile.height + extra && x > tile.x && x < tile.x + tile.width) {
					const delta = -(y<tile.y+extra) + (y>tile.y+tile.height-extra);
					console.log(delta);
					const di = i+delta;
					console.log(di);
					if (tiles[di]!=undefined){
						if (delta == 0) {
							const d2 = (i + tile.crossing[2] - tile.crossing[0] + tiles.length)%tiles.length;
							tiles[d2][j].onClick(1);
						} else if (tiles[di+delta] != undefined && tiles[di+delta][j].crossing[1-delta]) {
							tiles[di+delta][j].onClick(1);
						}
						tile.onClick(1 + delta);
					}
				}
			}
		}
		render(ctx,tiles);
	}, false);
	generate();
}

function traceColours(tiles){
	const done = tiles.map(x => false);
	let col = 0;
	const strands = tiles.length;
	const length = tiles[0].length;
	for (let i = 0; i < tiles.length; i++) {
		if (!done[i]){
			if (col >= colours.length) {
				colours.push(randomColor({count:colours.length-col+1}));
			}
			let k = i;
			let j = 0;
			do {
				if (j==0) { done[k]=true; }
				tiles[k][j].col = colours[col];
				const c = tiles[k][j].crossing;
				k = (k+c[2]-c[0])%strands;
				j = (j+1)%length;
			} while (!(j==0 && done[k]));
			col++;
		}
	}
}

function render(ctx,tiles) {
	const strands = parseInt(document.getElementById('strands').value);
	const length = parseInt(document.getElementById('length').value);
	const dx = ctx.canvas.width/length;
	const dy = ctx.canvas.height/strands;
	
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
	ctx.fillStyle="gray";
	ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
	ctx.strokeStyle="black";
	ctx.lineWidth=5;
	for (let i=0; i<strands; i++) {
		ctx.beginPath();
		ctx.moveTo(0,i*dy);
		ctx.lineTo(ctx.canvas.width,i*dy);
		ctx.stroke();
	}
	for (let i=0; i<length; i++) {
		ctx.beginPath();
		ctx.moveTo(i*dx,0);
		ctx.lineTo(i*dx,ctx.canvas.height);
		ctx.stroke();
	}
	ctx.lineWidth=10;
	traceColours(tiles);
	for (const r of tiles) {
		for (const tile of r) {
			tile.draw();
		}
	};
}

function generate() {
	const strands = parseInt(document.getElementById('strands').value);
	const length = parseInt(document.getElementById('length').value);
	
	let canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    tiles = [];
	
	const dx = canvas.width/length;
	const dy = canvas.height/strands;
	for (let s = 0; s < strands; s++) {
		//const col = colours[s];
		let t = [];
		for (let i = 0; i < length; i++) {
			let tile = new Tile(ctx,i*dx,s*dy,dx,dy);
			//tile.draw();
			t.push(tile);
		}
		tiles.push(t);
	}

	// Render elements.
	ctx.clearRect(0,0,canvas.width,canvas.height);
	render(ctx,tiles);
	console.log()
}

window.onload=initialise;