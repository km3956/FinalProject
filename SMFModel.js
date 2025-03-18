class SMFModel extends Drawable {
    static shaderProgram = -1;
    static positionBuffer = -1;
    static colorBuffer = -1;
    static indexBuffer = -1;
    
    constructor(gl, fname, tx, ty, tz, scale, rotX = 0, rotY = 0, rotZ = 0) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ);
        this.gl = gl;
        this.vertices = [];
        this.colors = [];
        this.indices = [];
        
        let f = loadFileAJAX(fname);
        let lines = f.split("\n");

        for (let line of lines) {
            let strings = line.trim().split(" ");
            switch (strings[0]) {
                case "v":
                    this.vertices.push(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3]));
                    this.colors.push(1.0, 1.0, 1.0, 1.0); 
                    break;
                case "f":
                    this.indices.push(parseInt(strings[1]) - 1);
                    this.indices.push(parseInt(strings[2]) - 1);
                    this.indices.push(parseInt(strings[3]) - 1);
                    break;
            }
        }

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;
        SMFModel.shaderProgram = initShaders(gl, "/vshader_smf.glsl", "/fshader_smf.glsl");

        SMFModel.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, SMFModel.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        SMFModel.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, SMFModel.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW);
    }

    draw(camera) {
        const gl = this.gl;
        gl.useProgram(SMFModel.shaderProgram);
    
        let modelViewLoc = gl.getUniformLocation(SMFModel.shaderProgram, "modelViewMatrix");
        let projectionLoc = gl.getUniformLocation(SMFModel.shaderProgram, "projectionMatrix");
    
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(projectionLoc, false, flatten(camera.projectionMatrix));
    
        gl.bindBuffer(gl.ARRAY_BUFFER, SMFModel.positionBuffer);
        let positionLoc = gl.getAttribLocation(SMFModel.shaderProgram, "aPosition");
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, SMFModel.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
    
        gl.disableVertexAttribArray(positionLoc);
    }
    
}
