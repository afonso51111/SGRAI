import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MaterialLibrary } from './core/materials.js';
import { buildKitchen } from './core/kitchen.js';
import { buildLights } from './core/lights.js';
import { createLightsGui } from './core/lightsGui.js';
import { createCamera } from './core/cameraControls.js';

// caminho do JSON
const BASE = import.meta.env.BASE_URL; 
const LAYOUT_URL = BASE + 'data/kitchen.json';

// arranque da aplicação
async function main() {
  // renderer e sombras
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  document.body.appendChild(renderer.domElement);

  // carregar o kitchen.json
  const layout = await (await fetch(LAYOUT_URL)).json();

  // cena e fundo
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(layout.scene?.background ?? '#1b1b1f');
  // reflexos dos metais
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = layout.scene?.environmentIntensity ?? 0.3;

  // materiais e texturas (US4)
  const mats = new MaterialLibrary(layout.materials, renderer, BASE);
  await mats.preload();

  // construir a cozinha (US2/US3)
  const { kitchen, byId } = await buildKitchen(layout, mats, BASE);
  scene.add(kitchen);

  // luzes (US5)
  const lights = buildLights(layout.lights, scene);
  // painel das luzes (US6)
  createLightsGui(lights);

  // câmara e rato (US7)
  const { camera, controls } = createCamera(layout.camera, layout.kitchen, renderer.domElement);

  // ajustar ao redimensionar
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // acesso pela consola (debug)
  window.app = { scene, camera, controls, renderer, byId, mats, lights };

  // esconder ecrã de carregamento
  document.getElementById('loading').classList.add('hidden');

  // ciclo de render
  renderer.setAnimationLoop(() => {
    controls.update(); 
   
    renderer.render(scene, camera);
  });
}

// mostrar erro se falhar
main().catch((err) => {
  console.error(err);
  document.getElementById('loading').textContent = 'Erro ao carregar a cozinha — ver consola (F12).';
});
