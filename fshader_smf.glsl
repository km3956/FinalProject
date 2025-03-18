precision mediump float;
varying vec2 vUV;

float random(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float noise = random(vUV * 0.001); // Drastically lower frequency for huge patches

    // Increase threshold so there are very few, large black patches
    if (noise < 0.1) { 
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black patch
    } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White body
    }
}
