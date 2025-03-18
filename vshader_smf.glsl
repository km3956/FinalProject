attribute vec4 aPosition;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUV;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * aPosition;
    vUV = aPosition.xy; // Pass X and Y as coordinates for spot pattern
}