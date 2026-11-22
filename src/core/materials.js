import * as THREE from 'three';

const MAP_SLOTS = ['map', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'];
const SRGB_SLOTS = new Set(['map', 'emissiveMap']);

export class MaterialLibrary {
  constructor(definitions, renderer, baseUrl = './') {
    this.defs = definitions;
    this.baseUrl = baseUrl;
    this.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    this.images = new Map(); 
    this.textures = new Map(); 
    this.materials = new Map();
    this.missing = [];
  }

  async preload() {
    const urls = new Set();
    for (const def of Object.values(this.defs)) {
      for (const slot of MAP_SLOTS) if (def.maps?.[slot]) urls.add(def.maps[slot]);
    }
    const loader = new THREE.TextureLoader();
    await Promise.all(
      [...urls].map(async (url) => {
        try {
          this.images.set(url, await loader.loadAsync(this.baseUrl + url));
        } catch {
          this.images.set(url, null);
          this.missing.push(url);
        }
      }),
    );
    if (this.missing.length) {
      console.warn('[materiais] Texturas em falta (o material fica só com a cor):', this.missing);
    }
  }

  texture(url, slot, repeat = [1, 1], rotation = 0) {
    const base = this.images.get(url);
    if (!base) return null;
    const key = `${url}|${slot}|${repeat.join(',')}|${rotation}`;
    if (!this.textures.has(key)) {
      const t = base.clone(); 
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
      t.rotation = rotation;
      t.anisotropy = this.anisotropy;
      t.colorSpace = SRGB_SLOTS.has(slot) ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.needsUpdate = true;
      this.textures.set(key, t);
    }
    return this.textures.get(key);
  }

  get(name) {
    if (this.materials.has(name)) return this.materials.get(name);
    const def = this.defs[name];
    if (!def) {
      console.warn(`[materiais] Material "${name}" não existe no JSON — a usar cinzento.`);
      const fallback = new THREE.MeshStandardMaterial({ color: 0x888888 });
      this.materials.set(name, fallback);
      return fallback;
    }

    const mat = new THREE.MeshStandardMaterial({
      name,
      color: def.color ?? '#ffffff',
      roughness: def.roughness ?? 0.8,
      metalness: def.metalness ?? 0,
      emissive: def.emissive ?? '#000000',
      emissiveIntensity: def.emissiveIntensity ?? 1,
      transparent: (def.opacity ?? 1) < 1,
      opacity: def.opacity ?? 1,
      side: def.side === 'double' ? THREE.DoubleSide : THREE.FrontSide,
      flatShading: def.flatShading ?? false,
    });

    for (const slot of MAP_SLOTS) {
      const url = def.maps?.[slot];
      if (url) mat[slot] = this.texture(url, slot, def.repeat, def.textureRotation ?? 0);
    }
    if (def.bumpScale !== undefined) mat.bumpScale = def.bumpScale;
    if (def.normalScale) mat.normalScale.set(def.normalScale[0], def.normalScale[1]);

    this.materials.set(name, mat);
    return mat;
  }
}
