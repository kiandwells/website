import * as THREE from "three";

export type PointerHandlers = {
  hoverIn?: (mesh: THREE.Mesh) => void;
  hoverOut?: (mesh: THREE.Mesh) => void;
  move?: (hit: THREE.Intersection) => void;
  click?: (hit: THREE.Intersection) => void;
};

export class PointerController {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(2, 2);
  private meshes = new Map<THREE.Mesh, PointerHandlers>();
  private current: THREE.Mesh | null = null;

  constructor(private camera: THREE.Camera) {
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("click", this.onClick);
  }

  register(mesh: THREE.Mesh, handlers: PointerHandlers): void {
    this.meshes.set(mesh, handlers);
  }

  unregister(mesh: THREE.Mesh): void {
    this.meshes.delete(mesh);
    if (this.current === mesh) this.current = null;
  }

  update(): void {
    if (this.pointer.x === 2) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const objects = [...this.meshes.keys()];
    const hits = this.raycaster.intersectObjects(objects, false);
    const hit = hits[0];
    const target = (hit?.object as THREE.Mesh | undefined) ?? null;

    if (target !== this.current) {
      if (this.current) {
        const prev = this.meshes.get(this.current);
        if (prev?.hoverOut) prev.hoverOut(this.current);
      }
      if (target) {
        const next = this.meshes.get(target);
        if (next?.hoverIn) next.hoverIn(target);
      }
      this.current = target;
    }

    if (target && hit) {
      const handlers = this.meshes.get(target);
      if (handlers?.move) handlers.move(hit);
    }
  }

  clear(): void {
    this.current = null;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  private onClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest("a, button")) return;
    if (!this.current) return;
    const handlers = this.meshes.get(this.current);
    if (handlers?.click) {
      const hit = this.raycaster.intersectObjects([this.current], false)[0];
      if (hit) handlers.click(hit);
    }
  };

  dispose(): void {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("click", this.onClick);
  }
}

export class CameraParallax {
  params = { intensity: 0.002, ease: 0.08 };
  active = true;
  private mousePos = { x: 0, y: 0 };

  constructor(
    private camera: THREE.PerspectiveCamera,
    private initZ: number
  ) {
    window.addEventListener("mousemove", this.onMouseMove);
  }

  setIntensity(intensity: number): void {
    this.params.intensity = intensity;
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mousePos.x = (e.clientX - window.innerWidth / 2) * this.params.intensity;
    this.mousePos.y = (e.clientY - window.innerHeight / 2) * this.params.intensity;
  };

  update(): void {
    if (!this.active) return;
    const c = this.camera.position;
    c.x += (this.mousePos.x - c.x) * this.params.ease;
    c.y += (this.mousePos.y - c.y) * this.params.ease;
    c.z += (this.initZ - c.z) * this.params.ease;
    this.camera.lookAt(0, 0, 0);
  }

  destroy(): void {
    window.removeEventListener("mousemove", this.onMouseMove);
    this.active = false;
  }
}
