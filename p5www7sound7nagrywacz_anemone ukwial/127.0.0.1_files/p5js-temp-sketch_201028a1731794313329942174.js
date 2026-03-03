var colors = "191923-0e79b2-bf1363-f39237-ff0000-00ff00-0000ff".split("-").map(a=>"#"+a)
let overAllTexture

var grid;
var colors;
var btn;
const fr = 50; //framerate
let counter = 1;
      let centerX, centerY;
      let squareSize;
      let step;
      let angle;
      let div;
let mic;
 
function setup(){
  
  
  
  
   var cnv = createCanvas(640, 480);
 //cnv.mouseClicked(togglePlay);
   var x = 100;
   var y = 100;
   cnv.position(x, y);
 
 // let cnv = createCanvas(100,100);
  // cnv.mouseClicked(togglePlay);
  // fft = new p5.FFT();
  // sound.amp(0.2);
  
  frameRate(60);

  // Create an Audio input
  mic = new p5.AudioIn();
    mic.setSource();
   mic.start();

 
	 background(100);
	
	xx=width/2
	
	// drawingContext.shadowColor = color(255,0,0,30);
	// drawingContext.shadowBlur =30;
	
	overAllTexture=createGraphics(width,height)
	overAllTexture.loadPixels()
	for(var i=0;i<width;i++){
		for(var o=0;o<height;o++){
			overAllTexture.set(i,o,color(100,noise(i/3,o/3,i*o/50)*random([0,30,60])))
		}
	}
	overAllTexture.updatePixels()
 
        //createDiv("You need Chrome for this to work.");
        //angleMode(DEGREES);
      //  randomConfig();
 
 
}
 function randomConfig() {
        angle = 0;
        centerX = random(width);
        centerY = random(height);
        squareSize = random(20, 40);
        step = random([1, 2, 3, 4, 5, 6, 8]);
      }
	  
function anemone(xx,rid,clr,thickness=1,length=1){
	
	
	blendMode(SCREEN)
	beginShape()
	strokeWeight(noise(rid,5000,frameCount/1000)*100*thickness)
	let hh = noise(xx,rid,1000+frameCount/100)*height*0.6 + random(2)
	stroke(clr)
	
	let lastX,lastY
	for(var i=0;i<hh;i+=2){
		let deltaFactor = map(i,0,100,0,1,true)
		let mouseFactor = map(i,0,400,0,1)*log(hh)/10
		let mouseDirectionFactor = noise(frameCount/50)-0.5
		let mouseDelta = map(mouseX,0,width,-500,500)*mouseDirectionFactor
		
		let deltaX = deltaFactor* (noise(i/300,frameCount/100+mouseY/100,rid)-0.5)*350
		lastX=xx+deltaX+mouseDelta*mouseFactor
		lastY=-i*2*length
		
		let ratio = map(log(i),0,noise(frameCount/100,mouseY/100)*10+5,0,1,true)
		curveVertex(lerp(width/2,lastX,ratio),lastY)
		
	}
	endShape()
	if (thickness!=1 && noise(frameCount/1000,rid)<0.8){
		ellipse(lastX,lastY-10,6,6)
	}
		
}
	  
	  
function draw(){

  push()
		fill(0)
		noStroke()
		blendMode(BLEND)
		rect(0,0,width,height)
	pop()
	push()
		translate(0,height)
		stroke(255)
		blendMode(BLEND)
		// background(0)
		noFill()
		let clrs = colors
		blendMode(SCREEN)
	
		for(var i=0;i<10;i++){

			clrs.forEach((clr,clrId)=>{
			    let vol = mic.getLevel();
				let useColor = color(clr)
				useColor.setAlpha(200 + noise(frameCount/100,i)*10)
				anemone(i*100 ,i*2*vol+clrId/2,useColor)
			})

		}
	
		for(var i=0;i<=4;i++){
			clrs.forEach((clr,clrId)=>{
				let vol = mic.getLevel();
				anemone(i*200,i*2+clrId+50,clr,0.05,1.2)
			})

		}
	pop()
	
	push()
		blendMode(MULTIPLY)
		image(overAllTexture,0,0)
	pop()
  
  // Get the average (root mean square) amplitude
  // fill(127);
  // stroke(0);
 

}

