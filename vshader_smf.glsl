attribute vec4 aPosition;
attribute vec4 aColor;

varying vec4 vColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * aPosition;
    vColor = aColor;
}
