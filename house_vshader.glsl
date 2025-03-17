#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTextureCoord;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vPosition;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;

void main() {
    // Calculate position in eye coordinates
    vec4 position = cameraMatrix * modelMatrix * vec4(aPosition, 1.0);
    vPosition = position.xyz;
    
    // Transform normal into eye coordinates
    mat4 normalMatrix = transpose(inverse(cameraMatrix * modelMatrix));
    vNormal = normalize((normalMatrix * vec4(aNormal, 0.0)).xyz);
    
    // Pass texture coordinates
    vTextureCoord = aTextureCoord;
    
    // Calculate final position
    gl_Position = projectionMatrix * position;
}