import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

// máximos dos sliders
const INTENSITY_MAX = { ambient: 3, hemisphere: 3, directional: 5, spot: 120, point: 20 };


// painel lil-gui (US6)
export function createLightsGui(lights) {
  const gui = new GUI({ title: 'Iluminação' });

  for (const { def, light } of lights) {
    // uma pasta por luz
    const folder = gui.addFolder(def.name);
    const state = {
      on: light.visible,
      color: '#' + light.color.getHexString(),
      intensity: light.intensity,
      angle: THREE.MathUtils.radToDeg(light.angle ?? 0),
      penumbra: light.penumbra ?? 0,
    };

    // cor e intensidade
    const controls = [];
    controls.push(folder.addColor(state, 'color').name('Cor').onChange((v) => light.color.set(v)));
    controls.push(
      folder
        .add(state, 'intensity', 0, def.maxIntensity ?? INTENSITY_MAX[def.type] ?? 10, 0.01)
        .name('Intensidade')
        .onChange((v) => (light.intensity = v)),
    );
    // ângulo e penumbra (spots)
    if (light.isSpotLight) {
      controls.push(
        folder
          .add(state, 'angle', 5, 80, 0.5)
          .name('Ângulo de corte (°)')
          .onChange((v) => (light.angle = THREE.MathUtils.degToRad(v))),
      );
      controls.push(folder.add(state, 'penumbra', 0, 1, 0.01).name('Penumbra').onChange((v) => (light.penumbra = v)));
    }

    // bloquear controlos se desligada
    const setEnabled = (on) => controls.forEach((c) => (on ? c.enable() : c.disable()));
    // checkbox ligar/desligar
    const toggle = folder
      .add(state, 'on')
      .name('Ligada')
      .onChange((on) => {
        light.visible = on;
        setEnabled(on);
      });
    toggle.domElement.parentElement.prepend(toggle.domElement);

    setEnabled(state.on);
    folder.close();
  }

  return gui;
}
