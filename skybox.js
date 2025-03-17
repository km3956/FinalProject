class Skybox {
    static vertexPositions = [
        vec3(-1.0,  1.0, -1.0),
        vec3(-1.0, -1.0, -1.0),
        vec3( 1.0, -1.0, -1.0),
        vec3( 1.0,  1.0, -1.0),
        vec3(-1.0,  1.0,  1.0),
        vec3(-1.0, -1.0,  1.0),
        vec3( 1.0, -1.0,  1.0),
        vec3( 1.0,  1.0,  1.0)
    ];

    static indices = [
        0, 1, 3, 3, 1, 2, // front
        4, 5, 0, 0, 5, 1, // left
        3, 2, 7, 7, 2, 6, // right
        4, 0, 7, 7, 0, 3, // top
        1, 5, 2, 2, 5, 6, // bottom
        7, 6, 4, 4, 6, 5  // back
    ];

    static positionBuffer = -1;
    static indexBuffer = -1;
    static shaderProgram = -1;
    static aPositionShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    static uSkyboxShader = -1;
    static texture = -1;

    static initialize() {
        // Create and compile shaders
        Skybox.shaderProgram = initShaders(gl, "/skybox_vshader.glsl", "/skybox_fshader.glsl");
        
        // Create buffers
        Skybox.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Skybox.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Skybox.vertexPositions), gl.STATIC_DRAW);
        
        Skybox.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Skybox.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Skybox.indices), gl.STATIC_DRAW);
        
        // Get attribute and uniform locations
        Skybox.aPositionShader = gl.getAttribLocation(Skybox.shaderProgram, "aPosition");
        Skybox.uCameraMatrixShader = gl.getUniformLocation(Skybox.shaderProgram, "cameraMatrix");
        Skybox.uProjectionMatrixShader = gl.getUniformLocation(Skybox.shaderProgram, "projectionMatrix");
        Skybox.uSkyboxShader = gl.getUniformLocation(Skybox.shaderProgram, "uSkybox");
    }

    static initializeTexture() {
        // Create a cube texture
        Skybox.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Skybox.texture);
        
        const faceInfos = [
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'textures/skybox/right.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'textures/skybox/left.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'textures/skybox/top.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'textures/skybox/bottom.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'textures/skybox/front.jpg' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'textures/skybox/back.jpg' },
        ];
        
        // Create a placeholder pixel
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);  // Blue placeholder
        
        // For each face, create a placeholder then load the actual texture
        faceInfos.forEach((faceInfo) => {
            gl.texImage2D(faceInfo.target, level, internalFormat, width, height, 0, format, type, pixel);
            
            // Load the actual face image
            const image = new Image();
            image.onload = function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, Skybox.texture);
                gl.texImage2D(faceInfo.target, level, internalFormat, format, type, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            };
            image.src = faceInfo.url;
        });
        
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    }

    constructor() {
        if (Skybox.shaderProgram == -1) {
            Skybox.initialize();
            Skybox.initializeTexture();
        }
    }

    draw(camera) {
        if (Skybox.texture == -1) return;
        
        // Save current depth function and depth mask
        const oldDepthFunc = gl.getParameter(gl.DEPTH_FUNC);
        const oldDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK);
        
        // Draw skybox first, change depth function
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(false);
        
        gl.useProgram(Skybox.shaderProgram);
        
        // Get just the rotation part of the camera matrix
        const viewMatrix = mat4(
            camera.u[0], camera.u[1], camera.u[2], 0,
            camera.v[0], camera.v[1], camera.v[2], 0,
            camera.n[0], camera.n[1], camera.n[2], 0,
            0, 0, 0, 1
        );
        
        gl.bindBuffer(gl.ARRAY_BUFFER, Skybox.positionBuffer);
        gl.vertexAttribPointer(Skybox.aPositionShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Skybox.aPositionShader);
        
        gl.uniformMatrix4fv(Skybox.uCameraMatrixShader, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(Skybox.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));
        
        // Bind the skybox texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Skybox.texture);
        gl.uniform1i(Skybox.uSkyboxShader, 0);
        
        // Draw the skybox
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Skybox.indexBuffer);
        gl.drawElements(gl.TRIANGLES, Skybox.indices.length, gl.UNSIGNED_SHORT, 0);
        
        // Restore original depth function and depth mask
        gl.depthFunc(oldDepthFunc);
        gl.depthMask(oldDepthMask);
    }
}