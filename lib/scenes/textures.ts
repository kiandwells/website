import * as THREE from "three";

const PALETTE = ["#0e9a7e", "#c66c80", "#0a6b58", "#8a5a83", "#3f6c8f", "#b08a3e"];

export function createPlaceholderTexture(
  projectIndex: number,
  imageIndex: number,
  title: string
): THREE.CanvasTexture {
  const w = 768;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const base = PALETTE[projectIndex % PALETTE.length];
  const light = lighten(base, 0.18);
  const dark = darken(base, 0.22);

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, light);
  grad.addColorStop(0.55, base);
  grad.addColorStop(1, dark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 40, Math.min(w, h) * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 40, Math.min(w, h) * 0.16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(imageIndex + 1).padStart(2, "0"), w / 2, h / 2 + 140);

  ctx.font = "500 28px sans-serif";
  ctx.fillText(title.toUpperCase(), w / 2, h / 2 + 190);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function loadImageTexture(
  url: string,
  onLoad?: (texture: THREE.CanvasTexture) => void
): THREE.CanvasTexture {
  const w = 768;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = new Image();
  img.onload = () => {
    const srcRatio = img.width / img.height;
    const dstRatio = w / h;
    let dw = w;
    let dh = h;
    let dx = 0;
    let dy = 0;
    if (srcRatio > dstRatio) {
      dh = w / srcRatio;
      dy = (h - dh) / 2;
    } else {
      dw = h * srcRatio;
      dx = (w - dw) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    texture.needsUpdate = true;
    onLoad?.(texture);
  };
  img.onerror = () => {
    onLoad?.(texture);
  };
  img.src = url;

  return texture;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function shift(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + 255 * amount, g + 255 * amount, b + 255 * amount);
}

function lighten(hex: string, amount: number): string {
  return shift(hex, amount);
}

function darken(hex: string, amount: number): string {
  return shift(hex, -amount);
}
