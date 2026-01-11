const ne = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, oe = `precision mediump float;
uniform sampler2D u_image;
uniform float scaleX;
uniform float scaleY;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = vec2(v_texCoord[0]*1.0/scaleX - (1.0/scaleX/2.0 -0.5), v_texCoord[1]*1.0/scaleY - (1.0/scaleY/2.0 -0.5));
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`;
let se = {
  title: "AAF Video Scale Effect",
  description: "A scale effect based on the AAF spec.",
  vertexShader: ne,
  fragmentShader: oe,
  properties: {
    scaleX: { type: "uniform", value: 1 },
    scaleY: { type: "uniform", value: 1 }
  },
  inputs: ["u_image"]
};
const ae = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, le = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    color_a[0] *= (1.0 - mix);
    color_a[1] *= (1.0 - mix);
    color_a[2] *= (1.0 - mix);
    color_a[3] *= (1.0 - mix);
    color_b[0] *= mix;
    color_b[1] *= mix;
    color_b[2] *= mix;
    color_b[3] *= mix;
    gl_FragColor = color_a + color_b;
}
`;
let ue = {
  title: "Cross-Fade",
  description: "A cross-fade effect. Typically used as a transistion.",
  vertexShader: ae,
  fragmentShader: le,
  properties: {
    mix: { type: "uniform", value: 0 }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const _e = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, de = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (v_texCoord[0] > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`;
