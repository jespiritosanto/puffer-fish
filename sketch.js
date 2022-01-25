let _minWidth;
let _palette =
["006ba6","0496ff","ffbc42","d81159","4da167"];
let _aryPoints = [];
let _d;
let _type;
let _unitTime;
let _numStep;

function setup() {
  createCanvas(windowWidth, windowHeight);
  _minWidth = min(width, height) * 0.8;
  colorMode(HSB, 360, 100, 100, 255);
  ellipseMode(RADIUS);
  frameRate(30);
  noStroke();
  ellipseMode(RADIUS);
  setObject();
}

function setObject() {
  shuffle(_palette, true);

  let numPoints = 40;
  let xy1Start = createVector(0, 0);
  let xy2Start = createVector(0, 0);
  let unitTime = 45;
  _numStep = 6;
  let xyShift = createVector(_minWidth / _numStep, 0);
  _aryPoints = [];
  let maxR = _minWidth / _numStep / 2;
  let d = 5;
  let type = "inout";
  let delay = -10;
  for (let i = 0; i < numPoints; i++) {
    let rnd = random([0, 1, 2, 3]);
    let xy1End = p5.Vector.add(xy1Start, p5.Vector.rotate(xyShift, PI/2 * rnd));
    let xy2End = p5.Vector.add(xy2Start, p5.Vector.rotate(xyShift, PI/2 * rnd));
    let r = maxR / numPoints *(i + 1);
    _aryPoints[i] = new Points(xy1Start, xy1End, xy2Start, xy2End, r, unitTime, xyShift, type, d, delay);
  }
}

class Points {
  constructor(xy1Start, xy1End, xy2Start, xy2End, r, unitTime, xyShift, type, d, delay) {
    this.xy1Start = xy1Start;
    this.xy1End = xy1End;
    this.xy2Start = xy2Start;
    this.xy2End = xy2End;
    this.r = r;
    this.unitTime = unitTime;
    this.timeNumber = 0;
    this.count1 = 0;
    this.count2 = delay;
    this.xyShift = xyShift;
    this.d = d;
    this.type = type;
    this.col = color("#" + random(_palette));
  }
  
  update() {
    let unitTime = this.unitTime;

    this.xy1Current = p5.Vector.lerp(this.xy1Start, this.xy1End, easing(unitTime, this.count1, this.type, this.d));
    this.count1++;
    if (this.count1 > unitTime) {
      this.count1 = 0;
      this.xy1Start = this.xy1End;
      let xy1EndNew = p5.Vector.add(this.xy1End, p5.Vector.rotate(p5.Vector.mult(this.xyShift, int(random(1, _numStep))), PI/2 * random([0, 1, 2, 3])));
      let margin = 1.01;
      while(xy1EndNew.x > _minWidth/2 * margin || xy1EndNew.x < -_minWidth/2 * margin || xy1EndNew.y > _minWidth/2 * margin || xy1EndNew.y < -_minWidth/2 * margin) { 
        xy1EndNew = p5.Vector.add(this.xy1End, p5.Vector.rotate(p5.Vector.mult(this.xyShift, int(random(1, _numStep))), PI/2 * random([0, 1, 2, 3])));
      }
      this.xy1End = xy1EndNew;
      this.xy1Current = this.xy1Start;

      this.xy2EndNext = xy1EndNew; 
    }

    this.xy2Current = p5.Vector.lerp(this.xy2Start, this.xy2End, easing(unitTime, max(0, this.count2), this.type, this.d));
    this.count2++;
    if (this.count2 > unitTime) {
      this.count2 = 0;
      this.xy2Start = this.xy2End;
      this.xy2End = this.xy2EndNext;
      
      this.xy2Current = this.xy2Start;
    }
  }

  draw() {
    fill(this.col);
    if (this.xy1Current.x == this.xy2Current.x && this.xy1Current.y == this.xy2Current.y) {
      ellipse(this.xy2Current.x, this.xy2Current.y, this.r);
    } else {
      let aryPoints = getContactLine(this.xy1Current, this.xy2Current, this.r, this.r);
      drawVertexShape(aryPoints);
    } 
  }
}

function getContactLine(xy1, xy2, r1, r2) {
  let xy_l;
  let xy_s;
  let r_l;
  let r_s;
  if (r1 > r2) {
    xy_l = xy1;
    xy_s = xy2;
    r_l = r1;
    r_s = r2;
  } else {
    xy_l = xy2;
    xy_s = xy1;
    r_l = r2;
    r_s = r1;
  }
  let numAng = 64;
  let aryContactLinePoints = [];
  let d = p5.Vector.dist(xy_l, xy_s);
  if (d <= r_l - r_s) {
    for (let i = 0; i < numAng; i++) {
      let vec_radius_l = createVector(0, r_l);
      let vec = p5.Vector.add(xy_l, vec_radius_l);
      aryContactLinePoints.push(vec);
      vec_radius_l.rotate(2*PI / numAng);
    }
  }
  
  let theta_l = acos((r_l - r_s) / d);
  let vec_l_s = p5.Vector.sub(xy_s, xy_l);
  let vec_radius_l = p5.Vector.rotate(vec_l_s, theta_l).setMag(r_l);
  
  for (let i = 0; i < numAng + 1; i++) {
    let vec = p5.Vector.add(xy_l, vec_radius_l);
    aryContactLinePoints.push(vec);
    vec_radius_l.rotate((2*PI - theta_l * 2) / numAng);
  }
  let theta_s = PI - theta_l;
  let vec_s_l = p5.Vector.sub(xy_l, xy_s);
  let vec_radius_s = p5.Vector.rotate(vec_s_l, theta_s).setMag(r_s);
  for (let i = 0; i < numAng + 1; i++) {
    let vec = p5.Vector.add(xy_s, vec_radius_s);
    aryContactLinePoints.push(vec);
    vec_radius_s.rotate((2*PI - theta_s * 2) / numAng);
  }

  return aryContactLinePoints;
}

function drawVertexShape(aryPoints) {
  beginShape();
  for (let i = 0; i < aryPoints.length; i++) {
    vertex(aryPoints[i].x, aryPoints[i].y);
  }
  endShape(CLOSE);
}

function easing(unitTime, t, type, d) {
  let value;
  if (type == "in") {
    value = easeIn(unitTime, t, d);
  } else if (type == "out") {
    value = easeOut(unitTime, t, d);
  } else if (type == "inout") {
    value = easeInOut(unitTime, t, d);
  }

  return value;
}

function easeIn(unitTime, t, d) {
  let value = (t / unitTime)**d;

  return value;
}

function easeOut(unitTime, t, d) {
  let t2 = unitTime - t;
  let value = 1 - easeIn(unitTime, t2, d);

  return value;
}

function easeInOut(unitTime, t, d) {
  let t2;
  let value;
  if (t < unitTime / 2) {
    t2 = t * 2;
    value = easeIn(unitTime, t2, d) / 2;
  } else {
    t2 = t * 2 - unitTime;
    value = easeOut(unitTime, t2, d) / 2 + 0.5;
  }

  return value;
}

function draw() {
  clear();
  blendMode(MULTIPLY);
  translate(width/2, height/2);
  background(100);

  for (let i = _aryPoints.length - 1; i >= 0; i--) {
    _aryPoints[i].update();
    _aryPoints[i].draw();
  }
}