import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

// Limites "razoáveis" dos sliders de intensidade por tipo de luz (unidades físicas do three.js)
const INTENSITY_MAX = { ambient: 3, hemisphere: 3, directional: 5, spot: 120, point: 20 };

/**
 * US6 — GUI de controlo das luzes (lil-gui):
 *  - uma pasta por luz;
 *  - checkbox para ligar/desligar;
 *  - color picker para a cor;
 *  - slider para a intensidade;
 *  - spotlights: sliders para o ângulo de corte e a penumbra;
 *  - com a luz desligada, os outros controlos ficam desativados.
 */
export function createLightsGui(lights) {
  const gui = new GUI({ title: 'Iluminação' });

  for (const { def, light } of lights) {
    const folder = gui.addFolder(def.name);
    const state = {
      on: light.visible,
      color: '#' + light.color.getHexString(),
      intensity: light.intensity,
      angle: THREE.MathUtils.radToDeg(light.angle ?? 0),
      penumbra: light.penumbra ?? 0,
    };

    const controls = [];
    controls.push(folder.addColor(state, 'color').name('Cor').onChange((v) => light.color.set(v)));
    controls.push(
      folder
        .add(state, 'intensity', 0, def.maxIntensity ?? INTENSITY_MAX[def.type] ?? 10, 0.01)
        .name('Intensidade')
        .onChange((v) => (light.intensity = v)),
    );
    if (light.isSpotLight) {
      controls.push(
        folder
          .add(state, 'angle', 5, 80, 0.5)
          .name('Ângulo de corte (°)')
          .onChange((v) => (light.angle = THREE.MathUtils.degToRad(v))),
      );
      controls.push(folder.add(state, 'penumbra', 0, 1, 0.01).name('Penumbra').onChange((v) => (light.penumbra = v)));
    }

    const setEnabled = (on) => controls.forEach((c) => (on ? c.enable() : c.disable()));
    // a checkbox fica em primeiro lugar na pasta
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
