'use strict';

let gl;
let program;
let canvas;

let modelViewMatrix;
let modelViewMatrixLoc;
let projectionMatrix;
let instanceMatrix;

let vertices = [
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0),
];
let vertexBuffer;
let vertexLoc;
let colors = [];
let colorBuffer;
let colorLoc;
let texturesArray = [];
let textureBuffer;
let textureLoc;

const TORSO_ID = 0;
const HEAD_ID = 1;
const LEFT_UPPER_ARM_ID = 2;
const LEFT_LOWER_ARM_ID = 3;
const LEFT_HAND_ID = 4;
const RIGHT_UPPER_ARM_ID = 5;
const RIGHT_LOWER_ARM_ID = 6;
const RIGHT_HAND_ID = 7;
const LEFT_UPPER_LEG_ID = 8;
const LEFT_LOWER_LEG_ID = 9;
const LEFT_FOOT_ID = 10;
const RIGHT_UPPER_LEG_ID = 11;
const RIGHT_LOWER_LEG_ID = 12;
const RIGHT_FOOT_ID = 13;
const X_COORDINATE = 14;
const Y_COORDINATE = 15;

let torsoHeight = 7.0;
let torsoWidth = 4.0;
let headHeight = 4.0;
let headWidth = 3.0;
let upperArmHeight = 2.5;
let upperArmWidth = 1.5;
let lowerArmHeight = 3.0;
let lowerArmWidth = 1.0;
let handHeight = 1.5;
let handWidth = 1.5;
let upperLegHeight = 4.0;
let upperLegWidth = 1.9;
let lowerLegHeight = 4.0;
let lowerLegWidth = 1.5;
let footHeight = 1.5;
let footWidth = 1.9;

