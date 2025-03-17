#version 300 es
precision mediump float;

in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vPosition;

out vec4 fColor;

uniform sampler2D uTextureUnit;
uniform sampler2D uRoofTextureUnit;
uniform int uIsRoof;

void main() {
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.0));  // Directional light
    vec3 normal = normalize(vNormal);
    
    // Basic lighting calculation
    float ambient = 0.3;
    float diffuse = max(0.0, dot(normal, lightDir));
    float lighting = ambient + diffuse * 0.7;
    
    // Apply appropriate texture based on whether we're drawing roof or walls
    if (uIsRoof == 1) {
        fColor = texture(uRoofTextureUnit, vTextureCoord) * vec4(lighting, lighting, lighting, 1.0);
    } else {
        fColor = texture(uTextureUnit, vTextureCoord) * vec4(lighting, lighting, lighting, 1.0);
    }
}