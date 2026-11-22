import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { BUILDERS } from './builders.js';

const deg = THREE.MathUtils.degToRad;

/** Chão e paredes da cozinha a partir de layout.kitchen. */
function buildRoom(k, mats) {
  const room = new THREE.Group();
  room.name = 'room';
  const { width, depth, height } = k;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mats.get(k.floorMaterial));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  room.add(floor);

  // teto: plano virado para baixo (FrontSide) — visto de cima fica invisível, tal como as paredes
  if (k.ceilingMaterial) {
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mats.get(k.ceilingMaterial));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    ceiling.receiveShadow = true;
    ceiling.name = 'ceiling';
    room.add(ceiling);
  }

  // paredes de uma só face (FrontSide virada para dentro): de fora vê-se para dentro da cozinha
  const walls = [
    { name: 'wallBack', w: width, pos: [0, height / 2, -depth / 2], rotY: 0 },
    { name: 'wallFront', w: width, pos: [0, height / 2, depth / 2], rotY: Math.PI },
    { name: 'wallLeft', w: depth, pos: [-width / 2, height / 2, 0], rotY: Math.PI / 2 },
    { name: 'wallRight', w: depth, pos: [width / 2, height / 2, 0], rotY: -Math.PI / 2 },
  ];
  for (const w of walls) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w.w, height), mats.get(k.wallMaterial));
    mesh.name = w.name;
    mesh.position.set(...w.pos);
    mesh.rotation.y = w.rotY;
    mesh.receiveShadow = true;
    room.add(mesh);
  }
  return room;
}

function applyTransform(obj, def) {
  if (def.position) obj.position.set(...def.position);
  if (def.rotation) obj.rotation.set(deg(def.rotation[0]), deg(def.rotation[1]), deg(def.rotation[2]));
  if (def.scale !== undefined) {
    const s = Array.isArray(def.scale) ? def.scale : [def.scale, def.scale, def.scale];
    obj.scale.set(...s);
  }
}

function setShadows(obj, def) {
  const cast = def.castShadow ?? true;
  const receive = def.receiveShadow ?? true;
  obj.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = cast;
      o.receiveShadow = receive;
    }
  });
}

/**
 * Constrói a cozinha inteira a partir do JSON.
 * Cada objeto em layout.objects é:
 *   - procedural: { "type": "<construtor>", "params": {...}, "materials": { "<parte>": "<material>" } }
 *   - importado:  { "type": "model", "model": "<chave em layout.models>" }  (URL vem do JSON)
 */
export async function buildKitchen(layout, mats, baseUrl = './') {
  const kitchen = new THREE.Group();
  kitchen.name = 'kitchen';
  kitchen.add(buildRoom(layout.kitchen, mats));

  const gltfLoader = new GLTFLoader();
  const gltfCache = new Map();
  const byId = {};

  for (const def of layout.objects) {
    let obj;
    if (def.type === 'model') {
      const model = layout.models?.[def.model];
      if (!model) {
        console.warn(`[cozinha] modelo "${def.model}" não está em "models"`);
        continue;
      }
      try {
        if (!gltfCache.has(model.url)) gltfCache.set(model.url, gltfLoader.loadAsync(baseUrl + model.url));
        obj = (await gltfCache.get(model.url)).scene.clone(true);
        if (model.scale) obj.scale.setScalar(model.scale);
        const wrapper = new THREE.Group(); // para a escala do modelo não se misturar com a do objeto
        wrapper.add(obj);
        obj = wrapper;
      } catch (e) {
        console.warn(`[cozinha] falhou o carregamento de ${model.url}`, e);
        continue;
      }
    } else {
      const build = BUILDERS[def.type];
      if (!build) {
        console.warn(`[cozinha] tipo de objeto desconhecido: ${def.type}`);
        continue;
      }
      const m = (part, fallback) => mats.get(def.materials?.[part] ?? fallback);
      obj = build(def.params ?? {}, m);
    }

    obj.name = def.id ?? def.type;
    obj.userData.def = def;
    applyTransform(obj, def);
    setShadows(obj, def);
    kitchen.add(obj);
    if (def.id) byId[def.id] = obj;
  }

  return { kitchen, byId };
}
