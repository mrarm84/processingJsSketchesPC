var osc, envelope,noise;
var pan = 0;
var notes = [
  {midi: 55},
  {midi: 58},
  {midi: 62},
  {midi: 63},
  {midi: 67},
  {midi: 70},
  {midi: 72},
  {midi: 39},
  {midi: 43},
  {midi: 46},
  {midi: 55},
  {midi: 74},
  {midi: 79},
]


//   {midi: 39},
//   {midi: 43},
//   {midi: 46},
//   {midi: 55},
//   {midi: 58},
//   {midi: 62},
//   {midi: 63},
//   {midi: 67},
//   {midi: 70},
//   {midi: 72},
//   {midi: 74},
//   {midi: 79},

class PlayString{
  constructor(p1,p2,midi){
    this.p1 = p1
    this.p2 = p2
    this.midi = midi
    this.trTime = 0
    this.useFreq = 0
    
    this.envelope = new p5.Envelope();
    this.envelope.setADSR(random(15,40)/1000,random(10,50)/100, 0.02, this.midi==-1?0.5:( 0.2+100/this.midi) );
    this.envelope.setRange(0.2, 0);
    
    
    if (this.midi!=-1){
      if (random()<0.5){
        this.osc = new p5.SinOsc();
      }else{
        this.osc = new p5.TriOsc();
      }
      this.osc.freq(midiToFreq(this.midi+pan));
      this.useFreq = midiToFreq(this.midi+pan)
    }else{
      this.osc = new p5.Noise();
      
      this.envelope.setADSR(1,0.1,0.05,0.02);
    }
    this.osc.start();
    
    this.envelope.play(this.osc, 0, 0.2);
  }
  update(){
    this.trTime++
    if (random()<0.05 && this.trTime>5){
      this.osc.freq(midiToFreq(this.midi+pan))
      this.useFreq = midiToFreq(this.midi+pan)
    }
    
    // this.p1.x+=sin(frameCount/50)
    // this.p1.y+=cos(frameCount/50)
  }
  draw(){
    push()
      colorMode(HSB)
      
      
      if (this.trTime<20){
        strokeWeight(50*this.trTime)
        stroke( this.useFreq/5,255/sqrt(this.trTime),20*(15-this.trTime) )
      
        strokeWeight(5 + 15 / sqrt(this.trTime) )
        line(this.p1.x,this.p1.y,this.p2.x,this.p2.y)
      }
      
      let panY = 0
      if (this.trTime<20){
        this.panY = sin(this.trTime)*10
      }
    
      stroke( this.useFreq/5,255/sqrt(this.trTime),100)
      strokeWeight(5 + 15 / sqrt(this.trTime) )
      line(this.p1.x,this.p1.y,this.p2.x,this.p2.y)
      
      
      colorMode(RGB)
      fill(255,255,255,50)
      noStroke()
      rect(this.p1.x,this.p1.y+10,this.trTime/2,1)
      
      
    pop()
  }
  play(){
    var midiValue = this.midi;
    var freqValue = midiToFreq(midiValue);
    this.trTime=0
    
    
    
    this.envelope.play(this.osc, 0, 0.2);
  }
  collide(p,obj){
    if (this.trTime >10){
      let p1 = this.p1, p2=this.p2
      
      if(obj){
        this.envelope.setRange(obj.mass/140, 0);
      }
      return (p.dist(p1)+p.dist(p2)<=p1.dist(p2)+0.5)
    
    }
  }
}
class Ball{
  constructor(args){
    let def = {
      p: createVector(0,0),
      v: createVector(0,0),
      a: createVector(0,0),
      mass: random(1,80),
      live: true
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  update(){
    this.p = this.p.add(this.v)
    this.v = this.v.add(this.a)
    let angle = frameCount/10+this.a.x*10+ noise(frameCount/100)*PI*2
    this.p = this.p.add(createVector(cos(angle),sin(angle)).mult(this.a.y*1000).mult(0.01))
    
    if (this.p.x<0) this.v.x= abs(this.v.x)
    if (this.p.x>width) this.v.x = -abs(this.v.x)
    if (this.p.y<0) this.v.y= abs(this.v.y)
    if (this.p.y>height) this.v.y = -abs(this.v.y)
    
  }
  draw(){
    // fill(255)
    push()
      // noFill()
    noStroke()
      fill(255,255,255,this.mass*3)
      ellipse(this.p.x,this.p.y,this.r,this.r)
    pop()
  }
  get r(){
    return sqrt(this.mass/3)+1
  }
}
var strings =[], balls= []

function setup() {
  cursor(HAND);
  createCanvas(windowWidth, windowHeight);
  background(100);
  // osc = new p5.TriOsc();
  // noise = new p5.Noise();
  // noise.start()

  // osc.start();
  for(var i=0;i<notes.length;i++){
    let span = (width*0.9)/notes.length
    let x = i*span+width*0.05
    strings.push(new PlayString(createVector(x+10,height/2),createVector(x-10+span,height/2), notes[i].midi))
    
  }
  
  for(var i=0;i<20;i++){
    balls.push(new Ball({
      p: createVector(random(width),random(height)),
      // v: p5.Vector.random2D().mult(10)
      v: createVector(random(-8,8),random(-8,8)),
      a: createVector(random(-0.5,0.5),random(-0.5,0.5))
    }))
  }
  
}

function draw() {
  
  push()
    stroke(255,255,255,40)
    for(var i=0;i<width;i+=10){
      stroke(255,255,255,i%50==0?70:20)
      line(i,0,i,height)
    }
    for(var o=0;o<height;o+=10){
      stroke(255,255,255,o%50==0?70:20)
      line(0,o,width,o)
    }
    fill(255)
    rect(width/2,height-20,pan*10,5)  
  
  pop()
  
  
  // ellipse(mouseX, mouseY, 20, 20);
  frameRate(30)
  if (frameCount % 200==0){
    pan = random([0,-2,-4,5,6,8])
  }
  background(0,0,0,180)
  push()
    noStroke()
    fill(255,255,255,200)
    textSize(14)
    text("Press Mouse to Release more balls.",20,30)
    textSize(10)
    fill(255,255,255,100)
    text("Created by Che-Yu Wu\n2018/10/21",20,50)
  pop()

  
  noFill()
  stroke(255)
  strings.forEach(s=>s.update())
  strings.forEach(s=>s.draw())
  balls.forEach(b=>b.update())
  balls.forEach(b=>b.draw())
  
  strings.forEach((s,sid)=>{
    
//     s.p1.y+=sin(frameCount/20+sid)*noise(sid)*5
//     s.p2.y+=sin(frameCount/20+sid)*noise(sid)*5
    
    balls.forEach(b=>{
      if (s.collide(b.p,b)){
        s.play()
        b.mass/=3
        b.mass-=5
        // b.live=false
      }
    })
  })
  balls = balls.filter(b=>b.live && b.mass>0)

  if (mouseIsPressed){
    push()
      strokeWeight(1)
      noFill()
      stroke(255,255,255,150)
      let r = sin(frameCount/10)*5+20
      ellipse(mouseX,mouseY,r,r) 
    pop()
    balls.push(new Ball({
      p: createVector(mouseX,mouseY),
      v: createVector(random(-5,5),random(-5,5)),
      a: createVector(random(-0.5,0.5),random(-0.5,0.5))
    }))
  }
//   if (frameCount % 50 ==0 || frameCount==1){
//     var midiValue = 48;
//     var freqValue = midiToFreq(midiValue);
//     osc.freq(freqValue);

//     envelope.play(osc, 0, 0.1);
//   }
  if (frameCount % 15==0){
    
    balls.push(new Ball({
      p: createVector(random(width),random(height)),
      // v: p5.Vector.random2D().mult(10)
      v: createVector(random(-5,5),random(-5,5)),
      a: createVector(random(-0.5,0.5),random(-0.5,0.5))
    }))
  }
}

function mouseMoved(){
  strings.forEach(s=>{
    if (s.collide( createVector(mouseX,mouseY) )){
      s.play()
    }
    
  })
}