let ce = {
  title: "Horizontal Wipe",
  description: "A horizontal wipe effect. Typically used as a transistion.",
  vertexShader: _e,
  fragmentShader: de,
  properties: {
    mix: { type: "uniform", value: 0 }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const he = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, pe = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (v_texCoord[1] > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`;
let me = {
  title: "vertical Wipe",
  description: "A vertical wipe effect. Typically used as a transistion.",
  vertexShader: he,
  fragmentShader: pe,
  properties: {
    mix: { type: "uniform", value: 0 }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const fe = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, ve = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (clamp(rand(v_texCoord),  0.01, 1.001) > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`;
let ge = {
  title: "Random Dissolve",
  description: "A random dissolve effect. Typically used as a transistion.",
  vertexShader: fe,
  fragmentShader: ve,
  properties: {
    mix: { type: "uniform", value: 0 }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const xe = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, be = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
uniform vec4 color;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    float mix_amount = (mix *2.0) - 1.0;
    if(mix_amount < 0.0){
        gl_FragColor = abs(mix_amount) * color_a + (1.0 - abs(mix_amount)) * color;
    } else {
        gl_FragColor = mix_amount * color_b + (1.0 - mix_amount) * color;
    }
}
`;
let Te = {
  title: "To Color And Back Fade",
  description: "A fade to black and back effect. Setting mix to 0.5 is a fully solid color frame. Typically used as a transistion.",
  vertexShader: xe,
  fragmentShader: be,
  properties: {
    mix: { type: "uniform", value: 0 },
    color: { type: "uniform", value: [0, 0, 0, 0] }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const ye = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, Ce = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
float sign (vec2 p1, vec2 p2, vec2 p3){
    return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
}
bool pointInTriangle(vec2 pt, vec2 v1, vec2 v2, vec2 v3){
    bool b1, b2, b3;
    b1 = sign(pt, v1, v2) < 0.0;
    b2 = sign(pt, v2, v3) < 0.0;
    b3 = sign(pt, v3, v1) < 0.0;
    return ((b1 == b2) && (b2 == b3));
}
vec2 rotatePointAboutPoint(vec2 point, vec2 pivot, float angle){
    float s = sin(angle);
    float c = cos(angle);
    float x = point[0] - pivot[0];
    float y = point[1] - pivot[1];
    float new_x = x * c - y * s;
    float new_y = x * s + y * c;
    return vec2(new_x + pivot[0], new_y+pivot[1]);
}

void main(){
    vec4 color_a = texture2D(u_image_b, v_texCoord);
    vec4 color_b = texture2D(u_image_a, v_texCoord);
    vec2 t0_p0,t0_p1,t0_p2,t1_p0,t1_p1,t1_p2,t2_p0,t2_p1,t2_p2,t3_p0,t3_p1,t3_p2;
    vec2 t4_p0,t4_p1,t4_p2,t5_p0,t5_p1,t5_p2,t6_p0,t6_p1,t6_p2,t7_p0,t7_p1,t7_p2;


    t0_p0 = vec2(0.0, 0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);
    t0_p1 = vec2(0.0, -0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);
    t0_p2 = vec2(1.0, 0.0) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);

    t1_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854);
    t1_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854);
    t1_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854);

    t2_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 2.0);
    t2_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 2.0);
    t2_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 2.0);

    t3_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 3.0);
    t3_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 3.0);
    t3_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 3.0);

    t4_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 4.0);
    t4_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 4.0);
    t4_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 4.0);

    t5_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 5.0);
    t5_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 5.0);
    t5_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 5.0);

    t6_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 6.0);
    t6_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 6.0);
    t6_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 6.0);

    t7_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 7.0);
    t7_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 7.0);
    t7_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 7.0);

    if(mix > 0.99){
        gl_FragColor = color_a;
        return;
    }
    if(mix < 0.01){
        gl_FragColor = color_b;
        return;
    }
    if(pointInTriangle(v_texCoord, t0_p0, t0_p1, t0_p2) || pointInTriangle(v_texCoord, t1_p0, t1_p1, t1_p2) || pointInTriangle(v_texCoord, t2_p0, t2_p1, t2_p2) || pointInTriangle(v_texCoord, t3_p0, t3_p1, t3_p2) || pointInTriangle(v_texCoord, t4_p0, t4_p1, t4_p2) || pointInTriangle(v_texCoord, t5_p0, t5_p1, t5_p2) || pointInTriangle(v_texCoord, t6_p0, t6_p1, t6_p2) || pointInTriangle(v_texCoord, t7_p0, t7_p1, t7_p2)){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`;
let Ee = {
  title: "Star Wipe Fade",
  description: "A classic star wipe transistion. Typically used as a transistion.",
  vertexShader: ye,
  fragmentShader: Ce,
  properties: {
    mix: { type: "uniform", value: 1 }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const Ae = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, Se = `precision mediump float;
uniform sampler2D u_image;
uniform float a;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    gl_FragColor = color;
}
`;
let Ne = {
  title: "Combine",
  description: "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
  vertexShader: Ae,
  fragmentShader: Se,
  properties: {
    a: { type: "uniform", value: 0 }
  },
  inputs: ["u_image"]
};
const Fe = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, Re = `precision mediump float;
uniform sampler2D u_image;
uniform float a;
uniform vec3 colorAlphaThreshold;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    if (color[0] > colorAlphaThreshold[0] && color[1]> colorAlphaThreshold[1] && color[2]> colorAlphaThreshold[2]){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`;
let De = {
  title: "Color Threshold",
  description: "Turns all pixels with a greater value than the specified threshold transparent.",
  vertexShader: Fe,
  fragmentShader: Re,
  properties: {
    a: { type: "uniform", value: 0 },
    colorAlphaThreshold: { type: "uniform", value: [0, 0.55, 0] }
  },
  inputs: ["u_image"]
};
const Pe = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, ke = `precision mediump float;
uniform sampler2D u_image;
uniform vec3 inputMix;
uniform vec3 outputMix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];
    color[0] = mono * outputMix[0];
    color[1] = mono * outputMix[1];
    color[2] = mono * outputMix[2];
    gl_FragColor = color;
}
`;
let Ie = {
  title: "Monochrome",
  description: "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
  vertexShader: Pe,
  fragmentShader: ke,
  properties: {
    inputMix: { type: "uniform", value: [0.4, 0.6, 0.2] },
    outputMix: { type: "uniform", value: [1, 1, 1] }
  },
  inputs: ["u_image"]
};
const we = `attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform float blurAmount;
varying vec2 v_texCoord;
varying vec2 v_blurTexCoords[14];
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_blurTexCoords[ 0] = v_texCoord + vec2(-0.028 * blurAmount, 0.0);
    v_blurTexCoords[ 1] = v_texCoord + vec2(-0.024 * blurAmount, 0.0);
    v_blurTexCoords[ 2] = v_texCoord + vec2(-0.020 * blurAmount, 0.0);
    v_blurTexCoords[ 3] = v_texCoord + vec2(-0.016 * blurAmount, 0.0);
    v_blurTexCoords[ 4] = v_texCoord + vec2(-0.012 * blurAmount, 0.0);
    v_blurTexCoords[ 5] = v_texCoord + vec2(-0.008 * blurAmount, 0.0);
    v_blurTexCoords[ 6] = v_texCoord + vec2(-0.004 * blurAmount, 0.0);
    v_blurTexCoords[ 7] = v_texCoord + vec2( 0.004 * blurAmount, 0.0);
    v_blurTexCoords[ 8] = v_texCoord + vec2( 0.008 * blurAmount, 0.0);
    v_blurTexCoords[ 9] = v_texCoord + vec2( 0.012 * blurAmount, 0.0);
    v_blurTexCoords[10] = v_texCoord + vec2( 0.016 * blurAmount, 0.0);
    v_blurTexCoords[11] = v_texCoord + vec2( 0.020 * blurAmount, 0.0);
    v_blurTexCoords[12] = v_texCoord + vec2( 0.024 * blurAmount, 0.0);
    v_blurTexCoords[13] = v_texCoord + vec2( 0.028 * blurAmount, 0.0);
}
`, Ue = `precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying vec2 v_blurTexCoords[14];
void main(){
    gl_FragColor = vec4(0.0);
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;
}
`;
let Oe = {
  title: "Horizontal Blur",
  description: "A horizontal blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
  vertexShader: we,
  fragmentShader: Ue,
  properties: {
    blurAmount: { type: "uniform", value: 1 }
  },
  inputs: ["u_image"]
};
const Le = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform float blurAmount;
varying vec2 v_blurTexCoords[14];
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_blurTexCoords[ 0] = v_texCoord + vec2(0.0,-0.028 * blurAmount);
    v_blurTexCoords[ 1] = v_texCoord + vec2(0.0,-0.024 * blurAmount);
    v_blurTexCoords[ 2] = v_texCoord + vec2(0.0,-0.020 * blurAmount);
    v_blurTexCoords[ 3] = v_texCoord + vec2(0.0,-0.016 * blurAmount);
    v_blurTexCoords[ 4] = v_texCoord + vec2(0.0,-0.012 * blurAmount);
    v_blurTexCoords[ 5] = v_texCoord + vec2(0.0,-0.008 * blurAmount);
    v_blurTexCoords[ 6] = v_texCoord + vec2(0.0,-0.004 * blurAmount);
    v_blurTexCoords[ 7] = v_texCoord + vec2(0.0, 0.004 * blurAmount);
    v_blurTexCoords[ 8] = v_texCoord + vec2(0.0, 0.008 * blurAmount);
    v_blurTexCoords[ 9] = v_texCoord + vec2(0.0, 0.012 * blurAmount);
    v_blurTexCoords[10] = v_texCoord + vec2(0.0, 0.016 * blurAmount);
    v_blurTexCoords[11] = v_texCoord + vec2(0.0, 0.020 * blurAmount);
    v_blurTexCoords[12] = v_texCoord + vec2(0.0, 0.024 * blurAmount);
    v_blurTexCoords[13] = v_texCoord + vec2(0.0, 0.028 * blurAmount);
}
`, Me = `precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying vec2 v_blurTexCoords[14];
void main(){
    gl_FragColor = vec4(0.0);
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;
}
`;
let Ge = {
  title: "Vertical Blur",
  description: "A vertical blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
  vertexShader: Le,
  fragmentShader: Me,
  properties: {
    blurAmount: { type: "uniform", value: 1 }
  },
  inputs: ["u_image"]
};
const Be = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, $e = `precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
void main(){
    vec2 coord = vec2(1.0 - v_texCoord[0] ,v_texCoord[1]);
    vec4 color = texture2D(u_image, coord);
    gl_FragColor = color;
}
`;
let We = {
  title: "AAF Video Flop Effect",
  description: "A flop effect based on the AAF spec. Mirrors the image in the y-axis",
  vertexShader: Be,
  fragmentShader: $e,
  properties: {},
  inputs: ["u_image"]
};
const Ve = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, Xe = `precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
void main(){
    vec2 coord = vec2(v_texCoord[0] ,1.0 - v_texCoord[1]);
    vec4 color = texture2D(u_image, coord);
    gl_FragColor = color;
}
`;
let Ye = {
  title: "AAF Video Flip Effect",
  description: "A flip effect based on the AAF spec. Mirrors the image in the x-axis",
  vertexShader: Ve,
  fragmentShader: Xe,
  properties: {},
  inputs: ["u_image"]
};
const He = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, ze = `precision mediump float;
uniform sampler2D u_image;
uniform float positionOffsetX;
uniform float positionOffsetY;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = vec2(v_texCoord[0] - positionOffsetX/2.0, v_texCoord[1] -  positionOffsetY/2.0);
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`;
let je = {
  title: "AAF Video Position Effect",
  description: "A position effect based on the AAF spec.",
  vertexShader: He,
  fragmentShader: ze,
  properties: {
    positionOffsetX: { type: "uniform", value: 0 },
    positionOffsetY: { type: "uniform", value: 0 }
  },
  inputs: ["u_image"]
};
const qe = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, Ke = `precision mediump float;
uniform sampler2D u_image;
uniform float cropLeft;
uniform float cropRight;
uniform float cropTop;
uniform float cropBottom;
varying vec2 v_texCoord;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    if (v_texCoord[0] < (cropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[0] > (cropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[1] < (-cropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[1] > (-cropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    gl_FragColor = color;
}
`;
let Ze = {
  title: "AAF Video Crop Effect",
  description: "A crop effect based on the AAF spec.",
  vertexShader: qe,
  fragmentShader: Ke,
  properties: {
    cropLeft: { type: "uniform", value: -1 },
    cropRight: { type: "uniform", value: 1 },
    cropTop: { type: "uniform", value: -1 },
    cropBottom: { type: "uniform", value: 1 }
  },
  inputs: ["u_image"]
};
const Je = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, Qe = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
uniform float currentTime;
varying vec2 v_texCoord;
varying float v_mix;
float rand(vec2 co, float currentTime){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);
}
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (clamp(rand(v_texCoord, currentTime),  0.01, 1.001) > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`;
let et = {
  title: "Static Dissolve",
  description: "A static dissolve effect. Typically used as a transistion.",
  vertexShader: Je,
  fragmentShader: Qe,
  properties: {
    mix: { type: "uniform", value: 0 }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const tt = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, it = `precision mediump float;
uniform sampler2D u_image;
uniform float currentTime;
uniform float amount;
varying vec2 v_texCoord;
uniform vec3 weight;
float rand(vec2 co, float currentTime){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);
}
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    color[0] = color[0] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[0] * amount;
    color[1] = color[1] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[1] * amount;
    color[2] = color[2] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[2] *amount;
    gl_FragColor = color;
}
`;
let rt = {
  title: "Static",
  description: "A static effect to add pseudo random noise to a video",
  vertexShader: tt,
  fragmentShader: it,
  properties: {
    weight: { type: "uniform", value: [1, 1, 1] },
    amount: { type: "uniform", value: 1 }
  },
  inputs: ["u_image"]
};
const nt = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, ot = `precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    float wobble = 1.0 - abs((mix*2.0)-1.0);
    vec2 pos = vec2(v_texCoord[0] + ((sin(v_texCoord[1]*(10.0*wobble*3.14) + wobble*10.0)/13.0)), v_texCoord[1]);
    vec4 color_a = texture2D(u_image_a, pos);
    vec4 color_b = texture2D(u_image_b, pos);
    color_a[0] *= (1.0 - mix);
    color_a[1] *= (1.0 - mix);
    color_a[2] *= (1.0 - mix);
    color_a[3] *= (1.0 - mix);
    color_b[0] *= mix;
    color_b[1] *= mix;
    color_b[2] *= mix;
    color_b[3] *= mix;
    gl_FragColor = color_a + color_b;
}
`;
let st = {
  title: "Dream-Fade",
  description: "A wobbly dream effect. Typically used as a transistion.",
  vertexShader: nt,
  fragmentShader: ot,
  properties: {
    mix: { type: "uniform", value: 0 }
  },
  inputs: ["u_image_a", "u_image_b"]
};
const at = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, lt = `precision mediump float;
uniform sampler2D u_image;
uniform float opacity;
varying vec2 v_texCoord;
varying float v_opacity;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    color[3] *= opacity;
    gl_FragColor = color;
}
`, ut = {
  title: "Opacity",
  description: "Sets the opacity of an input.",
  vertexShader: at,
  fragmentShader: lt,
  properties: {
    opacity: { type: "uniform", value: 0.7 }
  },
  inputs: ["u_image"]
}, _t = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, dt = `precision mediump float;
uniform sampler2D u_image;
uniform float x;
uniform float y;
uniform float width;
uniform float height;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = (((v_texCoord)*vec2(width, height)) + vec2(0, 1.0-height)) +vec2(x,-y);
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`;
let ct = {
  title: "Primer Simple Crop",
  description: "A simple crop processors for primer",
  vertexShader: _t,
  fragmentShader: dt,
  properties: {
    x: { type: "uniform", value: 0 },
    y: { type: "uniform", value: 0 },
    width: { type: "uniform", value: 1 },
    height: { type: "uniform", value: 1 }
  },
  inputs: ["u_image"]
}, B = {
  AAF_VIDEO_SCALE: se,
  CROSSFADE: ue,
  DREAMFADE: st,
  HORIZONTAL_WIPE: ce,
  VERTICAL_WIPE: me,
  RANDOM_DISSOLVE: ge,
  STATIC_DISSOLVE: et,
  STATIC_EFFECT: rt,
  TO_COLOR_AND_BACK: Te,
  STAR_WIPE: Ee,
  COMBINE: Ne,
  COLORTHRESHOLD: De,
  MONOCHROME: Ie,
  HORIZONTAL_BLUR: Oe,
  VERTICAL_BLUR: Ge,
  AAF_VIDEO_CROP: Ze,
  AAF_VIDEO_POSITION: je,
  AAF_VIDEO_FLIP: Ye,
  AAF_VIDEO_FLOP: We,
  OPACITY: ut,
  CROP: ct
};
const ht = "GraphNode";
class $ {
  /**
   * Base class from which all processing and source nodes are derrived.
   */
  constructor(e, t, i, n = !1) {
    this._renderGraph = t, this._limitConnections = n, this._inputNames = i, this._destroyed = !1, this._gl = e, this._renderGraph = t, this._rendered = !1, this._displayName = ht;
  }
  /**
   * Get a string representation of the class name.
   *
   * @return String A string of the class name.
   */
  get displayName() {
    return this._displayName;
  }
  /**
   * Get the names of the inputs to this node.
   *
   * @return {String[]} An array of the names of the inputs ot the node.
   */
  get inputNames() {
    return this._inputNames.slice();
  }
  /**
   * The maximum number of connections that can be made to this node. If there is not limit this will return Infinity.
   *
   * @return {number} The number of connections which can be made to this node.
   */
  get maximumConnections() {
    return this._limitConnections === !1 ? 1 / 0 : this._inputNames.length;
  }
  /**
   * Get an array of all the nodes which connect to this node.
   *
   * @return {GraphNode[]} An array of nodes which connect to this node.
   */
  get inputs() {
    let e = this._renderGraph.getInputsForNode(this);
    return e = e.filter(function(t) {
      return t !== void 0;
    }), e;
  }
  /**
   * Get an array of all the nodes which this node outputs to.
   *
   * @return {GraphNode[]} An array of nodes which this node connects to.
   */
  get outputs() {
    return this._renderGraph.getOutputsForNode(this);
  }
  /**
   * Get whether the node has been destroyed or not.
   *
   * @return {boolean} A true/false value of whather the node has been destoryed or not.
   */
  get destroyed() {
    return this._destroyed;
  }
  /**
   * Connect this node to the targetNode
   *
   * @param {GraphNode} targetNode - the node to connect.
   * @param {(number| String)} [targetPort] - the port on the targetNode to connect to, this can be an index, a string identifier, or undefined (in which case the next available port will be connected to).
   *
   */
  connect(e, t) {
    return this._renderGraph.registerConnection(this, e, t);
  }
  /**
   * Disconnect this node from the targetNode. If targetNode is undefind remove all out-bound connections.
   *
   * @param {GraphNode} [targetNode] - the node to disconnect from. If undefined, disconnect from all nodes.
   *
   */
  disconnect(e) {
    if (e === void 0) {
      let t = this._renderGraph.getOutputsForNode(this);
      return t.forEach((i) => this._renderGraph.unregisterConnection(this, i)), t.length > 0;
    }
    return this._renderGraph.unregisterConnection(this, e);
  }
  /**
   * Destory this node, removing it from the graph.
   */
  destroy() {
    this.disconnect();
    for (let e of this.inputs)
      e.disconnect(this);
    this._destroyed = !0;
  }
}
let l = {
  waiting: 0,
  sequenced: 1,
  playing: 2,
  paused: 3,
  ended: 4,
  error: 5
};
const pt = "SourceNode";
class C extends $ {
  /**
   * Initialise an instance of a SourceNode.
   * This is the base class for other Nodes which generate media to be passed into the processing pipeline.
   */
  constructor(e, t, i, n) {
    super(t, i, [], !0), this._element = void 0, this._elementURL = void 0, this._isResponsibleForElementLifeCycle = !0, typeof e == "string" || window.MediaStream !== void 0 && e instanceof MediaStream ? this._elementURL = e : (this._element = e, this._isResponsibleForElementLifeCycle = !1), this._state = l.waiting, this._currentTime = n, this._startTime = NaN, this._stopTime = 1 / 0, this._ready = !1, this._loadCalled = !1, this._stretchPaused = !1, this._texture = y(t), t.texImage2D(
      t.TEXTURE_2D,
      0,
      t.RGBA,
      1,
      1,
      0,
      t.RGBA,
      t.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    ), this._callbacks = [], this._renderPaused = !1, this._displayName = pt;
  }
  get state() {
    return this._state;
  }
  /**
   * Returns the underlying DOM element which represents this source node.
   * Note: If a source node is created with a url rather than passing in an existing element then this will return undefined until the source node preloads the element.
   *
   * @return {Element} The underlying DOM element representing the media for the node. If the lifecycle of the video is owned UNSIGNED_BYTE the node itself, this can return undefined if the element hasn't been loaded yet.
   *
   * @example
   * //Accessing the Element on a VideoNode created via a URL
   * var ctx = new VideoContext();
   * var videoNode = ctx.createVideoSourceNode('video.mp4');
   * videoNode.start(0);
   * videoNode.stop(5);
   * //When the node starts playing the element should exist so set it's volume to 0
   * videoNode.regsiterCallback("play", function(){videoNode.element.volume = 0;});
   *
   *
   * @example
   * //Accessing the Element on a VideoNode created via an already existing element
   * var ctx = new VideoContext();
   * var videoElement = document.createElement("video");
   * var videoNode = ctx.createVideoSourceNode(videoElement);
   * videoNode.start(0);
   * videoNode.stop(5);
   * //The elemnt can be accessed any time because it's lifecycle is managed outside of the VideoContext
   * videoNode.element.volume = 0;
   *
   */
  get element() {
    return this._element;
  }
  /**
   * Returns the duration of the node on a timeline. If no start time is set will return undefiend, if no stop time is set will return Infinity.
   *
   * @return {number} The duration of the node in seconds.
   *
   */
  get duration() {
    if (!isNaN(this._startTime))
      return this._stopTime === 1 / 0 ? 1 / 0 : this._stopTime - this._startTime;
  }
  set stretchPaused(e) {
    this._stretchPaused = e;
  }
  get stretchPaused() {
    return this._stretchPaused;
  }
  _load() {
    this._loadCalled || (this._triggerCallbacks("load"), this._loadCalled = !0);
  }
  _unload() {
    this._triggerCallbacks("destroy"), this._loadCalled = !1;
  }
  /**
   * Register callbacks against one of these events: "load", "destroy", "seek", "pause", "play", "ended", "durationchange", "loaded", "error"
   *
   * @param {String} type - the type of event to register the callback against.
   * @param {function} func - the function to call.
   *
   * @example
   * var ctx = new VideoContext();
   * var videoNode = ctx.createVideoSourceNode('video.mp4');
   *
   * videoNode.registerCallback("load", function(){"video is loading"});
   * videoNode.registerCallback("play", function(){"video is playing"});
   * videoNode.registerCallback("ended", function(){"video has eneded"});
   *
   */
  registerCallback(e, t) {
    this._callbacks.push({ type: e, func: t });
  }
  /**
   * Remove callback.
   *
   * @param {function} [func] - the callback to remove, if undefined will remove all callbacks for this node.
   *
   * @example
   * var ctx = new VideoContext();
   * var videoNode = ctx.createVideoSourceNode('video.mp4');
   *
   * videoNode.registerCallback("load", function(){"video is loading"});
   * videoNode.registerCallback("play", function(){"video is playing"});
   * videoNode.registerCallback("ended", function(){"video has eneded"});
   * videoNode.unregisterCallback(); //remove all of the three callbacks.
   *
   */
  unregisterCallback(e) {
    let t = [];
    for (let i of this._callbacks)
      (e === void 0 || i.func === e) && t.push(i);
    for (let i of t) {
      let n = this._callbacks.indexOf(i);
      this._callbacks.splice(n, 1);
    }
  }
  _triggerCallbacks(e, t) {
    for (let i of this._callbacks)
      i.type === e && (t !== void 0 ? i.func(this, t) : i.func(this));
  }
  /**
   * Start playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
   *
   * @param {number} time - the time from the currentTime of the VideoContext which to start playing, if negative will play as soon as possible.
   * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
   */
  // TODO 这里面添加元素的时候，会添加上当前的currentTime， 这里已经去掉了
  start(e) {
    return this._state !== l.waiting ? (console.debug("SourceNode is has already been sequenced. Can't sequence twice."), !1) : (this._startTime = e, this._state = l.sequenced, !0);
  }
  /**
   * Start playback at an absolute time ont the VideoContext's timeline.
   *
   * @param {number} time - the time on the VideoContexts timeline to start playing.
   * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
   */
  startAt(e) {
    return this._state !== l.waiting ? (console.debug("SourceNode is has already been sequenced. Can't sequence twice."), !1) : (this._startTime = e, this._state = l.sequenced, !0);
  }
  get startTime() {
    return this._startTime;
  }
  set startTime(e) {
    this._startTime = e;
  }
  /**
   * Stop playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
   *
   * @param {number} time - the time from the currentTime of the video context which to stop playback.
   * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
   */
  // TODO 这里面添加元素的时候，会添加上当前的currentTime， 这里已经去掉了
  stop(e) {
    return this._state === l.ended ? (console.debug("SourceNode has already ended. Cannot call stop."), !1) : this._state === l.waiting ? (console.debug("SourceNode must have start called before stop is called"), !1) : this._currentTime + e <= this._startTime ? (console.debug("SourceNode must have a stop time after it's start time, not before."), !1) : (this._stopTime = e, this._stretchPaused = !1, this._triggerCallbacks("durationchange", this.duration), !0);
  }
  /**
   * Stop playback at an absolute time ont the VideoContext's timeline.
   *
   * @param {number} time - the time on the VideoContexts timeline to stop playing.
   * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
   */
  stopAt(e) {
    return this._state === l.ended ? (console.debug("SourceNode has already ended. Cannot call stop."), !1) : this._state === l.waiting ? (console.debug("SourceNode must have start called before stop is called"), !1) : e <= this._startTime ? (console.debug("SourceNode must have a stop time after it's start time, not before."), !1) : (this._stopTime = e, this._stretchPaused = !1, this._triggerCallbacks("durationchange", this.duration), !0);
  }
  get stopTime() {
    return this._stopTime;
  }
  set stopTime(e) {
    this._stopTime = e;
  }
  _seek(e) {
    this._renderPaused = !1, this._triggerCallbacks("seek", e), this._state !== l.waiting && (e < this._startTime && (this._state = l.sequenced), e >= this._startTime && this._state !== l.paused && (this._state = l.playing), e >= this._stopTime && (this._triggerCallbacks("ended"), this._state = l.ended), this._currentTime = e);
  }
  _pause() {
    (this._state === l.playing || this._currentTime === 0 && this._startTime === 0) && (this._triggerCallbacks("pause"), this._state = l.paused, this._renderPaused = !1);
  }
  _play() {
    (this._state === l.paused || this._state === l.playing) && (this._triggerCallbacks("play"), this._state = l.playing);
  }
  _isReady() {
    return this._buffering ? !1 : this._state === l.playing || this._state === l.paused || this._state === l.error ? this._ready : !0;
  }
  _update(e, t = !0) {
    this._rendered = !0;
    let i = e - this._currentTime;
    return this._currentTime = e, this._state === l.waiting || this._state === l.ended || this._state === l.error ? !1 : (this._triggerCallbacks("render", e), e < this._startTime && (O(this._gl, this._texture), this._state = l.sequenced), e >= this._startTime && this._state !== l.paused && this._state !== l.error && (this._state !== l.playing && this._triggerCallbacks("play"), this._state = l.playing), e > this._stopTime && (e <= this.duration && O(this._gl, this._texture), this._triggerCallbacks("ended"), this._state = l.ended), this._element === void 0 || this._ready === !1 || (!this._renderPaused && this._state === l.paused && (this._renderPaused = !0), this._state === l.playing && this._stretchPaused && (this._stopTime += i)), !0);
  }
  /**
   * Clear any timeline state the node currently has, this puts the node in the "waiting" state, as if neither start nor stop had been called.
   */
  clearTimelineState() {
    this._startTime = NaN, this._stopTime = 1 / 0, this._state = l.waiting;
  }
  /**
   * Destroy and clean-up the node.
   */
  destroy() {
    this._unload(), super.destroy(), this.unregisterCallback(), delete this._element, this._elementURL = void 0, this._state = l.waiting, this._currentTime = 0, this._startTime = NaN, this._stopTime = 1 / 0, this._ready = !1, this._loadCalled = !1, this._gl.deleteTexture(this._texture), this._texture = void 0;
  }
}
class D extends C {
  /**
   * Initialise an instance of a MediaNode.
   * This should not be called directly, but extended by other Node Types which use a `HTMLMediaElement`.
   */
  constructor(e, t, i, n, s = 1, o = 0, _ = 4, u = void 0, a = {}) {
    super(e, t, i, n), this._preloadTime = _, this._sourceOffset = o, this._globalPlaybackRate = s, this._mediaElementCache = u, this._playbackRate = 1, this._playbackRateUpdated = !0, this._attributes = Object.assign({ volume: 1 }, a), this._loopElement = !1, this._isElementPlaying = !1, this._attributes.loop && (this._loopElement = this._attributes.loop);
  }
  set playbackRate(e) {
    this._playbackRate = e, this._playbackRateUpdated = !0;
  }
  set stretchPaused(e) {
    super.stretchPaused = e, this._element && (this._stretchPaused ? this._element.pause() : this._state === l.playing && this._element.play());
  }
  get stretchPaused() {
    return this._stretchPaused;
  }
  get playbackRate() {
    return this._playbackRate;
  }
  get elementURL() {
    return this._elementURL;
  }
  /**
   * @property {Boolean}
   * @summary - Check if the element is waiting on the network to continue playback
   */
  get _buffering() {
    return this._element ? this._element.readyState < HTMLMediaElement.HAVE_FUTURE_DATA : !1;
  }
  set volume(e) {
    this._attributes.volume = e, this._element !== void 0 && (this._element.volume = this._attributes.volume);
  }
  set sourceOffset(e) {
    this._sourceOffset = e, this._seek(this._currentTime);
  }
  set offset(e) {
    this._sourceOffset = e;
  }
  set elementURL(e) {
    this._elementURL = e, this._unload();
  }
  _triggerLoad() {
    if (this._isResponsibleForElementLifeCycle) {
      if (this._mediaElementCache ? this._element = this._mediaElementCache.getElementAndLinkToNode(this) : (this._element = document.createElement(this._elementType), this._element.setAttribute("crossorigin", "anonymous"), this._element.setAttribute("webkit-playsinline", ""), this._element.setAttribute("playsinline", ""), this._playbackRateUpdated = !0), this._element.volume = this._attributes.volume || 0, window.MediaStream !== void 0 && this._elementURL instanceof MediaStream)
        this._element.srcObject = this._elementURL;
      else if (this._element.src = this._elementURL, this._sourceOffset === 0 && this._elementType === "video") {
        const e = this._element;
        let t = () => {
          e.currentTime = 0, e.removeEventListener("loadedmetadata", t);
        };
        e.addEventListener("loadedmetadata", t);
      }
    }
    if (this._element) {
      for (let t in this._attributes)
        this._element[t] = this._attributes[t];
      let e = 0;
      this._currentTime > this._startTime && (e = this._currentTime - this._startTime), this._element.currentTime = this._sourceOffset + e, this._element.onerror = () => {
        this._element !== void 0 && (console.debug("Error with element", this._element), this._state = l.error, this._ready = !0, this._triggerCallbacks("error"));
      };
    } else
      this._state = l.error, this._ready = !0, this._triggerCallbacks("error");
    this._loadTriggered = !0;
  }
  /**
   * _load has two functions:
   *
   * 1. `_triggerLoad` which ensures the element has the correct src and is at the correct currentTime,
   *     so that the browser can start fetching media.
   *
   * 2.  `shouldPollForElementReadyState` waits until the element has a "readState" that signals there
   *     is enough media to start playback. This is a little confusing as currently structured.
   *     We're using the _update loop to poll the _load function which checks the element status.
   *     When ready we fire off the "loaded callback"
   *
   */
  _load() {
    super._load(), this._loadTriggered || this._triggerLoad(), this._element !== void 0 && (this._element.readyState > 3 && !this._element.seeking ? (this._loopElement === !1 && (this._stopTime === 1 / 0 || this._stopTime == null) && (this._stopTime = this._startTime + this._element.duration, this._triggerCallbacks("durationchange", this.duration)), this._ready !== !0 && (this._triggerCallbacks("loaded"), this._playbackRateUpdated = !0), this._ready = !0) : this._state !== l.error && (this._ready = !1, this._state === l.playing && this._currentTime >= this._startTime && this._currentTime <= this._stopTime && this._triggerCallbacks("waiting")));
  }
  _unload() {
    if (super._unload(), this._isResponsibleForElementLifeCycle && this._element !== void 0) {
      this._element.removeAttribute("src"), this._element.srcObject = void 0, this._element.load();
      for (let e in this._attributes)
        this._element.removeAttribute(e);
      this._mediaElementCache && this._mediaElementCache.unlinkNodeFromElement(this._element), this._element = void 0, this._mediaElementCache || delete this._element;
    }
    this._ready = !1, this._isElementPlaying = !1, this._loadTriggered = !1;
  }
  _seek(e) {
    if (super._seek(e), this.state === l.playing || this.state === l.paused) {
      this._element === void 0 && this._load();
      let t = (this._currentTime - this._startTime) * this.playbackRate + this._sourceOffset;
      this._element.currentTime = t, this._ready = !1;
    }
    (this._state === l.sequenced || this._state === l.ended) && this._element !== void 0 && this._unload();
  }
  _update(e, t = !0) {
    if (super._update(e, t), this._element !== void 0 && this._element.ended && (this._state = l.ended, this._triggerCallbacks("ended")), this._startTime - this._currentTime <= this._preloadTime && this._state !== l.waiting && this._state !== l.ended && this._load(), this._state === l.playing)
      return this._playbackRateUpdated && (this._element.playbackRate = this._globalPlaybackRate * this._playbackRate, this._playbackRateUpdated = !1), this._isElementPlaying || (this._element.play(), this._stretchPaused && this._element.pause(), this._isElementPlaying = !0), !0;
    if (this._state === l.paused)
      return this._element.pause(), this._isElementPlaying = !1, !0;
    if (this._state === l.ended && this._element !== void 0)
      return this._element.pause(), this._isElementPlaying && this._unload(), !1;
  }
  clearTimelineState() {
    super.clearTimelineState(), this._element !== void 0 && (this._element.pause(), this._isElementPlaying = !1), this._unload();
  }
  destroy() {
    this._element && this._element.pause(), super.destroy();
  }
}
const S = "VideoNode";
class F extends D {
  /**
   * Initialise an instance of a VideoNode.
   * This should not be called directly, but created through a call to videoContext.createVideoNode();
   */
  constructor() {
    super(...arguments), this._displayName = S, this._elementType = "video";
  }
}
const W = "CanvasNode";
class V extends C {
  /**
   * Initialise an instance of a CanvasNode.
   * This should not be called directly, but created through a call to videoContext.createCanvasNode();
   */
  constructor(e, t, i, n, s = 4) {
    super(e, t, i, n), this._preloadTime = s, this._displayName = W;
  }
  _load() {
    super._load(), this._ready = !0, this._triggerCallbacks("loaded");
  }
  _unload() {
    super._unload(), this._ready = !1;
  }
  _seek(e) {
    super._seek(e), (this.state === l.playing || this.state === l.paused) && (this._element === void 0 && this._load(), this._ready = !1), (this._state === l.sequenced || this._state === l.ended) && this._element !== void 0 && this._unload();
  }
  _update(e) {
    if (super._update(e), this._startTime - this._currentTime <= this._preloadTime && this._state !== l.waiting && this._state !== l.ended && this._load(), this._state === l.playing)
      return !0;
    if (this._state === l.paused)
      return !0;
    if (this._state === l.ended && this._element !== void 0)
      return this._unload(), !1;
  }
}
const X = "CanvasNode";
class Y extends C {
  /**
   * Initialise an instance of an ImageNode.
   * This should not be called directly, but created through a call to videoContext.createImageNode();
   */
  constructor(e, t, i, n, s = 4, o = {}) {
    super(e, t, i, n), this._preloadTime = s, this._attributes = o, this._textureUploaded = !1, this._displayName = X;
  }
  get elementURL() {
    return this._elementURL;
  }
  set elementURL(e) {
    this._elementURL = e, this._unload();
  }
  _load() {
    if (this._image !== void 0) {
      for (var e in this._attributes)
        this._image[e] = this._attributes[e];
      return;
    }
    if (this._isResponsibleForElementLifeCycle) {
      super._load(), this._image = new Image(), this._image.setAttribute("crossorigin", "anonymous"), this._image.onload = () => {
        this._ready = !0, this._element = this._image, this._triggerCallbacks("loaded");
      }, this._image.src = this._elementURL, this._image.onerror = () => {
        console.error("ImageNode failed to load. url:", this._elementURL);
      };
      for (let t in this._attributes)
        this._image[t] = this._attributes[t];
    }
    this._image.onerror = () => {
      console.debug("Error with element", this._image), this._state = l.error, this._ready = !0, this._triggerCallbacks("error");
    };
  }
  _unload() {
    super._unload(), this._isResponsibleForElementLifeCycle && (this._image !== void 0 && (this._image.src = "", this._image.onerror = void 0, this._image = void 0, delete this._image), this._element instanceof window.ImageBitmap && this._element.close()), this._ready = !1;
  }
  _seek(e) {
    super._seek(e), (this.state === l.playing || this.state === l.paused) && this._image === void 0 && this._load(), (this._state === l.sequenced || this._state === l.ended) && this._element !== void 0 && this._unload();
  }
  _update(e) {
    if (this._textureUploaded ? super._update(e, !1) : super._update(e), this._startTime - this._currentTime <= this._preloadTime && this._state !== l.waiting && this._state !== l.ended && this._load(), this._state === l.playing)
      return !0;
    if (this._state === l.paused)
      return !0;
    if (this._state === l.ended && this._image !== void 0)
      return this._unload(), !1;
  }
}
function I(r) {
  this.message = r, this.name = "ConnectionException";
}
function w(r) {
  this.message = r, this.name = "RenderException";
}
const mt = "ProcessingNode";
class P extends $ {
  /**
   * Initialise an instance of a ProcessingNode.
   *
   * This class is not used directly, but is extended to create CompositingNodes, TransitionNodes, and EffectNodes.
   */
  constructor(e, t, i, n, s) {
    super(e, t, n, s), this._vertexShader = U(e, i.vertexShader, e.VERTEX_SHADER), this._fragmentShader = U(e, i.fragmentShader, e.FRAGMENT_SHADER), this._definition = i, this._properties = {};
    for (let a in i.properties) {
      let d = i.properties[a].value;
      Object.prototype.toString.call(d) === "[object Array]" && (d = i.properties[a].value.slice());
      let p = i.properties[a].type;
      this._properties[a] = {
        type: p,
        value: d
      };
    }
    this._shaderInputsTextureUnitMapping = [], this._maxTextureUnits = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), this._boundTextureUnits = 0, this._texture = y(e), e.texImage2D(
      e.TEXTURE_2D,
      0,
      e.RGBA,
      e.canvas.width,
      e.canvas.height,
      0,
      e.RGBA,
      e.UNSIGNED_BYTE,
      null
    ), this._program = yt(e, this._vertexShader, this._fragmentShader), this._framebuffer = e.createFramebuffer(), e.bindFramebuffer(e.FRAMEBUFFER, this._framebuffer), e.framebufferTexture2D(
      e.FRAMEBUFFER,
      e.COLOR_ATTACHMENT0,
      e.TEXTURE_2D,
      this._texture,
      0
    ), e.bindFramebuffer(e.FRAMEBUFFER, null);
    for (let a in this._properties)
      Object.defineProperty(this, a, {
        get: function() {
          return this._properties[a].value;
        },
        set: function(d) {
          this._properties[a].value = d;
        }
      });
    for (let a in this._properties)
      if (this._properties[a].value instanceof Image && (this._properties[a].texture = y(e), this._properties[a].textureUnit = e.TEXTURE0 + this._boundTextureUnits, this._properties[a].textureUnitIndex = this._boundTextureUnits, this._boundTextureUnits += 1, this._boundTextureUnits > this._maxTextureUnits))
        throw new w(
          "Trying to bind more than available textures units to shader"
        );
    for (let a of i.inputs)
      if (this._shaderInputsTextureUnitMapping.push({
        name: a,
        textureUnit: e.TEXTURE0 + this._boundTextureUnits,
        textureUnitIndex: this._boundTextureUnits,
        location: e.getUniformLocation(this._program, a)
      }), this._boundTextureUnits += 1, this._boundTextureUnits > this._maxTextureUnits)
        throw new w(
          "Trying to bind more than available textures units to shader"
        );
    for (let a in this._properties)
      this._properties[a].type === "uniform" && (this._properties[a].location = this._gl.getUniformLocation(
        this._program,
        a
      ));
    this._currentTimeLocation = this._gl.getUniformLocation(this._program, "currentTime"), this._currentTime = 0;
    let o = e.getAttribLocation(this._program, "a_position"), _ = e.createBuffer();
    e.bindBuffer(e.ARRAY_BUFFER, _), e.enableVertexAttribArray(o), e.vertexAttribPointer(o, 2, e.FLOAT, !1, 0, 0), e.bufferData(
      e.ARRAY_BUFFER,
      new Float32Array([1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0]),
      e.STATIC_DRAW
    );
    let u = e.getAttribLocation(this._program, "a_texCoord");
    e.enableVertexAttribArray(u), e.vertexAttribPointer(u, 2, e.FLOAT, !1, 0, 0), this._displayName = mt;
  }
  /**
   * Sets the passed processing node property to the passed value.
   * @param {string} name - The name of the processing node parameter to modify.
   * @param {Object} value - The value to set it to.
   *
   * @example
   * var ctx = new VideoContext();
   * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
   * monoNode.setProperty("inputMix", [1.0,0.0,0.0]); //Just use red channel
   */
  setProperty(e, t) {
    this._properties[e].value = t;
  }
  /**
   * Sets the passed processing node property to the passed value.
   * @param {string} name - The name of the processing node parameter to get.
   *
   * @example
   * var ctx = new VideoContext();
   * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
   * console.log(monoNode.getProperty("inputMix")); //Will output [0.4,0.6,0.2], the default value from the effect definition.
   *
   */
  getProperty(e) {
    return this._properties[e].value;
  }
  /**
   * Destroy and clean-up the node.
   */
  destroy() {
    super.destroy();
    for (let e in this._properties)
      this._properties[e].value instanceof Image && (this._gl.deleteTexture(this._properties[e].texture), this._texture = void 0);
    this._gl.deleteTexture(this._texture), this._texture = void 0, this._gl.detachShader(this._program, this._vertexShader), this._gl.detachShader(this._program, this._fragmentShader), this._gl.deleteShader(this._vertexShader), this._gl.deleteShader(this._fragmentShader), this._gl.deleteProgram(this._program), this._gl.deleteFramebuffer(this._framebuffer);
  }
  _update(e) {
    this._currentTime = e;
  }
  _seek(e) {
    this._currentTime = e;
  }
  _render() {
    this._rendered = !0;
    let e = this._gl;
    e.viewport(0, 0, e.canvas.width, e.canvas.height), e.useProgram(this._program), e.uniform1f(this._currentTimeLocation, parseFloat(this._currentTime));
    for (let t in this._properties) {
      let i = this._properties[t].value, n = this._properties[t].type, s = this._properties[t].location;
      if (n === "uniform")
        if (typeof i == "number")
          e.uniform1f(s, i);
        else if (Object.prototype.toString.call(i) === "[object Array]")
          i.length === 1 ? e.uniform1fv(s, i) : i.length === 2 ? e.uniform2fv(s, i) : i.length === 3 ? e.uniform3fv(s, i) : i.length === 4 ? e.uniform4fv(s, i) : console.debug(
            "Shader parameter",
            t,
            "is too long an array:",
            i
          );
        else if (i instanceof Image) {
          let o = this._properties[t].texture, _ = this._properties[t].textureUnit, u = this._properties[t].textureUnit;
          Ct(e, o, i), e.activeTexture(_), e.uniform1i(s, u), e.bindTexture(e.TEXTURE_2D, o);
        } else
          e.uniformMatrix3fv(s, !1, i);
    }
  }
}
const ft = `precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    gl_FragColor = texture2D(u_image, v_texCoord);
}
`, vt = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`, H = "DestinationNode";
class gt extends P {
  /**
   * Initialise an instance of a DestinationNode.
   *
   * There should only be a single instance of a DestinationNode per VideoContext instance. An VideoContext's destination can be accessed like so: videoContext.desitnation.
   *
   * You should not instantiate this directly.
   */
  constructor(e, t) {
    let i = {
      fragmentShader: ft,
      vertexShader: vt,
      properties: {},
      inputs: ["u_image"]
    };
    super(e, t, i, i.inputs, !1), this._displayName = H;
  }
  _render() {
    let e = this._gl;
    e.bindFramebuffer(e.FRAMEBUFFER, null), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA), e.enable(e.BLEND), e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT), this.inputs.forEach((t) => {
      super._render();
      var i = t._texture;
      for (let n of this._shaderInputsTextureUnitMapping)
        e.activeTexture(n.textureUnit), e.uniform1i(n.location, n.textureUnitIndex), e.bindTexture(e.TEXTURE_2D, i);
      e.drawArrays(e.TRIANGLES, 0, 6);
    });
  }
}
const xt = "EffectNode";
class z extends P {
  /**
   * Initialise an instance of an EffectNode. You should not instantiate this directly, but use VideoContest.createEffectNode().
   */
  constructor(e, t, i) {
    let n = y(e);
    e.texImage2D(
      e.TEXTURE_2D,
      0,
      e.RGBA,
      1,
      1,
      0,
      e.RGBA,
      e.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    ), super(e, t, i, i.inputs, !0), this._placeholderTexture = n, this._displayName = xt;
  }
  _render() {
    let e = this._gl;
    e.bindFramebuffer(e.FRAMEBUFFER, this._framebuffer), e.framebufferTexture2D(
      e.FRAMEBUFFER,
      e.COLOR_ATTACHMENT0,
      e.TEXTURE_2D,
      this._texture,
      0
    ), e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT), e.blendFunc(e.ONE, e.ZERO), super._render();
    let t = this._renderGraph.getInputsForNode(this);
    for (var i = 0; i < this._shaderInputsTextureUnitMapping.length; i++) {
      let n = this._placeholderTexture, s = this._shaderInputsTextureUnitMapping[i].textureUnit;
      i < t.length && t[i] !== void 0 && (n = t[i]._texture), e.activeTexture(s), e.uniform1i(
        this._shaderInputsTextureUnitMapping[i].location,
        this._shaderInputsTextureUnitMapping[i].textureUnitIndex
      ), e.bindTexture(e.TEXTURE_2D, n);
    }
    e.drawArrays(e.TRIANGLES, 0, 6), e.bindFramebuffer(e.FRAMEBUFFER, null);
  }
}
const k = "TransitionNode";
class bt extends z {
  /**
   * Initialise an instance of a TransitionNode. You should not instantiate this directly, but use VideoContest.createTransitonNode().
   */
  constructor(e, t, i) {
    super(e, t, i), this._transitions = {}, this._initialPropertyValues = {};
    for (let n in this._properties)
      this._initialPropertyValues[n] = this._properties[n].value;
    this._displayName = k;
  }
  _doesTransitionFitOnTimeline(e) {
    if (this._transitions[e.property] === void 0)
      return !0;
    for (let t of this._transitions[e.property])
      if (e.start > t.start && e.start < t.end || e.end > t.start && e.end < t.end || t.start > e.start && t.start < e.end || t.end > e.start && t.end < e.end)
        return !1;
    return !0;
  }
  _insertTransitionInTimeline(e) {
    this._transitions[e.property] === void 0 && (this._transitions[e.property] = []), this._transitions[e.property].push(e), this._transitions[e.property].sort(function(t, i) {
      return t.start - i.start;
    });
  }
  /**
   * Create a transition on the timeline.
   *
   * @param {number} startTime - The time at which the transition should start (relative to currentTime of video context).
   * @param {number} endTime - The time at which the transition should be completed by (relative to currentTime of video context).
   * @param {number} currentValue - The value to start the transition at.
   * @param {number} targetValue - The value to transition to by endTime.
   * @param {String} propertyName - The name of the property to clear transitions on, if undefined default to "mix".
   *
   * @return {Boolean} returns True if a transition is successfully added, false otherwise.
   */
  transition(e, t, i, n, s = "mix") {
    let o = {
      start: e + this._currentTime,
      end: t + this._currentTime,
      current: i,
      target: n,
      property: s
    };
    return this._doesTransitionFitOnTimeline(o) ? (this._insertTransitionInTimeline(o), !0) : !1;
  }
  /**
   * Create a transition on the timeline at an absolute time.
   *
   * @param {number} startTime - The time at which the transition should start (relative to time 0).
   * @param {number} endTime - The time at which the transition should be completed by (relative to time 0).
   * @param {number} currentValue - The value to start the transition at.
   * @param {number} targetValue - The value to transition to by endTime.
   * @param {String} propertyName - The name of the property to clear transitions on, if undefined default to "mix".
   *
   * @return {Boolean} returns True if a transition is successfully added, false otherwise.
   */
  transitionAt(e, t, i, n, s = "mix") {
    let o = {
      start: e,
      end: t,
      current: i,
      target: n,
      property: s
    };
    return this._doesTransitionFitOnTimeline(o) ? (this._insertTransitionInTimeline(o), !0) : !1;
  }
  /**
   * Clear all transistions on the passed property. If no property is defined clear all transitions on the node.
   *
   * @param {String} propertyName - The name of the property to clear transitions on, if undefined clear all transitions on the node.
   */
  clearTransitions(e) {
    e === void 0 ? this._transitions = {} : this._transitions[e] = [];
  }
  /**
   * Clear a transistion on the passed property that the specified time lies within.
   *
   * @param {String} propertyName - The name of the property to clear a transition on.
   * @param {number} time - A time which lies within the property you're trying to clear.
   *
   * @return {Boolean} returns True if a transition is removed, false otherwise.
   */
  clearTransition(e, t) {
    let i;
    for (var n = 0; n < this._transitions[e].length; n++) {
      let s = this._transitions[e][n];
      t > s.start && t < s.end && (i = n);
    }
    return i !== void 0 ? (this._transitions[e].splice(i, 1), !0) : !1;
  }
  _update(e) {
    super._update(e);
    for (let i in this._transitions) {
      let n = this[i];
      this._transitions[i].length > 0 && (n = this._transitions[i][0].current);
      let s = !1;
      for (var t = 0; t < this._transitions[i].length; t++) {
        let o = this._transitions[i][t];
        if (e > o.end) {
          n = o.target;
          continue;
        }
        if (e > o.start && e < o.end) {
          let _ = o.target - o.current, u = (this._currentTime - o.start) / (o.end - o.start);
          s = !0, this[i] = o.current + _ * u;
          break;
        }
      }
      s || (this[i] = n);
    }
  }
}
const j = "CompositingNode";
class Tt extends P {
  /**
   * Initialise an instance of a Compositing Node. You should not instantiate this directly, but use VideoContest.createCompositingNode().
   */
  constructor(e, t, i) {
    let n = y(e);
    e.texImage2D(
      e.TEXTURE_2D,
      0,
      e.RGBA,
      1,
      1,
      0,
      e.RGBA,
      e.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    ), super(e, t, i, i.inputs, !1), this._placeholderTexture = n, this._displayName = j;
  }
  _render() {
    let e = this._gl;
    e.bindFramebuffer(e.FRAMEBUFFER, this._framebuffer), e.framebufferTexture2D(
      e.FRAMEBUFFER,
      e.COLOR_ATTACHMENT0,
      e.TEXTURE_2D,
      this._texture,
      0
    ), e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT), e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA), this.inputs.forEach((t) => {
      if (t !== void 0) {
        super._render();
        var i = t._texture;
        for (let n of this._shaderInputsTextureUnitMapping)
          e.activeTexture(n.textureUnit), e.uniform1i(n.location, n.textureUnitIndex), e.bindTexture(e.TEXTURE_2D, i);
        e.drawArrays(e.TRIANGLES, 0, 6);
      }
    }), e.bindFramebuffer(e.FRAMEBUFFER, null);
  }
}
function U(r, e, t) {
  let i = r.createShader(t);
  if (r.shaderSource(i, e), r.compileShader(i), !r.getShaderParameter(i, r.COMPILE_STATUS))
    throw "could not compile shader:" + r.getShaderInfoLog(i);
  return i;
}
function yt(r, e, t) {
  let i = r.createProgram();
  if (r.attachShader(i, e), r.attachShader(i, t), r.linkProgram(i), !r.getProgramParameter(i, r.LINK_STATUS))
    throw {
      error: 4,
      msg: "Can't link shader program for track",
      toString: function() {
        return this.msg;
      }
    };
  return i;
}
function y(r) {
  let e = r.createTexture();
  return r.bindTexture(r.TEXTURE_2D, e), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, !0), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.NEAREST), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.NEAREST), e;
}
function Ct(r, e, t) {
  t.readyState !== void 0 && t.readyState === 0 || (r.bindTexture(r.TEXTURE_2D, e), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, !0), r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, t), e._isTextureCleared = !1);
}
function O(r, e) {
  e._isTextureCleared || (r.bindTexture(r.TEXTURE_2D, e), r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, !0), r.texImage2D(
    r.TEXTURE_2D,
    0,
    r.RGBA,
    1,
    1,
    0,
    r.RGBA,
    r.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0])
  ), e._isTextureCleared = !0);
}
function Et() {
  const r = [
    "adorable",
    "alert",
    "average",
    "beautiful",
    "blonde",
    "bloody",
    "blushing",
    "bright",
    "clean",
    "clear",
    "cloudy",
    "colourful",
    "concerned",
    "crowded",
    "curious",
    "cute",
    "dark",
    "dirty",
    "drab",
    "distinct",
    "dull",
    "elegant",
    "fancy",
    "filthy",
    "glamorous",
    "gleaming",
    "graceful",
    "grotesque",
    "homely",
    "light",
    "misty",
    "motionless",
    "muddy",
    "plain",
    "poised",
    "quaint",
    "scary",
    "shiny",
    "smoggy",
    "sparkling",
    "spotless",
    "stormy",
    "strange",
    "ugly",
    "unsightly",
    "unusual"
  ], e = [
    "alive",
    "brainy",
    "broken",
    "busy",
    "careful",
    "cautious",
    "clever",
    "crazy",
    "damaged",
    "dead",
    "difficult",
    "easy",
    "fake",
    "false",
    "famous",
    "forward",
    "fragile",
    "guilty",
    "helpful",
    "helpless",
    "important",
    "impossible",
    "infamous",
    "innocent",
    "inquisitive",
    "mad",
    "modern",
    "open",
    "outgoing",
    "outstanding",
    "poor",
    "powerful",
    "puzzled",
    "real",
    "rich",
    "right",
    "robust",
    "sane",
    "scary",
    "shy",
    "sleepy",
    "stupid",
    "super",
    "tame",
    "thick",
    "tired",
    "wild",
    "wrong"
  ], t = [
    "manatee",
    "gila monster",
    "nematode",
    "seahorse",
    "slug",
    "koala bear",
    "giant tortoise",
    "garden snail",
    "starfish",
    "sloth",
    "american woodcock",
    "coral",
    "swallowtail butterfly",
    "house sparrow",
    "sea anemone"
  ];
  function i(o) {
    return o[Math.floor(Math.random() * o.length)];
  }
  function n(o) {
    return o = o.replace(/\b\w/g, (_) => _.toUpperCase()), o;
  }
  let s = i(r) + " " + i(e) + " " + i(t);
  return s = n(s), s = s.replace(/ /g, "-"), s;
}
function At(r) {
  return console.warn(
    "VideoContext.exportToJSON has been deprecated. Please use VideoContext.snapshot instead."
  ), JSON.stringify(q(r));
}
function St(r) {
  return {
    nodes: q(r),
    videoContext: Nt(r)
  };
}
function Nt(r) {
  return {
    currentTime: r.currentTime,
    duration: r.duration,
    state: r.state,
    playbackRate: r.playbackRate
  };
}
let L = !1;
function q(r) {
  function e(s) {
    var o = document.createElement("a");
    return o.href = s, o.href;
  }
  function t(s, o) {
    let _ = [];
    for (let u of s.inputs) {
      if (u === void 0)
        continue;
      let a, d = s.inputs.indexOf(u), p = o._processingNodes.indexOf(u);
      if (p > -1)
        a = "processor" + p;
      else {
        let h = o._sourceNodes.indexOf(u);
        h > -1 ? a = "source" + h : console.log("Warning, can't find input", u);
      }
      _.push({ id: a, index: d });
    }
    return _;
  }
  let i = {}, n = [];
  for (let s in l)
    n[l[s]] = s;
  for (let s in r._sourceNodes) {
    let o = r._sourceNodes[s], _ = "source" + s, u = "";
    o._isResponsibleForElementLifeCycle ? u = e(o._elementURL) : (L || (console.debug(
      "Warning - Trying to export source created from an element not a URL. URL of export will be set to the elements src attribute and may be incorrect",
      o
    ), L = !0), u = o.element.src);
    let a = {
      type: o.displayName,
      url: u,
      start: o.startTime,
      stop: o.stopTime,
      state: n[o.state]
    };
    a.type === S && (a.currentTime = null, o.element && o.element.currentTime && (a.currentTime = o.element.currentTime)), o._sourceOffset && (a.sourceOffset = o._sourceOffset), i[_] = a;
  }
  for (let s in r._processingNodes) {
    let o = r._processingNodes[s], _ = "processor" + s, u = {
      type: o.displayName,
      definition: o._definition,
      inputs: t(o, r),
      properties: {}
    };
    for (let a in u.definition.properties)
      u.properties[a] = o[a];
    u.type === k && (u.transitions = o._transitions), i[_] = u;
  }
  return i.destination = {
    type: "Destination",
    inputs: t(r.destination, r)
  }, i;
}
function Ft(r, e) {
  let t = document.createElement("div");
  if (e !== void 0) {
    var i = document.createElement("h2");
    i.innerHTML = e, t.appendChild(i);
  }
  for (let s in r._properties) {
    let o = document.createElement("p"), _ = document.createElement("h3");
    _.innerHTML = s, o.appendChild(_);
    let u = r._properties[s].value;
    if (typeof u == "number") {
      let a = document.createElement("input");
      a.setAttribute("type", "range"), a.setAttribute("min", "0"), a.setAttribute("max", "1"), a.setAttribute("step", "0.01"), a.setAttribute("value", u, toString());
      let d = document.createElement("input");
      d.setAttribute("type", "number"), d.setAttribute("min", "0"), d.setAttribute("max", "1"), d.setAttribute("step", "0.01"), d.setAttribute("value", u, toString());
      let p = !1;
      a.onmousedown = function() {
        p = !0;
      }, a.onmouseup = function() {
        p = !1;
      }, a.onmousemove = function() {
        p && (r[s] = parseFloat(a.value), d.value = a.value);
      }, a.onchange = function() {
        r[s] = parseFloat(a.value), d.value = a.value;
      }, d.onchange = function() {
        r[s] = parseFloat(d.value), a.value = d.value;
      }, o.appendChild(a), o.appendChild(d);
    } else if (Object.prototype.toString.call(u) === "[object Array]")
      for (var n = 0; n < u.length; n++) {
        let a = document.createElement("input");
        a.setAttribute("type", "range"), a.setAttribute("min", "0"), a.setAttribute("max", "1"), a.setAttribute("step", "0.01"), a.setAttribute("value", u[n], toString());
        let d = document.createElement("input");
        d.setAttribute("type", "number"), d.setAttribute("min", "0"), d.setAttribute("max", "1"), d.setAttribute("step", "0.01"), d.setAttribute("value", u, toString());
        let p = n, h = !1;
        a.onmousedown = function() {
          h = !0;
        }, a.onmouseup = function() {
          h = !1;
        }, a.onmousemove = function() {
          h && (r[s][p] = parseFloat(a.value), d.value = a.value);
        }, a.onchange = function() {
          r[s][p] = parseFloat(a.value), d.value = a.value;
        }, d.onchange = function() {
          r[s][p] = parseFloat(d.value), a.value = d.value;
        }, o.appendChild(a), o.appendChild(d);
      }
    t.appendChild(o);
  }
  return t;
}
function Rt(r) {
  let e = r.destination, t = /* @__PURE__ */ new Map();
  t.set(e, 0);
  function i(n, s = 0) {
    for (let o of n.inputs) {
      let _ = s + 1;
      t.has(o) ? _ > t.get(o) && t.set(o, _) : t.set(o, _), i(o, t.get(o));
    }
  }
  return i(e), t;
}
function Dt(r, e) {
  let t = e.getContext("2d"), i = e.width, n = e.height;
  t.clearRect(0, 0, i, n);
  let s = Rt(r), o = s.values();
  o = Array.from(o).sort(function(h, m) {
    return m - h;
  });
  let _ = o[0], u = i / (_ + 1), a = n / r._sourceNodes.length / 3, d = a * 1.618;
  function p(h, m, f, v) {
    let g = m.get(h);
    m.values();
    let x = 0;
    for (let b of m) {
      if (b[0] === h)
        break;
      b[1] === g && (x += 1);
    }
    return {
      x: f * m.get(h),
      y: v * 1.5 * x + 50
    };
  }
  for (let h = 0; h < r._renderGraph.connections.length; h++) {
    let m = r._renderGraph.connections[h], f = p(m.source, s, u, a), v = p(m.destination, s, u, a);
    if (f !== void 0 && v !== void 0) {
      t.beginPath();
      let g = f.x + d / 2, x = f.y + a / 2, b = v.x + d / 2, T = v.y + a / 2, J = b - g, Q = T - x, E = Math.PI / 2 - Math.atan2(J, Q), N = Math.sqrt(Math.pow(g - b, 2) + Math.pow(x - T, 2)), ee = Math.min(g, b) + (Math.max(g, b) - Math.min(g, b)) / 2, te = Math.min(x, T) + (Math.max(x, T) - Math.min(x, T)) / 2, ie = Math.cos(E + Math.PI / 2) * N / 1.5 + ee, re = Math.sin(E + Math.PI / 2) * N / 1.5 + te;
      t.arc(ie, re, N / 1.2, E - Math.PI + 0.95, E - 0.95), t.stroke();
    }
  }
  for (let h of s.keys()) {
    let m = p(h, s, u, a), f = "#AA9639", v = "";
    h.displayName === j && (f = "#000000"), h.displayName === H && (f = "#7D9F35", v = "Output"), h.displayName === S && (f = "#572A72", v = "Video"), h.displayName === W && (f = "#572A72", v = "Canvas"), h.displayName === X && (f = "#572A72", v = "Image"), t.beginPath(), t.fillStyle = f, t.fillRect(m.x, m.y, d, a), t.fill(), t.fillStyle = "#000", t.textAlign = "center", t.font = "10px Arial", t.fillText(v, m.x + d / 2, m.y + a / 2 + 2.5), t.fill();
  }
}
function Pt(r) {
  function e(i) {
    return r._sourceNodes.indexOf(i) !== -1 ? "source " + i.displayName + " " + r._sourceNodes.indexOf(i) : "processor " + i.displayName + " " + r._processingNodes.indexOf(i);
  }
  let t = {
    nodes: [
      {
        id: e(r.destination),
        label: "Destination Node",
        x: 2.5,
        y: 0.5,
        size: 2,
        node: r.destination
      }
    ],
    edges: []
  };
  for (let i = 0; i < r._sourceNodes.length; i++) {
    let n = r._sourceNodes[i], s = i * (1 / r._sourceNodes.length);
    t.nodes.push({
      id: e(n),
      label: "Source " + i.toString(),
      x: 0,
      y: s,
      size: 2,
      color: "#572A72",
      node: n
    });
  }
  for (let i = 0; i < r._processingNodes.length; i++) {
    let n = r._processingNodes[i];
    t.nodes.push({
      id: e(n),
      x: Math.random() * 2.5,
      y: Math.random(),
      size: 2,
      node: n
    });
  }
  for (let i = 0; i < r._renderGraph.connections.length; i++) {
    let n = r._renderGraph.connections[i];
    t.edges.push({
      id: "e" + i.toString(),
      source: e(n.source),
      target: e(n.destination)
    });
  }
  return t;
}
function kt(r, e) {
  let t = r.compositor(B.COMBINE);
  for (let i of e) {
    let n;
    if (i.type === "video")
      n = r.video(i.src, i.sourceStart);
    else if (i.type === "image")
      n = r.image(i.src, i.sourceStart);
    else {
      console.debug(`Clip type ${i.type} not recognised, skipping.`);
      continue;
    }
    n.startAt(i.start), n.stopAt(i.start + i.duration), n.connect(t);
  }
  return t;
}
function It(r, e, t) {
  let i = e.getContext("2d"), n = e.width, s = e.height, o = s / r._sourceNodes.length, _ = r.duration;
  if (t > _ && !r.endOnLastSourceEnd && (_ = t), r.duration === 1 / 0) {
    let d = 0;
    for (let p = 0; p < r._sourceNodes.length; p++) {
      let h = r._sourceNodes[p];
      h._stopTime !== 1 / 0 && (d += h._stopTime);
    }
    d > r.currentTime ? _ = d + 5 : _ = r.currentTime + 5;
  }
  let u = n / _, a = {
    video: ["#572A72", "#3C1255"],
    image: ["#7D9F35", "#577714"],
    canvas: ["#AA9639", "#806D15"]
  };
  i.clearRect(0, 0, n, s), i.fillStyle = "#999";
  for (let d of r._processingNodes)
    if (d.displayName === k)
      for (let p in d._transitions)
        for (let h of d._transitions[p]) {
          let m = (h.end - h.start) * u, f = s, v = h.start * u, g = 0;
          i.fillStyle = "rgba(0,0,0, 0.3)", i.fillRect(v, g, m, f), i.fill();
        }
  for (let d = 0; d < r._sourceNodes.length; d++) {
    let p = r._sourceNodes[d], h = p._stopTime - p._startTime;
    h === 1 / 0 && (h = r.currentTime);
    let m = p._startTime, f = h * u, v = o, g = m * u, x = o * d;
    i.fillStyle = a.video[d % a.video.length], i.fillRect(g, x, f, v), i.fill();
  }
  t !== void 0 && (i.fillStyle = "#000", i.fillRect(t * u, 0, 1, s));
}
class wt {
  constructor() {
    this._updateables = [], this._useWebworker = !1, this._active = !1, this._previousRAFTime = void 0, this._previousWorkerTime = void 0, this._webWorkerString = "            var running = false;            function tick(){                postMessage(Date.now());                if (running){                    setTimeout(tick, 1000/20);                }            }            self.addEventListener('message',function(msg){                var data = msg.data;                if (data === 'start'){                    running = true;                    tick();                }                if (data === 'stop') running = false;            });", this._webWorker = void 0;
  }
  _initWebWorker() {
    window.URL = window.URL || window.webkitURL;
    let e = new Blob([this._webWorkerString], {
      type: "application/javascript"
    });
    this._webWorker = new Worker(URL.createObjectURL(e)), this._webWorker.onmessage = (t) => {
      let i = t.data;
      this._updateWorkerTime(i);
    };
  }
  _lostVisibility() {
    this._previousWorkerTime = Date.now(), this._useWebworker = !0, this._webWorker || this._initWebWorker(), this._webWorker.postMessage("start");
  }
  _gainedVisibility() {
    this._useWebworker = !1, this._previousRAFTime = void 0, this._webWorker && this._webWorker.postMessage("stop"), requestAnimationFrame(this._updateRAFTime.bind(this));
  }
  _init() {
    if (window.Worker) {
      if (typeof document.hidden > "u") {
        window.addEventListener("focus", this._gainedVisibility.bind(this)), window.addEventListener("blur", this._lostVisibility.bind(this));
        return;
      }
      document.addEventListener(
        "visibilitychange",
        () => {
          document.hidden === !0 ? this._lostVisibility() : this._gainedVisibility();
        },
        !1
      ), requestAnimationFrame(this._updateRAFTime.bind(this));
    }
  }
  _updateWorkerTime(e) {
    let t = (e - this._previousWorkerTime) / 1e3;
    t !== 0 && this._update(t), this._previousWorkerTime = e;
  }
  _updateRAFTime(e) {
    this._previousRAFTime === void 0 && (this._previousRAFTime = e);
    let t = (e - this._previousRAFTime) / 1e3;
    t !== 0 && this._update(t), this._previousRAFTime = e, this._useWebworker || requestAnimationFrame(this._updateRAFTime.bind(this));
  }
  _update(e) {
    for (let t = 0; t < this._updateables.length; t++)
      this._updateables[t]._update(parseFloat(e));
  }
  register(e) {
    this._updateables.push(e), this._active === !1 && (this._active = !0, this._init());
  }
}
function M({ src: r, srcObject: e }) {
  return !((r === "" || r === void 0) && e == null);
}
const Ut = "AudioNode";
class R extends D {
  /**
   * Initialise an instance of an AudioNode.
   * This should not be called directly, but created through a call to videoContext.audio();
   */
  constructor() {
    super(...arguments), this._displayName = Ut, this._elementType = "audio";
  }
  _update(e) {
    super._update(e, !1);
  }
}
const Ot = "CanvasNode";
class K extends C {
  constructor(e, t, i, n, s = 4, o = {}) {
    super(e, t, i, n), this._preloadTime = s, this._attributes = o, this._textureUploaded = !1, this._displayName = Ot;
  }
  get elementURL() {
    return this._elementURL;
  }
  _load() {
    if (this._text !== void 0) {
      for (let e in this._attributes)
        this._text[e] = this._attributes[e];
      return;
    }
    if (this._isResponsibleForElementLifeCycle) {
      super._load(), this._text = document.createElement("canvas");
      const e = this._text.getContext("2d");
      e.fillStyle = this._attributes.color, e.font = this._attributes.font, e.fillText(this._elementURL, this._attributes.left, this._attributes.top), this._ready = !0, this._element = this._text, this._triggerCallbacks("loaded");
      for (let t in this._attributes)
        this._text[t] = this._attributes[t];
    }
  }
  _unload() {
    super._unload(), this._isResponsibleForElementLifeCycle && this._text !== void 0 && delete this._text, this._ready = !1;
  }
  _seek(e) {
    super._seek(e), (this.state === l.playing || this.state === l.paused) && this._text === void 0 && this._load(), (this._state === l.sequenced || this._state === l.ended) && this._element !== void 0 && this._unload();
  }
  _update(e) {
    if (this._textureUploaded ? super._update(e, !1) : super._update(e), this._startTime - this._currentTime <= this._preloadTime && this._state !== l.waiting && this._state !== l.ended && this._load(), this._state === l.playing)
      return !0;
    if (this._state === l.paused)
      return !0;
    if (this._state === l.ended && this._text !== void 0)
      return this._unload(), !1;
  }
}
const Lt = {
  AudioNode: R,
  CanvasNode: V,
  ImageNode: Y,
  MediaNode: D,
  SourceNode: C,
  VideoNode: F,
  TextNode: K
};
class A {
  /**
   * Manages the rendering graph.
   */
  constructor() {
    this.connections = [];
  }
  /**
   * Get a list of nodes which are connected to the output of the passed node.
   *
   * @param {GraphNode} node - the node to get the outputs for.
   * @return {GraphNode[]} An array of the nodes which are connected to the output.
   */
  getOutputsForNode(e) {
    let t = [];
    return this.connections.forEach(function(i) {
      i.source === e && t.push(i.destination);
    }), t;
  }
  /**
   * Get a list of nodes which are connected, by input name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"name", "name":inputName, "destination":destinationNode}.
   *
   * @param {GraphNode} node - the node to get the named inputs for.
   * @return {Object[]} An array of objects representing the nodes and connection type, which are connected to the named inputs for the node.
   */
  getNamedInputsForNode(e) {
    let t = [];
    return this.connections.forEach(function(i) {
      i.destination === e && i.type === "name" && t.push(i);
    }), t;
  }
  /**
   * Get a list of nodes which are connected, by z-index name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"zIndex", "zIndex":0, "destination":destinationNode}.
   *
   * @param {GraphNode} node - the node to get the z-index refernced inputs for.
   * @return {Object[]} An array of objects representing the nodes and connection type, which are connected by z-Index for the node.
   */
  getZIndexInputsForNode(e) {
    let t = [];
    return this.connections.forEach(function(i) {
      i.destination === e && i.type === "zIndex" && t.push(i);
    }), t.sort(function(i, n) {
      return i.zIndex - n.zIndex;
    }), t;
  }
  /**
   * Get a list of nodes which are connected as inputs to the given node. The length of the return array is always equal to the number of inputs for the node, with undefined taking the place of any inputs not connected.
   *
   * @param {GraphNode} node - the node to get the inputs for.
   * @return {GraphNode[]} An array of GraphNodes which are connected to the node.
   */
  getInputsForNode(e) {
    let t = e.inputNames, i = [], n = this.getNamedInputsForNode(e), s = this.getZIndexInputsForNode(e);
    if (e._limitConnections === !0) {
      for (let _ = 0; _ < t.length; _++)
        i[_] = void 0;
      for (let _ of n) {
        let u = t.indexOf(_.name);
        i[u] = _.source;
      }
      let o = 0;
      for (let _ = 0; _ < i.length; _++)
        i[_] === void 0 && s[o] !== void 0 && (i[_] = s[o].source, o += 1);
    } else {
      for (let o of n)
        i.push(o.source);
      for (let o of s)
        i.push(o.source);
    }
    return i;
  }
  /**
   * Check if a named input on a node is available to connect too.
   * @param {GraphNode} node - the node to check.
   * @param {String} inputName - the named input to check.
   */
  isInputAvailable(e, t) {
    if (e._inputNames.indexOf(t) === -1)
      return !1;
    for (let i of this.connections)
      if (i.type === "name" && i.destination === e && i.name === t)
        return !1;
    return !0;
  }
  /**
   * Register a connection between two nodes.
   *
   * @param {GraphNode} sourceNode - the node to connect from.
   * @param {GraphNode} destinationNode - the node to connect to.
   * @param {(String | number)} [target] - the target port of the conenction, this could be a string to specfiy a specific named port, a number to specify a port by index, or undefined, in which case the next available port will be connected to.
   * @return {boolean} Will return true if connection succeeds otherwise will throw a ConnectException.
   */
  registerConnection(e, t, i) {
    if (t.inputs.length >= t.inputNames.length && t._limitConnections === !0)
      throw new I("Node has reached max number of inputs, can't connect");
    if (t._limitConnections === !1 && this.getInputsForNode(t).includes(e) && (console.debug(
      "WARNING - node connected mutliple times, removing previous connection"
    ), this.unregisterConnection(e, t)), typeof i == "number")
      this.connections.push({
        source: e,
        type: "zIndex",
        zIndex: i,
        destination: t
      });
    else if (typeof i == "string" && t._limitConnections)
      if (this.isInputAvailable(t, i))
        this.connections.push({
          source: e,
          type: "name",
          name: i,
          destination: t
        });
      else
        throw new I("Port " + i + " is already connected to");
    else {
      let n = this.getZIndexInputsForNode(t), s = 0;
      n.length > 0 && (s = n[n.length - 1].zIndex + 1), this.connections.push({
        source: e,
        type: "zIndex",
        zIndex: s,
        destination: t
      });
    }
    return !0;
  }
  /**
   * Remove a connection between two nodes.
   * @param {GraphNode} sourceNode - the node to unregsiter connection from.
   * @param {GraphNode} destinationNode - the node to register connection to.
   * @return {boolean} Will return true if removing connection succeeds, or false if there was no connectionsction to remove.
   */
  unregisterConnection(e, t) {
    let i = [];
    return this.connections.forEach(function(n) {
      n.source === e && n.destination === t && i.push(n);
    }), i.length === 0 ? !1 : (i.forEach((n) => {
      let s = this.connections.indexOf(n);
      this.connections.splice(s, 1);
    }), !0);
  }
  static outputEdgesFor(e, t) {
    let i = [];
    for (let n of t)
      n.source === e && i.push(n);
    return i;
  }
  static inputEdgesFor(e, t) {
    let i = [];
    for (let n of t)
      n.destination === e && i.push(n);
    return i;
  }
  static getInputlessNodes(e) {
    let t = [];
    for (let i of e)
      t.push(i.source);
    for (let i of e) {
      let n = t.indexOf(i.destination);
      n !== -1 && t.splice(n, 1);
    }
    return t;
  }
}
class G {
  constructor(e = null) {
    this._element = this._createElement(), this._node = e;
  }
  _createElement() {
    let e = document.createElement("video");
    return e.setAttribute("crossorigin", "anonymous"), e.setAttribute("webkit-playsinline", ""), e.setAttribute("playsinline", ""), e;
  }
  get element() {
    return this._element;
  }
  set element(e) {
    this._element = e;
  }
  linkNode(e) {
    this._node = e;
  }
  unlinkNode() {
    this._node = null;
  }
  isPlaying() {
    return this._node && this._node._state === l.playing;
  }
}
class Mt {
  constructor(e = 3) {
    this._cacheItems = [], this._cacheItemsInitialised = !1;
    for (let t = 0; t < e; t++)
      this._cacheItems.push(new G());
  }
  init() {
    if (!this._cacheItemsInitialised)
      for (let e of this._cacheItems)
        try {
          e.element.play().then(
            () => {
              e.isPlaying() || e.element.pause();
            },
            (t) => {
              if (t.name !== "NotSupportedError")
                throw t;
            }
          );
        } catch {
        }
    this._cacheItemsInitialised = !0;
  }
  /**
   * Find and return an empty initialised element or, if the cache is
   * empty, create a new one.
   *
   * @param {Object} mediaNode A `MediaNode` instance
   */
  getElementAndLinkToNode(e) {
    for (let i of this._cacheItems)
      if (!M(i.element))
        return i.linkNode(e), i.element;
    console.debug(
      "No available video element in the cache, creating a new one. This may break mobile, make your initial cache larger."
    );
    let t = new G(e);
    return this._cacheItems.push(t), this._cacheItemsInitialised = !1, t.element;
  }
  /**
   * Unlink any media node currently linked to a cached video element.
   *
   * @param {VideoElement} element The element to unlink from any media nodes
   */
  unlinkNodeFromElement(e) {
    for (let t of this._cacheItems)
      e === t._element && t.unlinkNode();
  }
  get length() {
    return this._cacheItems.length;
  }
  get unused() {
    let e = 0;
    for (let t of this._cacheItems)
      M(t.element) || (e += 1);
    return e;
  }
}
let Z = new wt();
class c {
  /**
   * Initialise the VideoContext and render to the specific canvas. A 2nd parameter can be passed to the constructor which is a function that get's called if the VideoContext fails to initialise.
   *
   * @param {Canvas} canvas - the canvas element to render the output to.
   * @param {function} [initErrorCallback] - a callback for if initialising the canvas failed.
   * @param {Object} [options] - a number of custom options which can be set on the VideoContext, generally best left as default.
   * @param {boolean} [options.manualUpdate=false] - Make Video Context not use the updatable manager
   * @param {boolean} [options.endOnLastSourceEnd=true] - Trigger an `ended` event when the current time goes above the duration of the composition
   * @param {boolean} [options.useVideoElementCache=true] - Creates a pool of video element that will be all initialised at the same time. Important for mobile support
   * @param {number} [options.videoElementCacheSize=6] - Number of video element in the pool
   * @param {object} [options.webglContextAttributes] - A set of attributes used when getting the GL context. Alpha will always be `true`.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement, () => console.error("Sorry, your browser dosen\'t support WebGL"));
   * var videoNode = ctx.video("video.mp4");
   * videoNode.connect(ctx.destination);
   * videoNode.start(0);
   * videoNode.stop(10);
   * ctx.play();
   *
   */
  constructor(e, t, {
    manualUpdate: i = !1,
    endOnLastSourceEnd: n = !0,
    useVideoElementCache: s = !0,
    videoElementCacheSize: o = 6,
    webglContextAttributes: _ = {}
  } = {}) {
    if (this._canvas = e, this._endOnLastSourceEnd = n, this._gl = e.getContext(
      "experimental-webgl",
      Object.assign(
        { preserveDrawingBuffer: !0 },
        // can be overriden
        _,
        { alpha: !1 }
        // Can't be overriden because it is copied last
      )
    ), this._gl === null) {
      console.error("Failed to intialise WebGL."), t && t();
      return;
    }
    this._useVideoElementCache = s, this._useVideoElementCache && (this._videoElementCache = new Mt(o)), this._canvas.id && (typeof this._canvas.id == "string" || this._canvas.id instanceof String) && (this._id = e.id), this._id === void 0 && (this._id = Et()), window.__VIDEOCONTEXT_REFS__ === void 0 && (window.__VIDEOCONTEXT_REFS__ = {}), window.__VIDEOCONTEXT_REFS__[this._id] = this, this._renderGraph = new A(), this._sourceNodes = [], this._processingNodes = [], this._timeline = [], this._currentTime = 0, this._state = c.STATE.PAUSED, this._playbackRate = 1, this._volume = 1, this._sourcesPlaying = void 0, this._destinationNode = new gt(this._gl, this._renderGraph), this._callbacks = /* @__PURE__ */ new Map(), Object.keys(c.EVENTS).forEach(
      (u) => this._callbacks.set(c.EVENTS[u], [])
    ), this._timelineCallbacks = [], i || Z.register(this);
  }
  /**
   * Returns an ID assigned to the VideoContext instance. This will either be the same id as the underlying canvas element,
   * or a uniquely generated one.
   */
  get id() {
    return this._id;
  }
  /**
   * Set the ID of the VideoContext instance. This should be unique.
   */
  set id(e) {
    delete window.__VIDEOCONTEXT_REFS__[this._id], window.__VIDEOCONTEXT_REFS__[e] !== void 0 && console.warn("Warning; setting id to that of an existing VideoContext instance."), window.__VIDEOCONTEXT_REFS__[e] = this, this._id = e;
  }
  /**
   * Register a callback to happen at a specific point in time.
   * @param {number} time - the time at which to trigger the callback.
   * @param {Function} func - the callback to register.
   * @param {number} ordering - the order in which to call the callback if more than one is registered for the same time.
   */
  registerTimelineCallback(e, t, i = 0) {
    this._timelineCallbacks.push({
      time: e,
      func: t,
      ordering: i
    });
  }
  /**
   * Unregister a callback which happens at a specific point in time.
   * @param {Function} func - the callback to unregister.
   */
  unregisterTimelineCallback(e) {
    let t = [];
    for (let i of this._timelineCallbacks)
      i.func === e && t.push(i);
    for (let i of t) {
      let n = this._timelineCallbacks.indexOf(i);
      this._timelineCallbacks.splice(n, 1);
    }
  }
  /**
   * Register a callback to listen to one of the events defined in `VideoContext.EVENTS`
   *
   * @param {String} type - the event to register against.
   * @param {Function} func - the callback to register.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * ctx.registerCallback(VideoContext.EVENTS.STALLED, () => console.log("Playback stalled"));
   * ctx.registerCallback(VideoContext.EVENTS.UPDATE, () => console.log("new frame"));
   * ctx.registerCallback(VideoContext.EVENTS.ENDED, () => console.log("Playback ended"));
   */
  registerCallback(e, t) {
    if (!this._callbacks.has(e))
      return !1;
    this._callbacks.get(e).push(t);
  }
  /**
   * Remove a previously registered callback
   *
   * @param {Function} func - the callback to remove.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   *
   * //the callback
   * var updateCallback = () => console.log("new frame");
   *
   * //register the callback
   * ctx.registerCallback(VideoContext.EVENTS.UPDATE, updateCallback);
   * //then unregister it
   * ctx.unregisterCallback(updateCallback);
   *
   */
  unregisterCallback(e) {
    for (let t of this._callbacks.values()) {
      let i = t.indexOf(e);
      if (i !== -1)
        return t.splice(i, 1), !0;
    }
    return !1;
  }
  _callCallbacks(e) {
    let t = this._callbacks.get(e);
    for (let i of t)
      i(this._currentTime);
  }
  /**
   * Get the canvas that the VideoContext is using.
   *
   * @return {HTMLCanvasElement} The canvas that the VideoContext is using.
   *
   */
  get element() {
    return this._canvas;
  }
  /**
   * Get the current state.
   * @return {STATE} The number representing the state.
   *
   */
  get state() {
    return this._state;
  }
  /**
   * Set the progress through the internal timeline.
   * Setting this can be used as a way to implement a scrubbable timeline.
   *
   * @param {number} currentTime - this is the currentTime to set in seconds.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var videoNode = ctx.video("video.mp4");
   * videoNode.connect(ctx.destination);
   * videoNode.start(0);
   * videoNode.stop(20);
   * ctx.currentTime = 10; // seek 10 seconds in
   * ctx.play();
   *
   */
  set currentTime(e) {
    e < this.duration && this._state === c.STATE.ENDED && (this._state = c.STATE.PAUSED), (typeof e == "string" || e instanceof String) && (e = parseFloat(e));
    for (let t = 0; t < this._sourceNodes.length; t++)
      this._sourceNodes[t]._seek(e);
    for (let t = 0; t < this._processingNodes.length; t++)
      this._processingNodes[t]._seek(e);
    this._currentTime = e;
  }
  /**
   * Get how far through the internal timeline has been played.
   *
   * Getting this value will give the current playhead position. Can be used for updating timelines.
   * @return {number} The time in seconds through the current playlist.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var videoNode = ctx.video("video.mp4");
   * videoNode.connect(ctx.destination);
   * videoNode.start(0);
   * videoNode.stop(10);
   * ctx.play();
   * setTimeout(() => console.log(ctx.currentTime),1000); //should print roughly 1.0
   *
   */
  get currentTime() {
    return this._currentTime;
  }
  /**
   * Get the time at which the last node in the current internal timeline finishes playing.
   *
   * @return {number} The end time in seconds of the last video node to finish playing.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * console.log(ctx.duration); //prints 0
   *
   * var videoNode = ctx.video("video.mp4");
   * videoNode.connect(ctx.destination);
   * videoNode.start(0);
   * videoNode.stop(10);
   *
   * console.log(ctx.duration); //prints 10
   *
   * ctx.play();
   */
  get duration() {
    let e = 0;
    for (let t = 0; t < this._sourceNodes.length; t++)
      this._sourceNodes[t].state !== l.waiting && this._sourceNodes[t]._stopTime > e && (e = this._sourceNodes[t]._stopTime);
    return e;
  }
  /**
   * Get the final node in the render graph which represents the canvas to display content on to.
   *
   * This proprety is read-only and there can only ever be one destination node. Other nodes can connect to this but you cannot connect this node to anything.
   *
   * @return {DestinationNode} A graph node representing the canvas to display the content on.
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var videoNode = ctx.video("video.mp4");
   * videoNode.start(0);
   * videoNode.stop(10);
   * videoNode.connect(ctx.destination);
   *
   */
  get destination() {
    return this._destinationNode;
  }
  /**
   * Set the playback rate of the VideoContext instance.
   * This will alter the playback speed of all media elements played through the VideoContext.
   *
   * @param {number} rate - this is the playback rate.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var videoNode = ctx.video("video.mp4");
   * videoNode.start(0);
   * videoNode.stop(10);
   * videoNode.connect(ctx.destination);
   * ctx.playbackRate = 2;
   * ctx.play(); // Double playback rate means this will finish playing in 5 seconds.
   */
  set playbackRate(e) {
    if (e <= 0)
      throw new RangeError("playbackRate must be greater than 0");
    for (let t of this._sourceNodes)
      t.constructor.name === S && (t._globalPlaybackRate = e, t._playbackRateUpdated = !0);
    this._playbackRate = e;
  }
  /**
   *  Return the current playbackRate of the video context.
   * @return {number} A value representing the playbackRate. 1.0 by default.
   */
  get playbackRate() {
    return this._playbackRate;
  }
  /**
   * Set the volume of all MediaNode created in the VideoContext.
   * @param {number} volume - the volume to apply to the video nodes.
   */
  set volume(e) {
    for (let t of this._sourceNodes)
      if (t instanceof F || t instanceof D) {
        if (t.muted || t.fadeIn)
          continue;
        e ? t.volume = t.sound : t.volume = e;
      }
    this._volume = e;
  }
  /**
   * Return the current volume of the video context.
   * @return {number} A value representing the volume. 1.0 by default.
   */
  get volume() {
    return this._volume;
  }
  /**
   * Start the VideoContext playing
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var videoNode = ctx.video("video.mp4");
   * videoNode.connect(ctx.destination);
   * videoNode.start(0);
   * videoNode.stop(10);
   * ctx.play();
   */
  play() {
    return console.debug("VideoContext - playing"), this._videoElementCache && this._videoElementCache.init(), this._state = c.STATE.PLAYING, !0;
  }
  /**
   * Pause playback of the VideoContext
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var videoNode = ctx.video("video.mp4");
   * videoNode.connect(ctx.destination);
   * videoNode.start(0);
   * videoNode.stop(20);
   * ctx.currentTime = 10; // seek 10 seconds in
   * ctx.play();
   * setTimeout(() => ctx.pause(), 1000); //pause playback after roughly one second.
   */
  pause() {
    return console.debug("VideoContext - pausing"), this._state = c.STATE.PAUSED, !0;
  }
  /**
   * Create a new node representing a video source
   *
   * @param {string|HTMLVideoElement|MediaStream} - The URL or video element to create the video from.
   * @param {number} [sourceOffset=0] - Offset into the start of the source video to start playing from.
   * @param {number} [preloadTime=4] - How many seconds before the video is to be played to start loading it.
   * @param {Object} [videoElementAttributes] - A dictionary of attributes to map onto the underlying video element.
   * @return {VideoNode} A new video node.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var videoNode = ctx.video("bigbuckbunny.mp4");
   */
  video(e, t = 0, i = 4, n = {}) {
    let s = new F(
      e,
      this._gl,
      this._renderGraph,
      this._currentTime,
      this._playbackRate,
      t,
      i,
      this._videoElementCache,
      n
    );
    return this._sourceNodes.push(s), s;
  }
  /**
   * Create a new node representing an audio source
   * @param {string|HTMLAudioElement|MediaStream} src - The url or audio element to create the audio node from.
   * @param {number} [sourceOffset=0] - Offset into the start of the source audio to start playing from.
   * @param {number} [preloadTime=4] - How long before a node is to be displayed to attmept to load it.
   * @param {Object} [imageElementAttributes] - Any attributes to be given to the underlying image element.
   * @return {AudioNode} A new audio node.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var audioNode = ctx.audio("ziggystardust.mp3");
   */
  audio(e, t = 0, i = 4, n = {}) {
    let s = new R(
      e,
      this._gl,
      this._renderGraph,
      this._currentTime,
      this._playbackRate,
      t,
      i,
      this._audioElementCache,
      n
    );
    return this._sourceNodes.push(s), s;
  }
  /**
   * @deprecated
   */
  createVideoSourceNode(e, t = 0, i = 4, n = {}) {
    return this._deprecate(
      "Warning: createVideoSourceNode will be deprecated in v1.0, please switch to using VideoContext.video()"
    ), this.video(e, t, i, n);
  }
  /**
   * Create a new node representing an image source
   * @param {string|Image|ImageBitmap} src - The url or image element to create the image node from.
   * @param {number} [preloadTime=4] - How long before a node is to be displayed to attmept to load it.
   * @param {Object} [imageElementAttributes] - Any attributes to be given to the underlying image element.
   * @return {ImageNode} A new image node.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var imageNode = ctx.image("image.png");
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var imageElement = document.getElementById("image");
   * var ctx = new VideoContext(canvasElement);
   * var imageNode = ctx.image(imageElement);
   */
  image(e, t = 4, i = {}) {
    let n = new Y(
      e,
      this._gl,
      this._renderGraph,
      this._currentTime,
      t,
      i
    );
    return this._sourceNodes.push(n), n;
  }
  /**
   * Create a new node representing an image source
   * @param {string|Image|ImageBitmap} src - The url or image element to create the image node from.
   * @param {number} [preloadTime=4] - How long before a node is to be displayed to attmept to load it.
   * @param {Object} [textElementAttributes] - Any attributes to be given to the underlying image element.
   * @return {ImageNode} A new image node.
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   * var imageNode = ctx.image("image.png");
   *
   * @example
   * var canvasElement = document.getElementById("canvas");
   * var imageElement = document.getElementById("image");
   * var ctx = new VideoContext(canvasElement);
   * var imageNode = ctx.image(imageElement);
   */
  text(e, t = 4, i = {}) {
    let n = new K(
      e,
      this._gl,
      this._renderGraph,
      this._currentTime,
      t,
      i
    );
    return this._sourceNodes.push(n), n;
  }
  /**
   * @deprecated
   */
  createImageSourceNode(e, t = 0, i = 4, n = {}) {
    return this._deprecate(
      "Warning: createImageSourceNode will be deprecated in v1.0, please switch to using VideoContext.image()"
    ), this.image(e, t, i, n);
  }
  /**
   * Create a new node representing a canvas source
   * @param {Canvas} src - The canvas element to create the canvas node from.
   * @return {CanvasNode} A new canvas node.
   */
  canvas(e) {
    let t = new V(e, this._gl, this._renderGraph, this._currentTime);
    return this._sourceNodes.push(t), t;
  }
  /**
   * @deprecated
   */
  createCanvasSourceNode(e, t = 0, i = 4) {
    return this._deprecate(
      "Warning: createCanvasSourceNode will be deprecated in v1.0, please switch to using VideoContext.canvas()"
    ), this.canvas(e, t, i);
  }
  /**
   * Create a new effect node.
   * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the compositing node to create. Builtin definitions can be found by accessing VideoContext.DEFINITIONS.
   * @return {EffectNode} A new effect node created from the passed definition
   */
  effect(e) {
    let t = new z(this._gl, this._renderGraph, e);
    return this._processingNodes.push(t), t;
  }
  /**
   * @deprecated
   */
  createEffectNode(e) {
    return this._deprecate(
      "Warning: createEffectNode will be deprecated in v1.0, please switch to using VideoContext.effect()"
    ), this.effect(e);
  }
  /**
   * Create a new compositiing node.
   *
   * Compositing nodes are used for operations such as combining multiple video sources into a single track/connection for further processing in the graph.
   *
   * A compositing node is slightly different to other processing nodes in that it only has one input in it's definition but can have unlimited connections made to it.
   * The shader in the definition is run for each input in turn, drawing them to the output buffer. This means there can be no interaction between the spearte inputs to a compositing node, as they are individually processed in seperate shader passes.
   *
   * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the compositing node to create. Builtin definitions can be found by accessing VideoContext.DEFINITIONS
   *
   * @return {CompositingNode} A new compositing node created from the passed definition.
   *
   * @example
   *
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   *
   * //A simple compositing node definition which just renders all the inputs to the output buffer.
   * var combineDefinition = {
   *     vertexShader : "\
   *         attribute vec2 a_position;\
   *         attribute vec2 a_texCoord;\
   *         varying vec2 v_texCoord;\
   *         void main() {\
   *             gl_Position = vec4(vec2(2.0,2.0)*vec2(1.0, 1.0), 0.0, 1.0);\
   *             v_texCoord = a_texCoord;\
   *         }",
   *     fragmentShader : "\
   *         precision mediump float;\
   *         uniform sampler2D u_image;\
   *         uniform float a;\
   *         varying vec2 v_texCoord;\
   *         varying float v_progress;\
   *         void main(){\
   *             vec4 color = texture2D(u_image, v_texCoord);\
   *             gl_FragColor = color;\
   *         }",
   *     properties:{
   *         "a":{type:"uniform", value:0.0},
   *     },
   *     inputs:["u_image"]
   * };
   * //Create the node, passing in the definition.
   * var trackNode = videoCtx.compositor(combineDefinition);
   *
   * //create two videos which will play at back to back
   * var videoNode1 = ctx.video("video1.mp4");
   * videoNode1.play(0);
   * videoNode1.stop(10);
   * var videoNode2 = ctx.video("video2.mp4");
   * videoNode2.play(10);
   * videoNode2.stop(20);
   *
   * //Connect the nodes to the combine node. This will give a single connection representing the two videos which can
   * //be connected to other effects such as LUTs, chromakeyers, etc.
   * videoNode1.connect(trackNode);
   * videoNode2.connect(trackNode);
   *
   * //Don't do anything exciting, just connect it to the output.
   * trackNode.connect(ctx.destination);
   *
   */
  compositor(e) {
    let t = new Tt(this._gl, this._renderGraph, e);
    return this._processingNodes.push(t), t;
  }
  /**
   * Instanciate a custom built source node
   * @param {SourceNode} CustomSourceNode
   * @param {Object} src
   * @param  {...any} options
   */
  customSourceNode(e, t, ...i) {
    const n = new e(
      t,
      this._gl,
      this._renderGraph,
      this._currentTime,
      ...i
    );
    return this._sourceNodes.push(n), n;
  }
  /**
   * @depricated
   */
  createCompositingNode(e) {
    return this._deprecate(
      "Warning: createCompositingNode will be deprecated in v1.0, please switch to using VideoContext.compositor()"
    ), this.compositor(e);
  }
  /**
   * Create a new transition node.
   *
   * Transistion nodes are a type of effect node which have parameters which can be changed as events on the timeline.
   *
   * For example a transition node which cross-fades between two videos could have a "mix" property which sets the
   * progress through the transistion. Rather than having to write your own code to adjust this property at specfic
   * points in time a transition node has a "transition" function which takes a startTime, stopTime, targetValue, and a
   * propertyName (which will be "mix"). This will linearly interpolate the property from the curernt value to
   * tragetValue between the startTime and stopTime.
   *
   * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the transition node to create.
   * @return {TransitionNode} A new transition node created from the passed definition.
   * @example
   *
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement);
   *
   * //A simple cross-fade node definition which cross-fades between two videos based on the mix property.
   * var crossfadeDefinition = {
   *     vertexShader : "\
   *        attribute vec2 a_position;\
   *        attribute vec2 a_texCoord;\
   *        varying vec2 v_texCoord;\
   *        void main() {\
   *            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
   *            v_texCoord = a_texCoord;\
   *         }",
   *     fragmentShader : "\
   *         precision mediump float;\
   *         uniform sampler2D u_image_a;\
   *         uniform sampler2D u_image_b;\
   *         uniform float mix;\
   *         varying vec2 v_texCoord;\
   *         varying float v_mix;\
   *         void main(){\
   *             vec4 color_a = texture2D(u_image_a, v_texCoord);\
   *             vec4 color_b = texture2D(u_image_b, v_texCoord);\
   *             color_a[0] *= mix;\
   *             color_a[1] *= mix;\
   *             color_a[2] *= mix;\
   *             color_a[3] *= mix;\
   *             color_b[0] *= (1.0 - mix);\
   *             color_b[1] *= (1.0 - mix);\
   *             color_b[2] *= (1.0 - mix);\
   *             color_b[3] *= (1.0 - mix);\
   *             gl_FragColor = color_a + color_b;\
   *         }",
   *     properties:{
   *         "mix":{type:"uniform", value:0.0},
   *     },
   *     inputs:["u_image_a","u_image_b"]
   * };
   *
   * //Create the node, passing in the definition.
   * var transitionNode = videoCtx.transition(crossfadeDefinition);
   *
   * //create two videos which will overlap by two seconds
   * var videoNode1 = ctx.video("video1.mp4");
   * videoNode1.play(0);
   * videoNode1.stop(10);
   * var videoNode2 = ctx.video("video2.mp4");
   * videoNode2.play(8);
   * videoNode2.stop(18);
   *
   * //Connect the nodes to the transistion node.
   * videoNode1.connect(transitionNode);
   * videoNode2.connect(transitionNode);
   *
   * //Set-up a transition which happens at the crossover point of the playback of the two videos
   * transitionNode.transition(8,10,1.0,"mix");
   *
   * //Connect the transition node to the output
   * transitionNode.connect(ctx.destination);
   *
   * //start playback
   * ctx.play();
   */
  transition(e) {
    let t = new bt(this._gl, this._renderGraph, e);
    return this._processingNodes.push(t), t;
  }
  /**
   * @deprecated
   */
  createTransitionNode(e) {
    return this._deprecate(
      "Warning: createTransitionNode will be deprecated in v1.0, please switch to using VideoContext.transition()"
    ), this.transition(e);
  }
  _isStalled() {
    for (let e = 0; e < this._sourceNodes.length; e++)
      ;
    return !1;
  }
  /**
   * This allows manual calling of the update loop of the videoContext.
   *
   * @param {Number} dt - The difference in seconds between this and the previous calling of update.
   * @example
   *
   * var canvasElement = document.getElementById("canvas");
   * var ctx = new VideoContext(canvasElement, undefined, {"manualUpdate" : true});
   *
   * var previousTime;
   * function update(time){
   *     if (previousTime === undefined) previousTime = time;
   *     var dt = (time - previousTime)/1000;
   *     ctx.update(dt);
   *     previousTime = time;
   *     requestAnimationFrame(update);
   * }
   * update();
   *
   */
  update(e) {
    this._update(e);
  }
  _update(e) {
    if (this._sourceNodes = this._sourceNodes.filter((t) => {
      if (!t.destroyed)
        return t;
    }), this._processingNodes = this._processingNodes.filter((t) => {
      if (!t.destroyed)
        return t;
    }), this._state === c.STATE.PLAYING || this._state === c.STATE.STALLED || this._state === c.STATE.PAUSED) {
      if (this._callCallbacks(c.EVENTS.UPDATE), this._state !== c.STATE.PAUSED && (this._isStalled() ? (this._callCallbacks(c.EVENTS.STALLED), this._state = c.STATE.STALLED) : this._state = c.STATE.PLAYING), this._state === c.STATE.PLAYING) {
        let o = /* @__PURE__ */ new Map();
        for (let u of this._timelineCallbacks)
          u.time >= this.currentTime && u.time < this._currentTime + e * this._playbackRate && (o.has(u.time) || o.set(u.time, []), o.get(u.time).push(u));
        let _ = Array.from(o.keys());
        _.sort(function(u, a) {
          return u - a;
        });
        for (let u of _) {
          let a = o.get(u);
          a.sort(function(d, p) {
            return d.ordering - p.ordering;
          });
          for (let d of a)
            d.func();
        }
        if (this._currentTime += e * this._playbackRate, this._currentTime > this.duration && this._endOnLastSourceEnd) {
          for (let u = 0; u < this._sourceNodes.length; u++)
            this._sourceNodes[u]._update(this._currentTime);
          this._state = c.STATE.ENDED, this._callCallbacks(c.EVENTS.ENDED);
        }
      }
      let t = !1;
      for (let o = 0; o < this._sourceNodes.length; o++) {
        let _ = this._sourceNodes[o];
        this._state, c.STATE.STALLED, this._state === c.STATE.PAUSED && _._pause(), this._state === c.STATE.PLAYING && _._play(), _._update(this._currentTime), (_._state === l.paused || _._state === l.playing) && (t = !0);
      }
      t !== this._sourcesPlaying && this._state === c.STATE.PLAYING && (t === !0 ? this._callCallbacks(c.EVENTS.CONTENT) : this._callCallbacks(c.EVENTS.NOCONTENT), this._sourcesPlaying = t);
      let i = [], n = this._renderGraph.connections.slice(), s = A.getInputlessNodes(n);
      for (; s.length > 0; ) {
        let o = s.pop();
        i.push(o);
        for (let _ of A.outputEdgesFor(o, n)) {
          let u = n.indexOf(_);
          u > -1 && n.splice(u, 1), A.inputEdgesFor(_.destination, n).length === 0 && s.push(_.destination);
        }
      }
      for (let o of i)
        this._sourceNodes.indexOf(o) === -1 && (o._update(this._currentTime), o._render());
    }
  }
  /**
   * Destroy all nodes in the graph and reset the timeline. After calling this any created nodes will be unusable.
   */
  reset() {
    for (let e of this._callbacks)
      this.unregisterCallback(e);
    for (let e of this._sourceNodes)
      e.destroy();
    for (let e of this._processingNodes)
      e.destroy();
    this._update(0), this._sourceNodes = [], this._processingNodes = [], this._timeline = [], this._currentTime = 0, this._state = c.STATE.PAUSED, this._playbackRate = 1, this._sourcesPlaying = void 0, Object.keys(c.EVENTS).forEach(
      (e) => this._callbacks.set(c.EVENTS[e], [])
    ), this._timelineCallbacks = [];
  }
  _deprecate(e) {
    console.log(e);
  }
  static get DEFINITIONS() {
    return B;
  }
  static get NODES() {
    return Lt;
  }
  /**
   * Get a JS Object containing the state of the VideoContext instance and all the created nodes.
   */
  snapshot() {
    return St(this);
  }
}
const Gt = Object.freeze({
  PLAYING: 0,
  PAUSED: 1,
  STALLED: 2,
  ENDED: 3,
  BROKEN: 4
});
c.STATE = Gt;
const Bt = Object.freeze({
  UPDATE: "update",
  STALLED: "stalled",
  ENDED: "ended",
  CONTENT: "content",
  NOCONTENT: "nocontent"
});
c.EVENTS = Bt;
c.visualiseVideoContextTimeline = It;
c.visualiseVideoContextGraph = Dt;
c.createControlFormForNode = Ft;
c.createSigmaGraphDataFromRenderGraph = Pt;
c.exportToJSON = At;
c.updateablesManager = Z;
c.importSimpleEDL = kt;
export {
  c as default
};
