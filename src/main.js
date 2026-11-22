import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MaterialLibrary } from './core/materials.js';
import { buildKitchen } from './core/kitchen.js';
import { buildLights } from './core/lights.js';
import { createLightsGui } from './core/lightsGui.js';
import { createCamera } from './core/cameraControls.js';

const BASE = import.meta.env.BASE_URL; 
const LAYOUT_URL = BASE + 'data/kitchen.json';

async function main() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  document.body.appendChild(renderer.domElement);

  const layout = await (await fetch(LAYOUT_URL)).json();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(layout.scene?.background ?? '#1b1b1f');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = layout.scene?.environmentIntensity ?? 0.3;

  const mats = new MaterialLibrary(layout.materials, renderer, BASE);
  await mats.preload();

  const { kitchen, byId } = await buildKitchen(layout, mats, BASE);
  scene.add(kitchen);

  const lights = buildLights(layout.lights, scene);
  createLightsGui(lights);

  const { camera, controls } = createCamera(layout.camera, layout.kitchen, renderer.domElement);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  window.app = { scene, camera, controls, renderer, byId, mats, lights };

  document.getElementById('loading').classList.add('hidden');

  renderer.setAnimationLoop(() => {
    controls.update(); 
   
    renderer.render(scene, camera);
  });
}

main().catch((err) => {
  console.error(err);
  document.getElementById('loading').textContent = 'Erro ao carregar a cozinha — ver consola (F12).';
});