let theta = [
  { x: 0, y: -20, z: 0 },
  { x: 0, y: -50, z: 0 },
  { x: 180, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 180, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 180, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 180, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  0,
  0,
];
let stack = [];
let figure = [];

let numNodes = 14;
for (var i = 0; i < numNodes; i++) {
  figure[i] = createNode(null, null, null, null);
}

let pointsArray = [];
let vertexColors = [
  vec4(0.6, 0.32, 0.17, 1), // Brown
  vec4(0.7, 0.3, 0.0, 1.0), // Brown dark
  vec4(0.5, 0.3, 0.1, 1.0), // Brown light
  vec4(0.5, 0.25, 0.14, 1.0), // Brown more lighten
];

let step = 1;
let stretching = Array.from(Array(8), () => new Array(8));

window.onload = function init() {
  canvas = document.getElementById('gl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  modelViewMatrix = mat4();
  projectionMatrix = ortho(-30.0, 30.0, -20.0, 20.0, -40.0, 40.0);
  instanceMatrix = mat4();
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix'), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, flatten(projectionMatrix));
  modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');

  cube();

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
  vertexLoc = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vertexLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLoc);

  colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  colorLoc = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texturesArray), gl.STATIC_DRAW);
  textureLoc = gl.getAttribLocation(program, 'vTexCoord');
  gl.vertexAttribPointer(textureLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureLoc);

  document.getElementById('body').addEventListener('keydown', (e) => {
    if (e.key === '1') {
      if (step == 1) {
        theta[LEFT_UPPER_ARM_ID].x -= 5;
        theta[RIGHT_UPPER_ARM_ID].x -= 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].x <= 85) {
          step = 2;
        }
      }
      if (step == 2) {
        theta[LEFT_UPPER_ARM_ID].x += 5;
        theta[RIGHT_UPPER_ARM_ID].x += 5;
        theta[LEFT_UPPER_ARM_ID].z += 5;
        theta[RIGHT_UPPER_ARM_ID].z -= 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].x >= 180) {
          step = 3;
        }
      }
      if (step == 3) {
        theta[LEFT_UPPER_ARM_ID].x -= 5;
        theta[RIGHT_UPPER_ARM_ID].x -= 5;
        theta[LEFT_UPPER_ARM_ID].z -= 5;
        theta[RIGHT_UPPER_ARM_ID].z += 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].x <= 85) {
          step = 4;
        }
      }
      if (step == 4) {
        theta[LEFT_UPPER_ARM_ID].x += 5;
        theta[RIGHT_UPPER_ARM_ID].x += 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].x >= 180) {
          step = 5;
        }
      }
      if (step == 5) {
        theta[TORSO_ID].x += 5;
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_LEG_ID].x -= 5;
        theta[RIGHT_UPPER_LEG_ID].x -= 5;
        initNodes(LEFT_UPPER_LEG_ID);
        initNodes(RIGHT_UPPER_LEG_ID);
        theta[LEFT_UPPER_ARM_ID].x -= 5;
        theta[RIGHT_UPPER_ARM_ID].x -= 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[TORSO_ID].x == 90) {
          step = 6;
        }
      }
      if (step == 6) {
        console.log(theta[LEFT_UPPER_ARM_ID].z);
        theta[LEFT_UPPER_ARM_ID].z -= 1;
        theta[RIGHT_UPPER_ARM_ID].z += 1;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].z <= -18) {
          step = 7;
        }
      }
      if (step == 7) {
        theta[TORSO_ID].x -= 5;
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].x += 5;
        theta[RIGHT_UPPER_ARM_ID].x += 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_LOWER_LEG_ID].x += 10;
        theta[RIGHT_LOWER_LEG_ID].x += 10;
        initNodes(LEFT_LOWER_LEG_ID);
        initNodes(RIGHT_LOWER_LEG_ID);
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[TORSO_ID].x <= 0) {
          step = 8;
        }
      }
      if (step == 8) {
        theta[LEFT_UPPER_ARM_ID].z += 1;
        theta[RIGHT_UPPER_ARM_ID].z -= 1;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_UPPER_LEG_ID].x += 5;
        theta[RIGHT_UPPER_LEG_ID].x += 5;
        initNodes(LEFT_UPPER_LEG_ID);
        initNodes(RIGHT_UPPER_LEG_ID);
        theta[LEFT_LOWER_LEG_ID].x -= 10;
        theta[RIGHT_LOWER_LEG_ID].x -= 10;
        initNodes(LEFT_LOWER_LEG_ID);
        initNodes(RIGHT_LOWER_LEG_ID);
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[LEFT_UPPER_LEG_ID].x == 180) {
          step = 1;
        }
      }
    }
    if (e.key === '3') {
      if (step == 1) {
        console.log(theta[HEAD_ID].z);
        theta[HEAD_ID].z -= 2.5;
        initNodes(HEAD_ID);
        theta[LEFT_UPPER_ARM_ID].z += 1;
        theta[RIGHT_UPPER_ARM_ID].z -= 1;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_LOWER_ARM_ID].z -= 2;
        theta[RIGHT_LOWER_ARM_ID].z += 2;
        initNodes(LEFT_LOWER_ARM_ID);
        initNodes(RIGHT_LOWER_ARM_ID);
        if (theta[HEAD_ID].z <= -45) {
          step = 2;
        }
      }
      if (step == 2) {
        console.log(theta[HEAD_ID].z);
        theta[HEAD_ID].z -= 2.5;
        initNodes(HEAD_ID);
        if (theta[HEAD_ID].z <= -90) {
          step = 3;
        }
      }
      if (step == 3) {
        theta[HEAD_ID].z += 5;
        initNodes(HEAD_ID);
        if (theta[HEAD_ID].z >= -20) {
          step = 4;
        }
      }
      if (step == 4) {
        theta[HEAD_ID].z += 5;
        initNodes(HEAD_ID);
        if (theta[HEAD_ID].z >= 50) {
          step = 5;
        }
      }
      if (step == 5) {
        console.log('theta[HEAD_ID].y:', theta[HEAD_ID].y);
        theta[HEAD_ID].y -= 5;
        initNodes(HEAD_ID);
        if (theta[HEAD_ID].y <= -140) {
          step = 6;
        }
      }
      if (step == 6) {
        console.log('theta[HEAD_ID].y:', theta[HEAD_ID].y);
        theta[HEAD_ID].y -= 5;
        initNodes(HEAD_ID);
        if (theta[HEAD_ID].y <= -230) {
          step = 7;
        }
      }
      if (step == 7) {
        console.log('theta[HEAD_ID].y:', theta[HEAD_ID].y);
        theta[HEAD_ID].y -= 5;
        initNodes(HEAD_ID);
        if (theta[HEAD_ID].y <= -320) {
          step = 8;
        }
      }
      if (step == 8) {
        console.log('theta[HEAD_ID].y:', theta[HEAD_ID].y);
        theta[HEAD_ID].y -= 5;
        theta[HEAD_ID].z -= 2.7;
        initNodes(HEAD_ID);
        theta[LEFT_UPPER_ARM_ID].z -= 1;
        theta[RIGHT_UPPER_ARM_ID].z += 1;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_LOWER_ARM_ID].z += 2;
        theta[RIGHT_LOWER_ARM_ID].z -= 2;
        initNodes(LEFT_LOWER_ARM_ID);
        initNodes(RIGHT_LOWER_ARM_ID);
        if (theta[HEAD_ID].y <= -410) {
          step = 1;
          theta[HEAD_ID].y = -50;
          theta[HEAD_ID].z = 0;
        }
      }
    }
    if (e.key === '8') {
      if (step == 1) {
        theta[LEFT_UPPER_ARM_ID].z += 5;
        theta[RIGHT_UPPER_ARM_ID].z -= 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].z >= 95) {
          step = 2;
        }
      }
      if (step == 2) {
        theta[LEFT_UPPER_ARM_ID].z -= 5;
        theta[RIGHT_UPPER_ARM_ID].z += 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_LOWER_ARM_ID].z += 9.5;
        theta[RIGHT_LOWER_ARM_ID].z -= 9.5;
        initNodes(LEFT_LOWER_ARM_ID);
        initNodes(RIGHT_LOWER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].z <= 0) {
          step = 3;
        }
      }
      if (step == 3) {
        theta[LEFT_UPPER_ARM_ID].z += 10;
        theta[RIGHT_UPPER_ARM_ID].z -= 10;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_LOWER_ARM_ID].z -= 10;
        theta[RIGHT_LOWER_ARM_ID].z += 10;
        initNodes(LEFT_LOWER_ARM_ID);
        initNodes(RIGHT_LOWER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].z >= 180) {
          step = 4;
        }
      }
      if (step == 4) {
        theta[LEFT_UPPER_ARM_ID].z -= 10;
        theta[RIGHT_UPPER_ARM_ID].z += 10;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].z <= 0) {
          step = 5;
        }
      }
      if (step == 5) {
        theta[LEFT_UPPER_ARM_ID].z += 5;
        theta[RIGHT_UPPER_ARM_ID].z -= 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[RIGHT_UPPER_LEG_ID].z -= 5;
        initNodes(RIGHT_UPPER_LEG_ID);
        if (theta[LEFT_UPPER_ARM_ID].z >= 90) {
          step = 6;
        }
      }
      if (step == 6) {
        theta[LEFT_UPPER_ARM_ID].z -= 5;
        theta[RIGHT_UPPER_ARM_ID].z += 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[RIGHT_UPPER_LEG_ID].z += 5;
        initNodes(RIGHT_UPPER_LEG_ID);
        if (theta[LEFT_UPPER_ARM_ID].z <= 0) {
          step = 7;
        }
      }
      if (step == 7) {
        theta[LEFT_UPPER_ARM_ID].z += 5;
        theta[RIGHT_UPPER_ARM_ID].z -= 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_UPPER_LEG_ID].z += 5;
        initNodes(LEFT_UPPER_LEG_ID);
        if (theta[LEFT_UPPER_ARM_ID].z >= 90) {
          step = 8;
        }
      }
      if (step == 8) {
        theta[LEFT_UPPER_ARM_ID].z -= 5;
        theta[RIGHT_UPPER_ARM_ID].z += 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_UPPER_LEG_ID].z -= 5;
        initNodes(LEFT_UPPER_LEG_ID);
        if (theta[LEFT_UPPER_ARM_ID].z <= 0) {
          step = 1;
        }
      }
    }
    if (e.key === '0') {
      if (step == 1) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 1.5;
        }
      }
      if (step == 1.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 2;
        }
      }
      if (step == 2) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 2.5;
        }
      }
      if (step == 2.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 3;
        }
      }
      if (step == 3) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 3.5;
        }
      }
      if (step == 3.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 4;
        }
      }
      if (step == 4) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 4.5;
        }
      }
      if (step == 4.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 5;
        }
      }
      if (step == 5) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z += 9;
        theta[RIGHT_UPPER_ARM_ID].z -= 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 5.5;
        }
      }
      if (step == 5.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z += 9;
        theta[RIGHT_UPPER_ARM_ID].z -= 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 6;
        }
      }
      if (step == 6) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z -= 9;
        theta[RIGHT_UPPER_ARM_ID].z += 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 6.5;
        }
      }
      if (step == 6.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z -= 9;
        theta[RIGHT_UPPER_ARM_ID].z += 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 7;
        }
      }
      if (step == 7) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z += 9;
        theta[RIGHT_UPPER_ARM_ID].z -= 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 7.5;
        }
      }
      if (step == 7.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z += 9;
        theta[RIGHT_UPPER_ARM_ID].z -= 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 8;
        }
      }
      if (step == 8) {
        theta[Y_COORDINATE] += 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z -= 9;
        theta[RIGHT_UPPER_ARM_ID].z += 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] >= 100) {
          step = 8.5;
        }
      }
      if (step == 8.5) {
        theta[Y_COORDINATE] -= 10;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        theta[LEFT_UPPER_ARM_ID].z -= 9;
        theta[RIGHT_UPPER_ARM_ID].z += 9;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[Y_COORDINATE] <= 0) {
          step = 1;
        }
      }
    }
    if (e.key === '-') {
      if (step == 1) {
        theta[LEFT_UPPER_ARM_ID].z += 5;
        theta[RIGHT_UPPER_ARM_ID].z -= 5;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[RIGHT_UPPER_LEG_ID].x -= 5;
        theta[RIGHT_LOWER_LEG_ID].x += 5;
        initNodes(RIGHT_UPPER_LEG_ID);
        initNodes(RIGHT_LOWER_LEG_ID);
        if (theta[RIGHT_UPPER_LEG_ID].x <= 85) {
          step = 2;
        }
      }
      if (step == 2) {
        theta[LEFT_UPPER_ARM_ID].z -= 7;
        theta[RIGHT_UPPER_ARM_ID].z += 7;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[RIGHT_UPPER_LEG_ID].x += 5;
        theta[RIGHT_LOWER_LEG_ID].x -= 5;
        initNodes(RIGHT_UPPER_LEG_ID);
        initNodes(RIGHT_LOWER_LEG_ID);
        if (theta[RIGHT_UPPER_LEG_ID].x >= 180) {
          step = 3;
        }
      }
      if (step == 3) {
        theta[LEFT_UPPER_ARM_ID].z += 7;
        theta[RIGHT_UPPER_ARM_ID].z -= 7;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_UPPER_LEG_ID].x -= 5;
        theta[LEFT_LOWER_LEG_ID].x += 5;
        initNodes(LEFT_UPPER_LEG_ID);
        initNodes(LEFT_LOWER_LEG_ID);
        if (theta[LEFT_UPPER_LEG_ID].x <= 85) {
          step = 4;
        }
      }
      if (step == 4) {
        theta[LEFT_UPPER_ARM_ID].z -= 7;
        theta[RIGHT_UPPER_ARM_ID].z += 7;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_UPPER_LEG_ID].x += 5;
        theta[LEFT_LOWER_LEG_ID].x -= 5;
        initNodes(LEFT_UPPER_LEG_ID);
        initNodes(LEFT_LOWER_LEG_ID);
        if (theta[LEFT_UPPER_LEG_ID].x >= 180) {
          step = 5;
        }
      }
      if (step == 5) {
        console.log(theta[LEFT_UPPER_ARM_ID].z);
        theta[LEFT_UPPER_ARM_ID].z += 7;
        theta[RIGHT_UPPER_ARM_ID].z -= 7;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].z >= 90) {
          step = 6;
        }
      }
      if (step == 6) {
        console.log(theta[LEFT_UPPER_ARM_ID].z);
        theta[LEFT_UPPER_ARM_ID].z -= 7;
        theta[RIGHT_UPPER_ARM_ID].z += 7;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_UPPER_LEG_ID].z += 1;
        theta[RIGHT_UPPER_LEG_ID].z -= 1;
        initNodes(LEFT_UPPER_LEG_ID);
        initNodes(RIGHT_UPPER_LEG_ID);
        theta[LEFT_LOWER_LEG_ID].z -= 2;
        theta[RIGHT_LOWER_LEG_ID].z += 2;
        initNodes(LEFT_LOWER_LEG_ID);
        initNodes(RIGHT_LOWER_LEG_ID);
        theta[Y_COORDINATE] -= 1;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[LEFT_UPPER_ARM_ID].z <= -36) {
          step = 7;
        }
      }
      if (step == 7) {
        console.log(theta[LEFT_UPPER_ARM_ID].z);
        theta[LEFT_UPPER_ARM_ID].z += 7;
        theta[RIGHT_UPPER_ARM_ID].z -= 7;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        theta[LEFT_UPPER_LEG_ID].z -= 1;
        theta[RIGHT_UPPER_LEG_ID].z += 1;
        initNodes(LEFT_UPPER_LEG_ID);
        initNodes(RIGHT_UPPER_LEG_ID);
        theta[LEFT_LOWER_LEG_ID].z += 2;
        theta[RIGHT_LOWER_LEG_ID].z -= 2;
        initNodes(LEFT_LOWER_LEG_ID);
        initNodes(RIGHT_LOWER_LEG_ID);
        theta[Y_COORDINATE] += 1;
        gl.viewport(theta[X_COORDINATE], theta[Y_COORDINATE], canvas.width, canvas.height);
        initNodes(TORSO_ID);
        if (theta[LEFT_UPPER_ARM_ID].z >= 90) {
          step = 8;
        }
      }
      if (step == 8) {
        console.log(theta[LEFT_UPPER_ARM_ID].z);
        theta[LEFT_UPPER_ARM_ID].z -= 7;
        theta[RIGHT_UPPER_ARM_ID].z += 7;
        initNodes(LEFT_UPPER_ARM_ID);
        initNodes(RIGHT_UPPER_ARM_ID);
        if (theta[LEFT_UPPER_ARM_ID].z <= 0) {
          step = 1;
        }
      }
    }
  });

  document.getElementById('Button0').addEventListener('click', () => {});
  document.getElementById('Button1').addEventListener('click', () => {});
  document.getElementById('Button2').addEventListener('click', () => {});
  document.getElementById('Button3').addEventListener('click', () => {});
  document.getElementById('Button4').addEventListener('click', () => {});
  document.getElementById('Button5').addEventListener('click', () => {});
  document.getElementById('Button6').addEventListener('click', () => {});
  document.getElementById('Button7').addEventListener('click', () => {});
  document.getElementById('Button8').addEventListener('click', () => {});
  document.getElementById('Button9').addEventListener('click', () => {});
  document.getElementById('Button10').addEventListener('click', () => {});
  document.getElementById('Button11').addEventListener('click', () => {});

  initAll();

  requestAnimFrame(render);
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  traverse(TORSO_ID);
  requestAnimFrame(render);
}

