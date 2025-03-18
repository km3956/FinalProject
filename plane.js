class Plane extends Drawable {
    static vertexPositions = [];
    static vertexTextureCoords = [];
    static indices = [];
    
    static positionBuffer = -1;
    static textureCoordBuffer = -1;
    static indexBuffer = -1;
    
    static shaderProgram = -1;
    static aPositionShader = -1;
    static aTextureCoordShader = -1;
    
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static texture = -1;
    static uTextureUnitShader = -1;

    static initialize(subdivisionLevel = 4) {
        Plane.generateGrid(subdivisionLevel);
        Plane.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

        Plane.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Plane.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Plane.vertexPositions), gl.STATIC_DRAW);

        Plane.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Plane.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Plane.vertexTextureCoords), gl.STATIC_DRAW);
        Plane.uTextureUnitShader = gl.getUniformLocation(Plane.shaderProgram, "uTextureUnit");

        Plane.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Plane.indices), gl.STATIC_DRAW);

        Plane.aPositionShader = gl.getAttribLocation(Plane.shaderProgram, "aPosition");
        Plane.aTextureCoordShader = gl.getAttribLocation(Plane.shaderProgram, "aTextureCoord");

        Plane.uModelMatrixShader = gl.getUniformLocation(Plane.shaderProgram, "modelMatrix");
        Plane.uCameraMatrixShader = gl.getUniformLocation(Plane.shaderProgram, "cameraMatrix");
        Plane.uProjectionMatrixShader = gl.getUniformLocation(Plane.shaderProgram, "projectionMatrix");
    }

    static generateGrid(subdivisionLevel) {
        Plane.vertexPositions = [];
        Plane.vertexTextureCoords = [];
        Plane.indices = [];

        let gridSize = Math.pow(2, subdivisionLevel); 
        let step = 2.0 / gridSize; 

        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                let x = -1.0 + j * step;
                let z = -1.0 + i * step;
                Plane.vertexPositions.push(vec3(x, 0, z));
                Plane.vertexTextureCoords.push(vec2(j / gridSize, i / gridSize));
            }
        }

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                let topLeft = i * (gridSize + 1) + j;
                let topRight = topLeft + 1;
                let bottomLeft = topLeft + (gridSize + 1);
                let bottomRight = bottomLeft + 1;

                Plane.indices.push(topLeft, bottomLeft, topRight);
                Plane.indices.push(topRight, bottomLeft, bottomRight);
            }
        }
    }

    static initializeTexture() {
        var image = new Image();
        image.onload = function () {
            Plane.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Plane.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        };

        image.src = "256x grass block.png";
    }

    constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
        if (Plane.shaderProgram == -1) {
            Plane.initialize(4);
            Plane.initializeTexture();
        }
    }

    draw(camera) {
        if (Plane.texture == -1) return;
    
        gl.useProgram(Plane.shaderProgram);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, Plane.positionBuffer);
        gl.vertexAttribPointer(Plane.aPositionShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Plane.aPositionShader);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, Plane.textureCoordBuffer);
        gl.vertexAttribPointer(Plane.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Plane.aTextureCoordShader);
    
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Plane.texture);
        gl.uniform1i(Plane.uTextureUnitShader, 0);
    
        // Set uniform matrices using the provided camera parameter
        gl.uniformMatrix4fv(Plane.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Plane.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(Plane.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);
        gl.drawElements(gl.TRIANGLES, Plane.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
