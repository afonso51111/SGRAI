import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const deg = THREE.MathUtils.degToRad;

/**
 * US7 — câmara perspetiva controlada com o rato:
 *  - alvo inicial = centro do chão da cozinha;
 *  - botão esquerdo + arrastar = pan (dentro dos limites da cozinha);
 *  - botão direito + arrastar = orbitar à volta do alvo atual (com limites de ângulo);
 *  - roda = dolly in/out (com distância mínima e máxima);
 *  - amortecimento (damping) para o movimento ser suave.
 */
export function createCamera(cfg, kitchen, domElement) {
  const camera = new THREE.PerspectiveCamera(cfg.fov ?? 50, innerWidth / innerHeight, cfg.near ?? 0.1, cfg.far ?? 100);
  camera.position.set(...cfg.position);

  const controls = new OrbitControls(camera, domElement);
  controls.target.set(0, 0, 0); // centro do chão da cozinha

  // OrbitControls vem com esquerdo = rodar e direito = pan; o enunciado pede o contrário
  controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
  controls.screenSpacePanning = false; // pan no plano do chão
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.6;
  controls.panSpeed = 0.8;
  controls.zoomSpeed = 0.8;

  const lim = cfg.limits ?? {};
  controls.minDistance = lim.minDistance ?? 1.5;
  controls.maxDistance = lim.maxDistance ?? 18;
  controls.minPolarAngle = deg(lim.minPolarAngle ?? 5);
  controls.maxPolarAngle = deg(lim.maxPolarAngle ?? 85); // não deixa ir para baixo do chão

  // limites do pan: o alvo não sai da área da cozinha
  const margin = lim.panMargin ?? 0.5;
  const min = new THREE.Vector3(-kitchen.width / 2 + margin, 0, -kitchen.depth / 2 + margin);
  const max = new THREE.Vector3(kitchen.width / 2 - margin, lim.maxTargetHeight ?? 1.5, kitchen.depth / 2 - margin);
  const clamped = new THREE.Vector3();
  controls.addEventListener('change', () => {
    clamped.copy(controls.target).clamp(min, max);
    if (!clamped.equals(controls.target)) {
      const delta = clamped.clone().sub(controls.target);
      controls.target.add(delta);
      camera.position.add(delta);
    }
  });

  controls.update();
  controls.saveState(); // permite voltar à vista inicial com controls.reset()
  return { camera, controls };
}
