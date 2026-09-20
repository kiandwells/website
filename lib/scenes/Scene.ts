import * as THREE from "three";

export type SceneEndCallback = () => void;

export abstract class BaseScene {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;

  private listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1,
      0.1,
      100
    );
  }

  emit(event: string, ...args: unknown[]): void {
    (this.listeners[event] ?? []).forEach((fn) => fn(...args));
  }

  on(event: string, fn: (...args: unknown[]) => void): void {
    (this.listeners[event] ??= []).push(fn);
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  handleSceneStart(): void {}

  handleSceneEnd(cb: SceneEndCallback): void {
    cb();
  }

  abstract update(time: number): void;

  dispose(): void {}
}
