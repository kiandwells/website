import * as THREE from "three";
import { BaseScene } from "./Scene";
import { HomeScene } from "./HomeScene";
import { AboutScene } from "./AboutScene";
import { MoreProjectsScene } from "./MoreProjectsScene";
import { projects } from "../site";

export class Engine {
  private renderer: THREE.WebGLRenderer;
  private scenes = new Map<string, BaseScene>();
  private current: BaseScene | null = null;
  private rafId = 0;

  constructor(
    canvas: HTMLCanvasElement,
    onCardClick: (slug: string) => void,
    onHoverCard: (slug: string | null) => void
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.scenes.set("home", new HomeScene(onCardClick, onHoverCard));
    this.scenes.set("about", new AboutScene());
    this.scenes.set("moreprojects", new MoreProjectsScene());
    this.loop();
    window.addEventListener("resize", this.onResize);
  }

  private sceneKeyFor(pathname: string): { key: string; selected: number | null } | null {
    if (pathname === "/about") return { key: "about", selected: null };
    if (pathname === "/moreprojects") return { key: "moreprojects", selected: null };
    const match = pathname.match(/^\/project-highlight\/([^/]+)/);
    if (match) {
      const idx = projects.findIndex((p) => p.slug === match[1]);
      return { key: "home", selected: idx >= 0 ? idx : null };
    }
    if (pathname === "/") return { key: "home", selected: null };
    return null;
  }

  onRouteChange(pathname: string): void {
    const result = this.sceneKeyFor(pathname);

    if (!result) {
      this.current = null;
      return;
    }

    const { key, selected } = result;
    const next = this.scenes.get(key);
    if (!next) return;

    if (this.current === next) {
      next.emit("setSelection", selected);
      return;
    }

    if (this.current) {
      this.current.handleSceneEnd(() => {
        this.activate(next, selected);
      });
    } else {
      this.activate(next, selected);
    }
  }

  private activate(next: BaseScene, selected: number | null): void {
    this.current = next;
    next.onWindowResize();
    next.handleSceneStart();
    next.emit("setSelection", selected);
  }

  private onResize = (): void => {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.current?.onWindowResize();
  };

  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);
    if (!this.current) {
      this.renderer.clear();
      return;
    }
    this.current.update(performance.now() * 0.001);
    this.renderer.render(this.current.scene, this.current.camera);
  };

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.onResize);
    this.scenes.forEach((scene) => scene.dispose());
    this.renderer.dispose();
  }
}
