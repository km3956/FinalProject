#version 300 es
in vec3 aPosition;
out vec3 vTexCoord;

uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;

void main() {
    // Pass texture coordinates to fragment shader
    vTexCoord = aPosition;
    
    // Remove translation from the view matrix
    vec4 pos = projectionMatrix * cameraMatrix * vec4(aPosition, 1.0);
    
    // Force depth to be 1.0 (farthest)
    gl_Position = pos.xyww;
}