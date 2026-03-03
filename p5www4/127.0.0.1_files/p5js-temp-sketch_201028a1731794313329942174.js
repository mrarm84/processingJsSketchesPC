//Parameters
var ts = 1/10;

//Initiate index vars
var t=0;
var t2=0;

function setup() {    
    createCanvas(1112, 834);
	
	
	 
	 
	
    background(0);
	
	  //Create Sliders
    f_slider = createSlider(2,12,2);
    f_slider.position(20,120);
	  s_slider = createSlider(1,11,1);
    s_slider.position(20,150);
	  sw_slider = createSlider(-99,100,2);
    sw_slider.position(20,180);
	  k_slider = createSlider(3,300,140);
    k_slider.position(290,150);
	  w_slider = createSlider(3,48,9);
    w_slider.position(290,180);
	  
	  F = [];
	  for(w=0; w<9; w++){
			F.push(random(1,5));
		}
}

function draw() {
	fill(0)
	rect(0,0,width,height)
	
	k=k_slider.value();
  nwaves=w_slider.value();
	
	f=f_slider.value()/(f_slider.value()-1);
	stroke(0)
	fill(255)
	text("---Harmonic Flow---",20,110);
	text("Shape = "+f_slider.value()+"/"+(f_slider.value()-1),160,137);
	text("Base Speed = "+s_slider.value(),160,167);
	text("Wave Speed = "+sw_slider.value(),160,197);
	text("Number of Dots = "+k_slider.value(),430,167);
	text("Number of Waves = "+w_slider.value(),430,197);
	
	noStroke();
	translate(0, 80);
	for(w=0; w<nwaves; w++){
		var verts = [];
		for(var a = 0; a < k; a++){
				th = a/k*TWO_PI;
				tw = t-t2*w/(nwaves-1);
				r = (sin(f*(th+tw*ts)))/2+(sin((th+tw*ts)))/2;
			  ragg=0;
			  for(w2=0; w2<nwaves; w2++){
					tw = t-((t2)*w2/(nwaves-1)/50);
				  ragg += (sin(f*(th+tw*ts)))/2+(sin((th+tw*ts)))/2; 
				}
			  ragg=ragg/nwaves;
			  r = a/k*ragg + (k-a)/k*r;
				x = a/(k-1)*(width-100)+50;
				y = r*height/3+height/2;
				verts.push(createVector(x,y));
		}
		fill(255*w/(nwaves-1),255*(nwaves-1-w)/(nwaves-1),255,255)
		for(var j = 0; j < k; j++){
				ellipse(verts[j].x, verts[j].y,5,5);
		}
	}
	t+=s_slider.value()/7;
	t2+=sw_slider.value()/50;
}

function keyPressed(){
  save('pix.jpg');
} 