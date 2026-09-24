# Kian Dwells

Portfolio site for Kian Dwells, a luxurious serviced apartment. The site presents projects as interactive 3D card scenes rendered in the browser with Three.js.

## Stack

- [Next.js](https://nextjs.org) (App Router) — routing, rendering, fonts
- [Three.js](https://threejs.org) — 3D scenes
- [GSAP](https://gsap.com) — scene and card animations

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint

## Structure

- `app/` — routes, layout, and global styles
- `components/` — `SceneCanvas`, `Header`, `Footer`
- `lib/site.ts` — site and project content
- `lib/scenes/` — Three.js scenes and the engine that binds them to routes

## Content

Site copy and project data live in `lib/site.ts`. Project imagery is currently generated procedurally as placeholder textures; swap in real photography by replacing the texture creation in `lib/scenes/textures.ts`.
