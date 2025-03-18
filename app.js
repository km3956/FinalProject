var canvas;
var gl;
var angle = 0.0;


class Light{
    constructor(loc,dir,amb,sp,dif,alpha,cutoff,type){
    	this.location = loc;
    	this.direction = dir;
    	this.ambient = amb;
    	this.specular = sp;
    	this.diffuse = dif;
    	this.alpha = alpha;
    	this.cutoff = cutoff;
    	this.type = type;
    	this.status = 1;
    }
    turnOff(){this.status = 0;}
       
    turnOn(){this.status = 1;}
}

class Camera{
    constructor(vrp,u,v,n){
    	this.vrp = vrp;
    	this.u = normalize(u);
    	this.v = normalize(v);
    	this.n = normalize(n);
    	this.projectionMatrix = perspective(90.0,1.0,0.1,200);

    	this.updateCameraMatrix();
    }
    
    updateCameraMatrix(){
    	let t = translate(-this.vrp[0],-this.vrp[1],-this.vrp[2]);
    	let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
    	this.cameraMatrix = mult(r,t);
    }
    
    getModelMatrix(){
    	return this.modelMatrix;
    }
    
    setModelMatrix(mm){
    	this.modelMatrix = mm;
    }    
}
function isValidVec3(v) {
    return !(isNaN(v[0]) || isNaN(v[1]) || isNaN(v[2]));
}

var camera1 = new Camera(
    vec3(0, 1.7, 5),        
    vec3(-1, 0, 0),          
    vec3(0, 1, 0),           
    vec3(0, 0, 1)            
);


var camera2 = new Camera(
    vec3(0, 10, 0),  // Position high above the scene
    vec3(1, 0, 0),   // Right direction
    vec3(0, 0, -1),  // Up direction
    vec3(0, -1, 0)   // Looking downward
);


var light1 = new Light(vec3(0,0,0),vec3(0,1,-1),vec4(0.4,0.4,0.4,1.0), vec4(1,1,1,1), vec4(1,1,1,1),0,0,1);

var plane;
var cube;
var skybox;
var house;
var activeCamera = 1;
var lastFrameTime = 0;
var modelPath = "models/bound-cow.smf";
var cowModel;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) { 
        alert("WebGL 2.0 isn't available"); 
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    skybox = new Skybox();
    
    plane = new Plane(0, 0, 0, 10, 0, 0, 0);
    house = new House(2, 0, 2, 1, 0, 0, 0);
    

    cowModel = new SMFModel(
        gl,
        "models/bound-cow.smf", 
        -2, 50, 2,                
        0.5,                     
        0, 0, 0                  
    );
    
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let currentCamera = (activeCamera === 1) ? camera1 : camera2;

    currentTime = Date.now() * 0.001;
    deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    house.modelRotationY += 30 * deltaTime;
    house.updateModelMatrix();

    cowModel.draw(currentCamera);
    skybox.draw(currentCamera);
    plane.draw(currentCamera);
    house.draw(currentCamera);

    requestAnimationFrame(render);
}


window.addEventListener("keydown", function(event) {
    let moveSpeed = 0.5;
    let rotateSpeed = 5;

    switch (event.key) {
        case "ArrowUp": 
            camera1.vrp = add(camera1.vrp, scale(moveSpeed, camera1.n));
            break;
        case "ArrowDown":
            camera1.vrp = subtract(camera1.vrp, scale(moveSpeed, camera1.n));
            break;
        case "ArrowLeft":
            camera1.vrp = subtract(camera1.vrp, scale(moveSpeed, camera1.u));
            break;
        case "ArrowRight":
            camera1.vrp = add(camera1.vrp, scale(moveSpeed, camera1.u));
            break;
        case "Z": 
            let rollCCW = rotate(rotateSpeed, camera1.n);
            let tempU = normalize(mult(rollCCW, vec4(camera1.u[0], camera1.u[1], camera1.u[2], 0.0)));
            let tempV = normalize(mult(rollCCW, vec4(camera1.v[0], camera1.v[1], camera1.v[2], 0.0)));

            camera1.u = vec3(tempU[0], tempU[1], tempU[2]);
            camera1.v = vec3(tempV[0], tempV[1], tempV[2]);
            break;
        case "z": 
            let rollCW = rotate(-rotateSpeed, camera1.n);
            let tempU2 = normalize(mult(rollCW, vec4(camera1.u[0], camera1.u[1], camera1.u[2], 0.0)));
            let tempV2 = normalize(mult(rollCW, vec4(camera1.v[0], camera1.v[1], camera1.v[2], 0.0)));

            camera1.u = vec3(tempU2[0], tempU2[1], tempU2[2]);
            camera1.v = vec3(tempV2[0], tempV2[1], tempV2[2]);
            break;
        case "X":
            let pitchUp = rotate(rotateSpeed, camera1.u);
            let tempV3 = normalize(mult(pitchUp, vec4(camera1.v[0], camera1.v[1], camera1.v[2], 0.0)));
            let tempN = normalize(mult(pitchUp, vec4(camera1.n[0], camera1.n[1], camera1.n[2], 0.0)));

            camera1.v = vec3(tempV3[0], tempV3[1], tempV3[2]);
            camera1.n = vec3(tempN[0], tempN[1], tempN[2]);
            break;
        case "x": 
            let pitchDown = rotate(-rotateSpeed, camera1.u);
            let tempV4 = normalize(mult(pitchDown, vec4(camera1.v[0], camera1.v[1], camera1.v[2], 0.0)));
            let tempN2 = normalize(mult(pitchDown, vec4(camera1.n[0], camera1.n[1], camera1.n[2], 0.0)));

            camera1.v = vec3(tempV4[0], tempV4[1], tempV4[2]);
            camera1.n = vec3(tempN2[0], tempN2[1], tempN2[2]);
            break;
        case "C": 
            let yawCCW = rotate(rotateSpeed, camera1.v);
            let tempU5 = normalize(mult(yawCCW, vec4(camera1.u[0], camera1.u[1], camera1.u[2], 0.0)));
            let tempN3 = normalize(mult(yawCCW, vec4(camera1.n[0], camera1.n[1], camera1.n[2], 0.0)));

            camera1.u = vec3(tempU5[0], tempU5[1], tempU5[2]);
            camera1.n = vec3(tempN3[0], tempN3[1], tempN3[2]);
            break;
        case "c": 
            let yawCW = rotate(-rotateSpeed, camera1.v);
            let tempU6 = normalize(mult(yawCW, vec4(camera1.u[0], camera1.u[1], camera1.u[2], 0.0)));
            let tempN4 = normalize(mult(yawCW, vec4(camera1.n[0], camera1.n[1], camera1.n[2], 0.0)));

            camera1.u = vec3(tempU6[0], tempU6[1], tempU6[2]);
            camera1.n = vec3(tempN4[0], tempN4[1], tempN4[2]);
            break;
        case "t":
            activeCamera = (activeCamera === 1) ? 2 : 1;
            console.log("Switched to Camera", activeCamera);
            break;
    }

    camera1.updateCameraMatrix();
});

