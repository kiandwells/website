import * as THREE from "three";
import gsap from "gsap";
import { BaseScene } from "./Scene";

const PARTICLE_COUNT = 3200;

const PARTICLE_VERT = `
attribute float a_size;
attribute float a_phase;

uniform float u_time;
uniform float u_appear;

varying float v_alpha;

void main() {
  // Gentle per-particle drift using phase offset
  vec3 pos = position;
  pos.x += sin(u_time * 0.38 + a_phase * 2.1) * 0.18;
  pos.y += cos(u_time * 0.31 + a_phase * 1.7) * 0.15;
  pos.z += sin(u_time * 0.27 + a_phase * 2.5) * 0.12;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  float dist = length(mvPos.xyz);

  // Depth-based alpha fade
  v_alpha = u_appear * smoothstep(18.0, 4.0, dist) * (0.45 + 0.55 * sin(a_phase * 6.28 + u_time * 0.5));

  gl_PointSize = a_size * (280.0 / -mvPos.z);
  gl_Position  = projectionMatrix * mvPos;
}
`;

const PARTICLE_FRAG = `
uniform vec3 u_colA;
uniform vec3 u_colB;
uniform vec3 u_colC;

varying float v_alpha;

void main() {
  // Soft circular point
  vec2 uv = gl_PointCoord - 0.5;
  float r  = length(uv) * 2.0;
  float mask = 1.0 - smoothstep(0.7, 1.0, r);

  // Subtle per-point colour variation based on position in disc
  float t  = gl_PointCoord.x * 0.5 + gl_PointCoord.y * 0.5;
  vec3 col = mix(u_colA, u_colB, t);
  col      = mix(col, u_colC, smoothstep(0.5, 1.0, r));

  gl_FragColor = vec4(col, mask * v_alpha);
}
`;

function buildParticleSystem(): THREE.Points {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const phases    = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Distribute in an elongated ellipsoid — wide and deep, not just a sphere
    const theta  = Math.random() * Math.PI * 2;
    const phi    = Math.acos(2 * Math.random() - 1);
    const r      = 3.0 + Math.random() * 4.5;

    positions[i * 3]     = r * 1.6 * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * 1.0 * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * 1.2 * Math.cos(phi);

    // Mix of tiny and medium points for depth
    sizes[i]  = 0.6 + Math.random() * 1.8;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("a_size",   new THREE.Float32BufferAttribute(sizes, 1));
  geo.setAttribute("a_phase",  new THREE.Float32BufferAttribute(phases, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader:   PARTICLE_VERT,
    fragmentShader: PARTICLE_FRAG,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
    uniforms: {
      u_time:   { value: 0 },
      u_appear: { value: 0 },
      u_colA:   { value: new THREE.Color(0x0e9a7e) },  // teal
      u_colB:   { value: new THREE.Color(0xc5e8e0) },  // light mint
      u_colC:   { value: new THREE.Color(0xc66c80) },  // pink accent
    },
  });

  return new THREE.Points(geo, mat);
}

export class AboutScene extends BaseScene {
  private particles: THREE.Points;
  private cloud = new THREE.Group();
  private mousePos = new THREE.Vector2();

  constructor() {
    super();

    this.particles = buildParticleSystem();
    this.cloud.add(this.particles);
    this.scene.add(this.cloud);

    // Camera pulled back enough to see the full cloud
    this.camera.position.set(0, 0, 16);
    this.camera.lookAt(0, 0, 0);
    this.camera.fov = 42;
    this.camera.updateProjectionMatrix();

    window.addEventListener("mousemove", this.onMouseMove);
  }

  private get mat(): THREE.ShaderMaterial {
    return this.particles.material as THREE.ShaderMaterial;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mousePos.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    this.mousePos.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  handleSceneStart(): void {
    gsap.killTweensOf(this.mat.uniforms.u_appear);
    gsap.fromTo(this.mat.uniforms.u_appear, { value: 0 }, {
      value: 1,
      duration: 2.8,
      ease: "power2.out",
    });
  }

  handleSceneEnd(cb: () => void): void {
    gsap.killTweensOf(this.mat.uniforms.u_appear);
    gsap.to(this.mat.uniforms.u_appear, {
      value: 0,
      duration: 0.9,
      ease: "power3.in",
    });
    setTimeout(cb, 950);
  }

  update(time: number): void {
    this.mat.uniforms.u_time.value = time;

    // Slow autonomous drift rotation
    this.cloud.rotation.y = time * 0.055;
    this.cloud.rotation.x = Math.sin(time * 0.038) * 0.1;

    // Silky mouse parallax — tilts the cloud toward the cursor
    this.cloud.rotation.y += (this.mousePos.x * 0.4 - this.cloud.rotation.y) * 0.022;
    this.cloud.rotation.x += (this.mousePos.y * 0.25 - this.cloud.rotation.x) * 0.022;
  }

  dispose(): void {
    window.removeEventListener("mousemove", this.onMouseMove);
    gsap.killTweensOf(this.mat.uniforms.u_appear);
    this.particles.geometry.dispose();
    this.mat.dispose();
  }
}
