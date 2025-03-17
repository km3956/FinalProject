#version 300 es
precision mediump float;

in vec3 vTexCoord;
out vec4 fColor;

uniform samplerCube uSkybox;

void main() {
    fColor = texture(uSkybox, vTexCoord);
}