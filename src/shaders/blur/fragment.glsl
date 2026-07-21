uniform sampler2D uTexture;
uniform vec3 uTintColor;  
varying vec2 vUv;

void main() {
   
    vec4 color = texture2D(uTexture, vUv);

    color.rgb *= uTintColor;
    
    gl_FragColor = color;
}