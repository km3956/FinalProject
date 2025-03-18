class House extends Drawable {
    static positionBuffer = -1;
    static normalBuffer = -1;
    static textureCoordBuffer = -1;
    static indexBuffer = -1;
    
    static shaderProgram = -1;
    static aPositionShader = -1;
    static aNormalShader = -1;
    static aTextureCoordShader = -1;
    
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static texture = -1;
    static roofTexture = -1;
    static uTextureUnitShader = -1;
    static uRoofTextureUnitShader = -1;
    static uIsRoofShader = -1;

    static initialize() {
        // Generate house geometry
        House.generateGeometry();
        
        // Initialize shaders
        House.shaderProgram = initShaders(gl, "/house_vshader.glsl", "/house_fshader.glsl");

        // Create and fill buffers
        House.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, House.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(House.vertexPositions), gl.STATIC_DRAW);

        House.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, House.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(House.vertexNormals), gl.STATIC_DRAW);

        House.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, House.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(House.vertexTextureCoords), gl.STATIC_DRAW);

        House.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, House.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(House.indices), gl.STATIC_DRAW);

        // Get shader attribute and uniform locations
        House.aPositionShader = gl.getAttribLocation(House.shaderProgram, "aPosition");
        House.aNormalShader = gl.getAttribLocation(House.shaderProgram, "aNormal");
        House.aTextureCoordShader = gl.getAttribLocation(House.shaderProgram, "aTextureCoord");

        House.uModelMatrixShader = gl.getUniformLocation(House.shaderProgram, "modelMatrix");
        House.uCameraMatrixShader = gl.getUniformLocation(House.shaderProgram, "cameraMatrix");
        House.uProjectionMatrixShader = gl.getUniformLocation(House.shaderProgram, "projectionMatrix");
        House.uTextureUnitShader = gl.getUniformLocation(House.shaderProgram, "uTextureUnit");
        House.uRoofTextureUnitShader = gl.getUniformLocation(House.shaderProgram, "uRoofTextureUnit");
        House.uIsRoofShader = gl.getUniformLocation(House.shaderProgram, "uIsRoof");
    }

    static generateGeometry() {
        // House dimensions
        const width = 2.0;
        const height = 1.5;
        const depth = 1.5;
        const roofHeight = 1.0;
        
        House.vertexPositions = [];
        House.vertexNormals = [];
        House.vertexTextureCoords = [];
        House.indices = [];
        House.roofIndices = [];
        
        // Main house vertices (bottom)
        const baseVertices = [
            vec3(-width/2, 0, -depth/2),  // 0 - front left
            vec3(width/2, 0, -depth/2),   // 1 - front right
            vec3(width/2, 0, depth/2),    // 2 - back right
            vec3(-width/2, 0, depth/2),   // 3 - back left
            
            // Top vertices
            vec3(-width/2, height, -depth/2),  // 4 - front left top
            vec3(width/2, height, -depth/2),   // 5 - front right top
            vec3(width/2, height, depth/2),    // 6 - back right top
            vec3(-width/2, height, depth/2),   // 7 - back left top
            
            // Roof peak
            vec3(0, height + roofHeight, 0)    // 8 - roof peak
        ];
        
        // Add vertices, normals, and texture coordinates for each face
        // Front wall
        House.vertexPositions.push(baseVertices[0], baseVertices[1], baseVertices[5], baseVertices[4]);
        for (let i = 0; i < 4; i++) House.vertexNormals.push(vec3(0, 0, -1));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(1, 0.6), vec2(0, 0.6));
        
        // Back wall
        House.vertexPositions.push(baseVertices[2], baseVertices[3], baseVertices[7], baseVertices[6]);
        for (let i = 0; i < 4; i++) House.vertexNormals.push(vec3(0, 0, 1));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(1, 0.6), vec2(0, 0.6));
        
        // Left wall
        House.vertexPositions.push(baseVertices[3], baseVertices[0], baseVertices[4], baseVertices[7]);
        for (let i = 0; i < 4; i++) House.vertexNormals.push(vec3(-1, 0, 0));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(1, 0.6), vec2(0, 0.6));
        
        // Right wall
        House.vertexPositions.push(baseVertices[1], baseVertices[2], baseVertices[6], baseVertices[5]);
        for (let i = 0; i < 4; i++) House.vertexNormals.push(vec3(1, 0, 0));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(1, 0.6), vec2(0, 0.6));
        
        // Roof - front triangle
        House.vertexPositions.push(baseVertices[4], baseVertices[5], baseVertices[8]);
        House.vertexNormals.push(vec3(0, 0.5, -0.5), vec3(0, 0.5, -0.5), vec3(0, 0.5, -0.5));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));
        
        // Roof - back triangle
        House.vertexPositions.push(baseVertices[6], baseVertices[7], baseVertices[8]);
        House.vertexNormals.push(vec3(0, 0.5, 0.5), vec3(0, 0.5, 0.5), vec3(0, 0.5, 0.5));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));
        
        // Roof - left side
        House.vertexPositions.push(baseVertices[7], baseVertices[4], baseVertices[8]);
        House.vertexNormals.push(vec3(-0.5, 0.5, 0), vec3(-0.5, 0.5, 0), vec3(-0.5, 0.5, 0));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));
        
        // Roof - right side
        House.vertexPositions.push(baseVertices[5], baseVertices[6], baseVertices[8]);
        House.vertexNormals.push(vec3(0.5, 0.5, 0), vec3(0.5, 0.5, 0), vec3(0.5, 0.5, 0));
        House.vertexTextureCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));
        
        // Door - on front wall
        // Add a door by altering the front wall texturing
        
        // Add indices for the walls (rectangles - 2 triangles each)
        for (let i = 0; i < 4; i++) {
            const offset = i * 4;
            House.indices.push(
                offset, offset + 1, offset + 2,
                offset, offset + 2, offset + 3
            );
        }
        
        // Add indices for the roof (triangles)
        for (let i = 0; i < 4; i++) {
            const offset = 16 + i * 3;
            House.roofIndices.push(offset, offset + 1, offset + 2);
        }
        
        // Combine all indices
        House.indices = House.indices.concat(House.roofIndices);
    }

    static initializeTextures() {
        // Wall texture
        var wallImage = new Image();
        wallImage.onload = function () {
            House.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, House.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, wallImage.width, wallImage.height, 0, gl.RGB, gl.UNSIGNED_BYTE, wallImage);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.generateMipmap(gl.TEXTURE_2D);
        };
        wallImage.src = "textures/house_wall.jpg";
        
        // Roof texture
        var roofImage = new Image();
        roofImage.onload = function () {
            House.roofTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, House.roofTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, roofImage.width, roofImage.height, 0, gl.RGB, gl.UNSIGNED_BYTE, roofImage);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.generateMipmap(gl.TEXTURE_2D);
        };
        roofImage.src = "textures/roof_texture.jpg";
    }

    constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);
        this.rotationSpeed = 30; // degrees per second
        if (House.shaderProgram == -1) {
            House.initialize();
            House.initializeTextures();
        }
    }


    draw(camera) {
        if (House.texture == -1 || House.roofTexture == -1) return;
    
        gl.useProgram(House.shaderProgram);
        this.modelRotationY += this.rotationSpeed * deltaTime;
        this.updateModelMatrix();
        
        // Position
        gl.bindBuffer(gl.ARRAY_BUFFER, House.positionBuffer);
        gl.vertexAttribPointer(House.aPositionShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(House.aPositionShader);
    
        // Normal
        gl.bindBuffer(gl.ARRAY_BUFFER, House.normalBuffer);
        gl.vertexAttribPointer(House.aNormalShader, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(House.aNormalShader);
    
        // Texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, House.textureCoordBuffer);
        gl.vertexAttribPointer(House.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(House.aTextureCoordShader);
    
        // Wall texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, House.texture);
        gl.uniform1i(House.uTextureUnitShader, 0);
        
        // Roof texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, House.roofTexture);
        gl.uniform1i(House.uRoofTextureUnitShader, 1);
    
        // Set uniforms using the provided camera parameter
        gl.uniformMatrix4fv(House.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(House.uCameraMatrixShader, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(House.uProjectionMatrixShader, false, flatten(camera.projectionMatrix));
    
        // Draw walls (first part of indices)
        gl.uniform1i(House.uIsRoofShader, 0);  // Not roof
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, House.indexBuffer);
        gl.drawElements(gl.TRIANGLES, House.indices.length - House.roofIndices.length, gl.UNSIGNED_SHORT, 0);
        
        // Draw roof (second part of indices)
        gl.uniform1i(House.uIsRoofShader, 1);  // Is roof
        gl.drawElements(gl.TRIANGLES, House.roofIndices.length, gl.UNSIGNED_SHORT, 
            (House.indices.length - House.roofIndices.length) * 2);  // Offset by wall indices
    }
}