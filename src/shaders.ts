const alpha = /* glsl */ `
  uniform float uFade;

  void main() {
    _main();

    gl_FragColor.a *= uFade;
    if (!gl_FrontFacing && uFade < 1.0) discard;
  }
`;

const dither = /* glsl */ `
  uniform float uFade;
  
  float dither(vec2 pos) {
    ivec2 p = ivec2(mod(pos, 8.0));
    int x = p.x;
    int y = p.y;
    int xo = x ^ y;
    int v = ((xo & 1) << 5)
          | ((x  & 1) << 4)
          | ((xo & 2) << 2)
          | ((x  & 2) << 1)
          | ((xo & 4) >> 1)
          | ((x  & 4) >> 2);
    return float(v) / 64.0;
  }

  void main() {
    _main();

    float ditherThreshold = dither(gl_FragCoord.xy);
    if (uFade < ditherThreshold) discard;
  }
`;

const noise = /* glsl */ `
  uniform float uFade;

  float hash(vec2 p) {
    return fract(tan(distance(p * 1.61803398874989484820459, p) * 1.61803398874989484820459) * p.x);
  }

  void main() {
    _main();
    
    float n = hash(floor(gl_FragCoord.xy));
    if (uFade < n) discard;
  }
`;

const dissolve = /* glsl */ `
  uniform float uFade;

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1,0), vec2(127.1, 311.7))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0,1), vec2(127.1, 311.7))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1,1), vec2(127.1, 311.7))) * 43758.5453);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    _main();
    
    float n = noise(gl_FragCoord.xy * 0.05);
    float edge = 0.05;
    
    float alpha = uFade * (1.0 + edge * 2.0) - edge;
    
    if (alpha < n - edge) discard;
    if (alpha < n + edge) {
      float t = 1.0 - (alpha - (n - edge)) / (2.0 * edge);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 1.2, t);
    }
  }
`;

export const fadeShaders = {
  alpha,
  dither,
  noise,
  dissolve,
} as const;
