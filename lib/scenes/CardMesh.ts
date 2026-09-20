import * as THREE from "three";

export type CardGeometryParams = {
  width: number;
  height: number;
  depth: number;
  radius: number;
  segments: number;
};

function createRoundedRectGeometry(params: CardGeometryParams): THREE.BufferGeometry {
  const { width, height, depth, radius, segments } = params;
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;
  const r = Math.min(radius, hw, hh);

  const corners = [
    new THREE.Vector2(hw - r, hh - r),
    new THREE.Vector2(-hw + r, hh - r),
    new THREE.Vector2(-hw + r, -hh + r),
    new THREE.Vector2(hw - r, -hh + r),
  ];
  const arcStarts = [0, Math.PI / 2, Math.PI, 1.5 * Math.PI];

  const ring: THREE.Vector2[] = [];
  for (let c = 0; c < 4; c++) {
    const corner = corners[c];
    const start = arcStarts[c];
    const end = start + Math.PI / 2;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const angle = start + t * (end - start);
      ring.push(
        new THREE.Vector2(corner.x + Math.cos(angle) * r, corner.y + Math.sin(angle) * r)
      );
    }
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  positions.push(0, 0, hd);
  uvs.push(0.5, 0.5);
  normals.push(0, 0, 1);
  for (const p of ring) {
    positions.push(p.x, p.y, hd);
    uvs.push((p.x + hw) / width, (p.y + hh) / height);
    normals.push(0, 0, 1);
  }

  positions.push(0, 0, -hd);
  uvs.push(0.5, 0.5);
  normals.push(0, 0, -1);
  for (const p of ring) {
    positions.push(p.x, p.y, -hd);
    uvs.push((p.x + hw) / width, (p.y + hh) / height);
    normals.push(0, 0, -1);
  }

  const ringCount = ring.length;
  const centerFront = 0;
  const frontStart = 1;
  for (let i = 0; i < ringCount; i++) {
    const a = centerFront;
    const b = frontStart + i;
    const c = frontStart + ((i + 1) % ringCount);
    indices.push(a, b, c);
  }

  const backCenter = ringCount + 1;
  const backStart = ringCount + 2;
  for (let i = 0; i < ringCount; i++) {
    const a = backCenter;
    const b = backStart + i;
    const c = backStart + ((i + 1) % ringCount);
    indices.push(b, a, c);
  }

  const lastRing = ringCount;
  for (let i = 1; i <= ringCount; i++) {
    const a = i;
    const b = i === lastRing ? 1 : i + 1;
    const c = i + ringCount + 1;
    const d = i === lastRing ? ringCount + 2 : i + ringCount + 2;
    indices.push(a, b, d);
    indices.push(a, d, c);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  geometry.addGroup(0, ringCount * 3, 0);
  geometry.addGroup(ringCount * 3, ringCount * 3, 1);
  geometry.addGroup(ringCount * 6, ringCount * 6, 2);

  return geometry;
}

export class CardMesh extends THREE.Mesh {
  constructor(params: CardGeometryParams, texture: THREE.Texture) {
    const geometry = createRoundedRectGeometry(params);
    const materials = [
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.18, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.35, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: 0xc66c80, roughness: 0.25, metalness: 0.15, emissive: new THREE.Color(0xc66c80), emissiveIntensity: 0.12 }),
    ];
    super(geometry, materials);
  }

  updateFrontTexture(texture: THREE.Texture): void {
    const mats = this.material as THREE.MeshStandardMaterial[];
    mats[0].map = texture;
    mats[0].needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    const mats = this.material as THREE.MeshStandardMaterial[];
    mats.forEach((m) => {
      m.map?.dispose();
      m.dispose();
    });
  }
}