function traverse(Id) {
  if (Id == null) {
    return;
  }

  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);

  figure[Id].render();
  if (figure[Id].child != null) {
    traverse(figure[Id].child);
  }

  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) {
    traverse(figure[Id].sibling);
  }
}

function createNode(transform, render, sibling, child) {
  let node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  };
  return node;
}

function initAll() {
  initNodes(TORSO_ID);
  initNodes(HEAD_ID);
  initNodes(LEFT_UPPER_ARM_ID);
  initNodes(LEFT_LOWER_ARM_ID);
  initNodes(LEFT_HAND_ID);
  initNodes(RIGHT_UPPER_ARM_ID);
  initNodes(RIGHT_LOWER_ARM_ID);
  initNodes(RIGHT_HAND_ID);
  initNodes(LEFT_UPPER_LEG_ID);
  initNodes(LEFT_LOWER_LEG_ID);
  initNodes(LEFT_FOOT_ID);
  initNodes(RIGHT_UPPER_LEG_ID);
  initNodes(RIGHT_LOWER_LEG_ID);
  initNodes(RIGHT_FOOT_ID);
}

function initNodes(id) {
  let m = mat4();

  switch (id) {
    case TORSO_ID:
      m = mult(m, rotate(theta[TORSO_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[TORSO_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[TORSO_ID].z, vec3(0, 0, 1)));
      figure[TORSO_ID] = createNode(m, torso, null, HEAD_ID);
      break;

    case HEAD_ID:
      m = mult(m, translate(0.0, torsoHeight - 0.5, 0.0));
      m = mult(m, rotate(theta[HEAD_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[HEAD_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[HEAD_ID].z, vec3(0, 0, 1)));
      figure[HEAD_ID] = createNode(m, head, LEFT_UPPER_ARM_ID, null);
      break;

    case LEFT_UPPER_ARM_ID:
      m = mult(m, translate(-(torsoWidth / 3.2 + upperArmWidth), torsoHeight, 0.0));
      m = mult(m, rotate(theta[LEFT_UPPER_ARM_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[LEFT_UPPER_ARM_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[LEFT_UPPER_ARM_ID].z, vec3(0, 0, 1)));
      figure[LEFT_UPPER_ARM_ID] = createNode(m, upperArm, RIGHT_UPPER_ARM_ID, LEFT_LOWER_ARM_ID);
      break;

    case LEFT_LOWER_ARM_ID:
      m = mult(m, translate(0.0, upperArmHeight, 0.0));
      m = mult(m, rotate(theta[LEFT_LOWER_ARM_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[LEFT_LOWER_ARM_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[LEFT_LOWER_ARM_ID].z, vec3(0, 0, 1)));
      figure[LEFT_LOWER_ARM_ID] = createNode(m, lowerArm, null, LEFT_HAND_ID);
      break;

    case LEFT_HAND_ID:
      m = mult(m, translate(0.0, lowerArmHeight, 0.0));
      m = mult(m, rotate(theta[LEFT_HAND_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[LEFT_HAND_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[LEFT_HAND_ID].z, vec3(0, 0, 1)));
      figure[LEFT_HAND_ID] = createNode(m, hand, null, null);
      break;

    case RIGHT_UPPER_ARM_ID:
      m = mult(m, translate(torsoWidth / 3.2 + upperArmWidth, torsoHeight, 0.0));
      m = mult(m, rotate(theta[RIGHT_UPPER_ARM_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[RIGHT_UPPER_ARM_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[RIGHT_UPPER_ARM_ID].z, vec3(0, 0, 1)));
      figure[RIGHT_UPPER_ARM_ID] = createNode(m, upperArm, LEFT_UPPER_LEG_ID, RIGHT_LOWER_ARM_ID);
      break;

    case RIGHT_LOWER_ARM_ID:
      m = mult(m, translate(0.0, upperArmHeight, 0.0));
      m = mult(m, rotate(theta[RIGHT_LOWER_ARM_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[RIGHT_LOWER_ARM_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[RIGHT_LOWER_ARM_ID].z, vec3(0, 0, 1)));
      figure[RIGHT_LOWER_ARM_ID] = createNode(m, lowerArm, null, RIGHT_HAND_ID);
      break;

    case RIGHT_HAND_ID:
      m = mult(m, translate(0.0, lowerArmHeight, 0.0));
      m = mult(m, rotate(theta[RIGHT_HAND_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[RIGHT_HAND_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[RIGHT_HAND_ID].z, vec3(0, 0, 1)));
      figure[RIGHT_HAND_ID] = createNode(m, hand, null, null);
      break;

    case LEFT_UPPER_LEG_ID:
      m = mult(m, translate(-(torsoWidth / 3.8), 0.0, 0.0));
      m = mult(m, rotate(theta[LEFT_UPPER_LEG_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[LEFT_UPPER_LEG_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[LEFT_UPPER_LEG_ID].z, vec3(0, 0, 1)));
      figure[LEFT_UPPER_LEG_ID] = createNode(m, upperLeg, RIGHT_UPPER_LEG_ID, LEFT_LOWER_LEG_ID);
      break;

    case LEFT_LOWER_LEG_ID:
      m = mult(m, translate(0.0, upperLegHeight, 0.0));
      m = mult(m, rotate(theta[LEFT_LOWER_LEG_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[LEFT_LOWER_LEG_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[LEFT_LOWER_LEG_ID].z, vec3(0, 0, 1)));
      figure[LEFT_LOWER_LEG_ID] = createNode(m, lowerLeg, null, LEFT_FOOT_ID);
      break;

    case LEFT_FOOT_ID:
      m = mult(m, translate(0.0, lowerLegHeight, 0.0));
      m = mult(m, rotate(theta[LEFT_FOOT_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[LEFT_FOOT_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[LEFT_FOOT_ID].z, vec3(0, 0, 1)));
      figure[LEFT_FOOT_ID] = createNode(m, foot, null, null);
      break;

    case RIGHT_UPPER_LEG_ID:
      m = mult(m, translate(torsoWidth / 3.8, 0.0, 0.0));
      m = mult(m, rotate(theta[RIGHT_UPPER_LEG_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[RIGHT_UPPER_LEG_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[RIGHT_UPPER_LEG_ID].z, vec3(0, 0, 1)));
      figure[RIGHT_UPPER_LEG_ID] = createNode(m, upperLeg, null, RIGHT_LOWER_LEG_ID);
      break;

    case RIGHT_LOWER_LEG_ID:
      m = mult(m, translate(0.0, upperLegHeight, 0.0));
      m = mult(m, rotate(theta[RIGHT_LOWER_LEG_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[RIGHT_LOWER_LEG_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[RIGHT_LOWER_LEG_ID].z, vec3(0, 0, 1)));
      figure[RIGHT_LOWER_LEG_ID] = createNode(m, lowerLeg, null, RIGHT_FOOT_ID);
      break;

    case RIGHT_FOOT_ID:
      m = mult(m, translate(0.0, lowerLegHeight, 0.0));
      m = mult(m, rotate(theta[RIGHT_FOOT_ID].x, vec3(1, 0, 0)));
      m = mult(m, rotate(theta[RIGHT_FOOT_ID].y, vec3(0, 1, 0)));
      m = mult(m, rotate(theta[RIGHT_FOOT_ID].z, vec3(0, 0, 1)));
      figure[RIGHT_FOOT_ID] = createNode(m, foot, null, null);
      break;
  }
}

function torso() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(torsoWidth, torsoHeight, torsoWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(headWidth, headHeight, headWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperArm() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(upperArmWidth, upperArmHeight, upperArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerArm() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(lowerArmWidth, lowerArmHeight, lowerArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function hand() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * handHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(handWidth, handHeight, handWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(upperLegWidth, upperLegHeight, upperLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerLeg() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(lowerLegWidth, lowerLegHeight, lowerLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function foot() {
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * footHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scalem(footWidth, footHeight, footWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {
  pointsArray.push(vertices[a]);
  pointsArray.push(vertices[b]);
  pointsArray.push(vertices[c]);
  pointsArray.push(vertices[d]);
}

function cube() {
  quad(0, 1, 2, 3);
  colors.push(vertexColors[0]);
  colors.push(vertexColors[1]);
  colors.push(vertexColors[2]);
  colors.push(vertexColors[3]);
  quad(1, 2, 6, 5);
  colors.push(vertexColors[0]);
  colors.push(vertexColors[1]);
  colors.push(vertexColors[2]);
  colors.push(vertexColors[3]);
  quad(0, 3, 7, 4);
  colors.push(vertexColors[0]);
  colors.push(vertexColors[1]);
  colors.push(vertexColors[2]);
  colors.push(vertexColors[3]);
  quad(0, 1, 5, 4);
  colors.push(vertexColors[0]);
  colors.push(vertexColors[1]);
  colors.push(vertexColors[2]);
  colors.push(vertexColors[3]);
  quad(2, 3, 7, 6);
  colors.push(vertexColors[0]);
  colors.push(vertexColors[1]);
  colors.push(vertexColors[2]);
  colors.push(vertexColors[3]);
  quad(4, 5, 6, 7);
  colors.push(vertexColors[0]);
  colors.push(vertexColors[1]);
  colors.push(vertexColors[2]);
  colors.push(vertexColors[3]);
}

const sleep = (time) => {
  let start = Date.now();
  let now = start;
  while (now - start < time) {
    now = Date.now();
  }
};
