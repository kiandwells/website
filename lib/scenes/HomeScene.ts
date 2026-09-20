import * as THREE from "three";
import gsap from "gsap";
import { BaseScene } from "./Scene";
import { CardMesh, type CardGeometryParams } from "./CardMesh";
import { PointerController, CameraParallax } from "./pointer";
import { createPlaceholderTexture, loadImageTexture } from "./textures";
import { projects } from "../site";
import { projectCoverImage, projectGalleryImages } from "../projectImages";

const CARD_PARAMS: CardGeometryParams = {
  width: 3.4,
  height: 2.2,
  depth: 0.06,
  radius: 0.14,
  segments: 8,
};

const PROJECT_CARD_BASE_Y    = 0.9;
const PROJECT_CARD_X_OFFSET  = 0.8;
const PROJECT_SPINDLE_RADIUS = 2.4;
const PROJECT_SPINDLE_SPEED  = 0.3;
const CARD_SPACING           = 3.9;
const AMBIENT_PARTICLE_COUNT = 900;

type CardUserData = {
  type: "deck" | "project";
  index: number;
  projectIndex: number;
  lift: number;
  settled: boolean;
  baseY: number;
  orbitAngle: number;
};

// ─── Ambient particle backdrop ─────────────────────────────────────────────
function buildAmbientParticles(): THREE.Points {
  const pos    = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);
  const sizes  = new Float32Array(AMBIENT_PARTICLE_COUNT);
  const phases = new Float32Array(AMBIENT_PARTICLE_COUNT);

  for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 24;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4; // behind cards
    sizes[i]  = 0.5 + Math.random() * 1.2;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("a_size",   new THREE.Float32BufferAttribute(sizes, 1));
  geo.setAttribute("a_phase",  new THREE.Float32BufferAttribute(phases, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float a_size;
      attribute float a_phase;
      uniform float u_time;
      varying float v_alpha;
      void main() {
        vec3 p = position;
        p.x += sin(u_time * 0.22 + a_phase * 2.0) * 0.14;
        p.y += cos(u_time * 0.18 + a_phase * 1.6) * 0.11;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        v_alpha = 0.18 + 0.12 * sin(a_phase * 6.28 + u_time * 0.4);
        gl_PointSize = a_size * (240.0 / -mv.z);
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float v_alpha;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float mask = 1.0 - smoothstep(0.6, 1.0, r);
        gl_FragColor = vec4(0.055, 0.60, 0.49, mask * v_alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { u_time: { value: 0 } },
  });

  return new THREE.Points(geo, mat);
}

// ─── Ground glow plane ─────────────────────────────────────────────────────
function buildGroundPlane(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(28, 10, 1, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 v_uv;
      void main() {
        float d = length(v_uv - 0.5) * 2.0;
        float alpha = (1.0 - smoothstep(0.0, 1.0, d)) * 0.07;
        gl_FragColor = vec4(0.055, 0.60, 0.49, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -1.5;
  return mesh;
}

export class HomeScene extends BaseScene {
  private camPanner = new THREE.Object3D();
  private camParallax: CameraParallax;
  private pointer: PointerController;

  private deck = new THREE.Group();
  private deckCards: CardMesh[] = [];

  private projectGroups: THREE.Group[] = [];
  private projectCards: CardMesh[] = [];

  private selectedIndex: number | null = null;
  private spindleAngle = 0;
  private lastFrameTime: number | null = null;

  // Ambient environment
  private ambientParticles: THREE.Points;
  private groundPlane: THREE.Mesh;

  // Lights
  private ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  private keyLight    = new THREE.DirectionalLight(0xffffff, 1.1);
  private fillLight   = new THREE.DirectionalLight(0x9ee8d8, 0.5);
  private rimLight    = new THREE.DirectionalLight(0xc66c80, 0.35);

  constructor(
    private onCardClick: (slug: string) => void,
    private onHoverCard: (slug: string | null) => void
  ) {
    super();

    this.camera.position.z = 15;
    this.camera.fov = 30;
    this.camera.updateProjectionMatrix();

    this.camPanner.add(this.camera);
    this.scene.add(this.camPanner);

    // Lighting rig
    this.keyLight.position.set(6, 8, 10);
    this.fillLight.position.set(-8, 2, 6);
    this.rimLight.position.set(0, -4, -6);
    this.scene.add(this.ambientLight, this.keyLight, this.fillLight, this.rimLight);

    // Ambient environment
    this.ambientParticles = buildAmbientParticles();
    this.groundPlane      = buildGroundPlane();
    this.scene.add(this.ambientParticles);
    this.scene.add(this.groundPlane);

    this.camParallax = new CameraParallax(this.camera, 15);
    this.pointer     = new PointerController(this.camera);

    this.buildDeck();
    this.buildProjectCards();

    this.on("setSelection", (index: unknown) => {
      this.setSelectedCardIndex(index === null ? null : Number(index));
    });
  }

  private buildDeck(): void {
    this.deckCards = projects.map((project, index) => {
      const cover   = projectCoverImage(project.slug);
      const texture = cover
        ? loadImageTexture(cover)
        : createPlaceholderTexture(index, 0, project.title);
      const card = new CardMesh(CARD_PARAMS, texture);
      card.name = `${index}_deck_card`;
      card.userData = {
        type: "deck",
        index,
        projectIndex: index,
        lift: 0,
        settled: false,
        baseY: 0,
        orbitAngle: 0,
      } satisfies CardUserData;

      card.position.x = (index - (projects.length - 1) / 2) * CARD_SPACING;
      card.position.y = 10;
      // Slight initial rotation for visual depth
      card.rotation.y = 0.22;

      this.deck.add(card);
      this.registerPointer(card, 0.22);
      return card;
    });

    this.scene.add(this.deck);
  }

  private buildProjectCards(): void {
    this.projectGroups = projects.map((project, projectIndex) => {
      const group   = new THREE.Group();
      const gallery = projectGalleryImages(project.slug);
      const count   = Math.min(project.imageCount, gallery.length);
      for (let j = 0; j < count; j++) {
        const texture = gallery[j]
          ? loadImageTexture(gallery[j])
          : createPlaceholderTexture(projectIndex, j, project.title);
        const card = new CardMesh(CARD_PARAMS, texture);
        card.name = `${projectIndex}_${j}_project_card`;
        const orbitAngle = (j / count) * Math.PI * 2;
        card.userData = {
          type: "project",
          index: j,
          projectIndex,
          lift: 0,
          settled: false,
          baseY: PROJECT_CARD_BASE_Y,
          orbitAngle,
        } satisfies CardUserData;

        card.position.x = PROJECT_SPINDLE_RADIUS * Math.sin(orbitAngle);
        card.position.y = -10;
        card.position.z = PROJECT_SPINDLE_RADIUS * Math.cos(orbitAngle);
        card.rotation.y = orbitAngle;

        group.add(card);
        this.registerPointer(card, 0.1);
        this.projectCards.push(card);
      }
      group.position.y = 0;
      group.position.x = PROJECT_CARD_X_OFFSET;
      this.scene.add(group);
      return group;
    });
  }

  private registerPointer(card: CardMesh, hoverLift: number): void {
    const data    = card.userData as CardUserData;
    const baseRotY = data.type === "deck" ? 0.22 : 0;

    this.pointer.register(card, {
      hoverIn: () => {
        gsap.to(data, { lift: hoverLift, duration: 0.25, ease: "power3.out" });
        this.onHoverCard(projects[data.projectIndex].slug);
      },
      hoverOut: () => {
        gsap.to(data, { lift: 0, duration: 0.3, ease: "power3.out" });
        if (data.type === "deck") {
          gsap.to(card.rotation, { y: baseRotY, x: 0, z: 0, duration: 0.3, ease: "power3.out" });
        } else {
          gsap.to(card.rotation, { x: 0, z: 0, duration: 0.3, ease: "power3.out" });
        }
        this.onHoverCard(null);
      },
      move: (hit) => {
        const uv = hit.uv?.clone().addScalar(-0.5).multiplyScalar(0.12) ?? { x: 0, y: 0 };
        card.rotation.x = -uv.y;
        card.rotation.z = uv.x;
      },
      click: () => {
        this.onCardClick(projects[data.projectIndex].slug);
      },
    });
  }

  private setSelectedCardIndex(index: number | null): void {
    this.selectedIndex = index;

    if (index === null) {
      this.showDeck();
      this.hideProjectCards();
      gsap.to(this.camPanner.position, { z: 0, duration: 1.4, ease: "power2.inOut" });
      return;
    }

    this.hideDeck();
    this.showProjectCards(index);
    gsap.to(this.camPanner.position, { z: -2.2, duration: 1.4, ease: "power2.inOut" });
  }

  private showDeck(): void {
    this.deckCards.forEach((card, i) => {
      const data = card.userData as CardUserData;
      data.settled = false;
      gsap.killTweensOf(card.position);
      if (card.position.y < data.baseY) card.position.y = 10;
      gsap.to(card.position, {
        y: data.baseY,
        duration: 1.6,
        delay: i * 0.07,
        ease: "expo.out",
        onComplete: () => { data.settled = true; },
      });
    });
  }

  private hideDeck(): void {
    this.deckCards.forEach((card) => {
      const data = card.userData as CardUserData;
      data.settled = false;
      gsap.killTweensOf(card.position);
      gsap.to(card.position, { y: -10, duration: 0.75, ease: "power2.in" });
    });
  }

  private showProjectCards(projectIndex: number): void {
    this.projectGroups.forEach((group, gi) => {
      group.children.forEach((child, j) => {
        const card = child as CardMesh;
        const data = card.userData as CardUserData;
        data.settled = false;
        gsap.killTweensOf(card.position);
        const isTarget = gi === projectIndex;
        gsap.to(card.position, {
          y: isTarget ? data.baseY : -10,
          duration: 0.85,
          delay: isTarget ? j * 0.04 : 0,
          ease: "expo.out",
          onComplete: () => { if (isTarget) data.settled = true; },
        });
      });
    });
  }

  private hideProjectCards(): void {
    this.projectCards.forEach((card) => {
      const data = card.userData as CardUserData;
      data.settled = false;
      gsap.killTweensOf(card.position);
      gsap.to(card.position, { y: -10, duration: 0.75, ease: "power2.in" });
    });
  }

  handleSceneStart(): void {
    this.camParallax.active = true;
  }

  handleSceneEnd(cb: () => void): void {
    this.pointer.clear();
    setTimeout(cb, 800);
  }

  update(time: number): void {
    this.camParallax.update();
    this.pointer.update();

    // Update ambient particle time
    (this.ambientParticles.material as THREE.ShaderMaterial).uniforms.u_time.value = time;

    if (this.lastFrameTime !== null) {
      this.spindleAngle += (time - this.lastFrameTime) * PROJECT_SPINDLE_SPEED;
    }
    this.lastFrameTime = time;

    // Deck card idle float + wobble
    this.deckCards.forEach((card, i) => {
      const data = card.userData as CardUserData;
      if (!data.settled) return;
      if (data.lift > 0) {
        card.position.y = data.baseY + data.lift;
        return;
      }
      card.position.y = data.baseY + Math.sin(time * 0.9  + i * 2.0) * 0.055;
      card.rotation.x = Math.sin(time * 1.8  + i * 2.1 + 3) * 0.018;
      card.rotation.z = Math.sin(time * 1.55 + i * 2.2 + 2) * 0.018;
    });

    // Project spindle orbit
    this.projectCards.forEach((card) => {
      const data  = card.userData as CardUserData;
      const angle = data.orbitAngle + this.spindleAngle;
      card.position.x = PROJECT_SPINDLE_RADIUS * Math.sin(angle);
      card.position.z = PROJECT_SPINDLE_RADIUS * Math.cos(angle);
      card.rotation.y = angle;
      if (!data.settled) return;
      card.position.y = data.baseY + data.lift;
    });

    // Subtle key light orbit for dynamic shading
    this.keyLight.position.x  = Math.sin(time * 0.12) * 7;
    this.keyLight.position.z  = Math.cos(time * 0.12) * 10;
  }

  dispose(): void {
    this.pointer.dispose();
    this.camParallax.destroy();
    gsap.killTweensOf(this.camPanner.position);
    this.ambientParticles.geometry.dispose();
    (this.ambientParticles.material as THREE.ShaderMaterial).dispose();
    (this.groundPlane.material as THREE.ShaderMaterial).dispose();
    this.groundPlane.geometry.dispose();
    [...this.deckCards, ...this.projectCards].forEach((card) => card.dispose());
  }
}
