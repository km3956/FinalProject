class Cube extends Drawable {
    static positionBuffer = -1;
    static indexBuffer = -1;
    static textureCoordBuffer = -1;
    
    static shaderProgram = -1;
    static aPositionShader = -1;
    static aTextureCoordShader = -1;
    
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static texture = -1;
    static uTextureUnitShader = -1;

    static initialize() {
        Cube.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");

        Cube.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cube.vertexPositions), gl.STATIC_DRAW);

        Cube.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cube.textureCoords), gl.STATIC_DRAW);

        Cube.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Cube.indices), gl.STATIC_DRAW);

        Cube.aPositionShader = gl.getAttribLocation(Cube.shaderProgram, "aPosition");
        Cube.aTextureCoordShader = gl.getAttribLocation(Cube.shaderProgram, "aTextureCoord");

        Cube.uModelMatrixShader = gl.getUniformLocation(Cube.shaderProgram, "modelMatrix");
        Cube.uCameraMatrixShader = gl.getUniformLocation(Cube.shaderProgram, "cameraMatrix");
        Cube.uProjectionMatrixShader = gl.getUniformLocation(Cube.shaderProgram, "projectionMatrix");
        Cube.uTextureUnitShader = gl.getUniformLocation(Cube.shaderProgram, "uTextureUnit");
    }

    static initializeTexture() {
        Cube.texture = loadTexture("crate_texture.jpg");
    }

    constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
        if (Cube.shaderProgram == -1) {
            Cube.initialize();
            Cube.initializeTexture();
        }
    }

    draw() {
        if (Cube.texture == -1) return;

        gl.useProgram(Cube.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.positionBuffer);
        gl.vertexAttribPointer(Cube.aPositionShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Cube.aPositionShader);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.textureCoordBuffer);
        gl.vertexAttribPointer(Cube.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Cube.aTextureCoordShader);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Cube.texture);
        gl.uniform1i(Cube.uTextureUnitShader, 0);

        gl.uniformMatrix4fv(Cube.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Cube.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Cube.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
        gl.drawElements(gl.TRIANGLES, Cube.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    static vertexPositions = [
        vec3(-1, -1, -1), vec3(1, -1, -1), vec3(1, 1, -1), vec3(-1, 1, -1), 
        vec3(-1, -1, 1), vec3(1, -1, 1), vec3(1, 1, 1), vec3(-1, 1, 1)  
    ];

    static indices = [
        0, 1, 2, 0, 2, 3, 
        4, 5, 6, 4, 6, 7,
        0, 4, 7, 0, 7, 3,
        1, 5, 6, 1, 6, 2,
        3, 2, 6, 3, 6, 7,
        0, 1, 5, 0, 5, 4 
    ];

    static textureCoords = [
        vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 1),
        vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 1)
    ];


    static initializeTexture() {
        var image = new Image();
        image.onload = function () {
            Cube.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Cube.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        };

        image.src = "textures/crate_texture.jpg";
    }
}