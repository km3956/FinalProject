attribute vec3 aPosition;
attribute vec4 aColor;
varying vec4 vColor;
uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * vec4(aPosition, 1.0);
    vColor = aColor;
}