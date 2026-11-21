import * as THREE from 'three';

const deg = THREE.MathUtils.degToRad;

/**
 * Cria as luzes definidas em layout.lights.
 * Tipos: "ambient", "hemisphere", "spot", "point", "directional".
 * Devolve [{ def, light }] para a GUI (US6).
 */
export function buildLights(defs, scene) {
  const result = [];
  for (const def of defs) {
    let light;
    switch (def.type) {
      case 'ambient':
        light = new THREE.AmbientLight(def.color, def.intensity);
        break;
      case 'hemisphere':
        light = new THREE.HemisphereLight(def.color, def.groundColor ?? '#444444', def.intensity);
        break;
      case 'spot':
        light = new THREE.SpotLight(def.color, def.intensity, def.distance ?? 0, deg(def.angle ?? 30), def.penumbra ?? 0.3, def.decay ?? 2);
        light.target.position.set(...(def.target ?? [0, 0, 0]));
        scene.add(light.target);
        break;
      case 'point':
        light = new THREE.PointLight(def.color, def.intensity, def.distance ?? 0, def.decay ?? 2);
        break;
      case 'directional':
        light = new THREE.DirectionalLight(def.color, def.intensity);
        light.target.position.set(...(def.target ?? [0, 0, 0]));
        scene.add(light.target);
        break;
      default:
        console.warn(`[luzes] tipo desconhecido: ${def.type}`);
        continue;
    }

    light.name = def.name;
    if (def.position) light.position.set(...def.position);
    light.visible = def.on ?? true;

    if (def.castShadow && light.shadow) {
      light.castShadow = true;
      const size = def.shadowMapSize ?? 1024;
      light.shadow.mapSize.set(size, size);
      light.shadow.bias = def.shadowBias ?? -0.0005;
      light.shadow.normalBias = def.shadowNormalBias ?? 0.02;
      light.shadow.camera.near = 0.3;
      light.shadow.camera.far = def.shadowFar ?? 10;
      if (def.type === 'point') light.shadow.radius = 2;
    }

    scene.add(light);
    result.push({ def, light });
  }
  return result;
}
