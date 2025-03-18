class Circle extends Drawable {
    static shaderProgram = -1;
    static positionBuffer = -1;
    static colorBuffer = -1;
    static indexBuffer = -1;
    
    constructor(gl, x, y, z, radius, r, g, b, a) {
        super(x, y, z, radius, 0, 0, 0); // Use radius as scale
        this.gl = gl;
        this.radius = radius;
        this.color = [r, g, b, a];
        this.segments = 30; // Number of segments for the circle
        
        this.generateCircle();
        this.initBuffers();
    }
    
    generateCircle() {
        this.vertices = [];
        this.colors = [];
        this.indices = [];
        
        // Center vertex
        this.vertices.push(0, 0, 0);
        this.colors.push(...this.color);
        
        // Generate vertices around the circle
        for (let i = 0; i <= this.segments; i++) {
            const angle = (i / this.segments) * Math.PI * 2;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            
            this.vertices.push(x, y, 0);
            this.colors.push(...this.color);
            
            // Generate triangle indices (center + current + next)
            if (i < this.segments) {
                this.indices.push(0, i + 1, i + 2);
            }
        }
    }
    
    initBuffers() {
        const gl = this.gl;
        
        // Only initialize shader program once
        if (Circle.shaderProgram === -1) {
            Circle.shaderProgram = initShaders(gl, "/circle_vshader.glsl", "/circle_fshader.glsl");
        }
        
        // Create position buffer
        Circle.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Circle.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        // Create color buffer
        Circle.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Circle.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        
        // Create index buffer
        Circle.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Circle.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }
    
    draw(camera) {
        const gl = this.gl;
        
        // Update model matrix to include rotation
        this.modelRotationZ += 1; // Increment rotation every frame
        this.updateModelMatrix();
        
        gl.useProgram(Circle.shaderProgram);
        
        // Set uniforms
        const modelMatrixLoc = gl.getUniformLocation(Circle.shaderProgram, "modelMatrix");
        const cameraMatrixLoc = gl.getUniformLocation(Circle.shaderProgram, "cameraMatrix");
        const projectionMatrixLoc = gl.getUniformLocation(Circle.shaderProgram, "projectionMatrix");
        
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(camera.projectionMatrix));
        
        // Setup attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, Circle.positionBuffer);
        const positionLoc = gl.getAttribLocation(Circle.shaderProgram, "aPosition");
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, Circle.colorBuffer);
        const colorLoc = gl.getAttribLocation(Circle.shaderProgram, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);
        
        // Draw the circle
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Circle.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        
        // Clean up
        gl.disableVertexAttribArray(positionLoc);
        gl.disableVertexAttribArray(colorLoc);
    }
}