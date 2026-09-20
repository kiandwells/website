import * as THREE from "three";
import gsap from "gsap";
import { BaseScene } from "./Scene";

// Shared simplex noise + fbm
const NOISE_GLSL = `
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289v4(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute4(vec4 x) { return mod289v4(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt4(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise3(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289v3(i);
  vec4 p = permute4(permute4(permute4(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x  = x_ * ns.x + ns.yyyy;
  vec4 y  = y_ * ns.x + ns.yyyy;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0+1.0;
  vec4 s1 = floor(b1)*2.0+1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt4(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p) {
  float v=0.0; float a=0.5;
  for(int i=0;i<5;i++){ v+=a*snoise3(p); p*=2.02; a*=0.5; }
  return v;
}
`;

const TERRAIN_VERT = `
${NOISE_GLSL}

uniform float u_time;
uniform float u_appear;

varying float v_height;
varying float v_fog;

void main() {
  vec3 pos = position;

  // Two-octave terrain: broad hills + fine ripple
  float h = fbm(vec3(pos.x * 0.22, 0.0, pos.z * 0.22 + u_time * 0.055)) * 2.8
          + fbm(vec3(pos.x * 0.55, 0.0, pos.z * 0.55 - u_time * 0.03))  * 0.6;

  pos.y += h * u_appear;
  v_height = h;

  // Distance-based fog factor
  float dist = length(pos.xz) / 18.0;
  v_fog = clamp(dist * dist, 0.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Wireframe layer — teal lines
const TERRAIN_WIRE_FRAG = `
uniform float u_appear;

varying float v_height;
varying float v_fog;

void main() {
  float nH  = clamp(v_height * 0.28 + 0.45, 0.0, 1.0);
  vec3 valCol   = vec3(0.055, 0.60, 0.49);   // teal valley
  vec3 ridgeCol = vec3(0.91,  0.96, 0.94);   // near-white ridge
  vec3 col = mix(valCol, ridgeCol, nH);
  float alpha = mix(0.55, 0.0, v_fog) * u_appear;
  gl_FragColor = vec4(col, alpha);
}
`;

// Solid fill layer — very subtle depth plane
const TERRAIN_FILL_FRAG = `
uniform float u_appear;

varying float v_height;
varying float v_fog;

void main() {
  float nH  = clamp(v_height * 0.28 + 0.45, 0.0, 1.0);
  vec3 col  = mix(vec3(0.04,0.42,0.34), vec3(0.88,0.95,0.92), nH);
  float alpha = mix(0.10, 0.0, v_fog) * u_appear;
  gl_FragColor = vec4(col, alpha);
}
`;

export class MoreProjectsScene extends BaseScene {
  private terrainGeo: THREE.PlaneGeometry;
  private wireMat: THREE.ShaderMaterial;
  private fillMat: THREE.ShaderMaterial;
  private wireMesh: THREE.Mesh;
  private fillMesh: THREE.Mesh;
  private terrainGroup = new THREE.Group();
  private mousePos = new THREE.Vector2();

  constructor() {
    super();

    this.camera.position.set(0, 6, 18);
    this.camera.lookAt(0, 0, 0);
    this.camera.fov = 45;
    this.camera.updateProjectionMatrix();

    this.terrainGeo = new THREE.PlaneGeometry(28, 28, 120, 120);
    // Rotate plane flat — x faces forward
    this.terrainGeo.rotateX(-Math.PI / 2);

    const uniformsShared = () => ({
      u_time:   { value: 0 },
      u_appear: { value: 0 },
    });

    this.wireMat = new THREE.ShaderMaterial({
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_WIRE_FRAG,
      transparent: true,
      wireframe: true,
      depthWrite: false,
      uniforms: uniformsShared(),
    });

    this.fillMat = new THREE.ShaderMaterial({
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FILL_FRAG,
      transparent: true,
      wireframe: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: uniformsShared(),
    });

    this.wireMesh = new THREE.Mesh(this.terrainGeo, this.wireMat);
    this.fillMesh = new THREE.Mesh(this.terrainGeo, this.fillMat);

    // Slight Y gap so wireframe sits above fill and reads cleanly
    this.wireMesh.position.y = 0.02;

    this.terrainGroup.add(this.fillMesh);
    this.terrainGroup.add(this.wireMesh);
    this.scene.add(this.terrainGroup);

    window.addEventListener("mousemove", this.onMouseMove);
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mousePos.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 - 1,
    );
  };

  private setAppear(v: number) {
    this.wireMat.uniforms.u_appear.value = v;
    this.fillMat.uniforms.u_appear.value = v;
  }

  handleSceneStart(): void {
    gsap.killTweensOf(this.wireMat.uniforms.u_appear);
    gsap.killTweensOf(this.fillMat.uniforms.u_appear);
    this.setAppear(0);
    gsap.to(this.wireMat.uniforms.u_appear, { value: 1, duration: 1.8, ease: "power3.out" });
    gsap.to(this.fillMat.uniforms.u_appear, { value: 1, duration: 1.8, ease: "power3.out" });
  }

  handleSceneEnd(cb: () => void): void {
    gsap.killTweensOf(this.wireMat.uniforms.u_appear);
    gsap.killTweensOf(this.fillMat.uniforms.u_appear);
    gsap.to(this.wireMat.uniforms.u_appear, { value: 0, duration: 0.8, ease: "power2.in" });
    gsap.to(this.fillMat.uniforms.u_appear, { value: 0, duration: 0.8, ease: "power2.in" });
    setTimeout(cb, 850);
  }

  update(time: number): void {
    this.wireMat.uniforms.u_time.value = time;
    this.fillMat.uniforms.u_time.value = time;

    // Slow idle Y-rotation + subtle mouse-driven Z tilt
    this.terrainGroup.rotation.y = time * 0.018;
    this.terrainGroup.rotation.z +=
      (this.mousePos.x * 0.06 - this.terrainGroup.rotation.z) * 0.03;
  }

  dispose(): void {
    window.removeEventListener("mousemove", this.onMouseMove);
    gsap.killTweensOf(this.wireMat.uniforms.u_appear);
    gsap.killTweensOf(this.fillMat.uniforms.u_appear);
    this.terrainGeo.dispose();
    this.wireMat.dispose();
    this.fillMat.dispose();
  }
}
