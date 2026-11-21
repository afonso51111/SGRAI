import * as THREE from 'three';

/*
 * Modelos criados proceduralmente.
 *
 * Convenções (iguais para todos os construtores):
 *  - unidade = 1 metro;
 *  - a origem de cada modelo está no centro da base (y = 0 é onde o objeto assenta);
 *  - a frente do modelo está virada para +Z (a rotação no JSON roda-o depois);
 *  - p = parâmetros do objeto (do JSON), m(parte, materialPorDefeito) = material dessa parte.
 *
 * As peças que vão ser animadas no sprint 3 têm nome (obj.name) para serem
 * encontradas com group.getObjectByName(...).
 */

// ---------- ajudantes ----------

function box(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function cyl(rTop, rBottom, h, mat, segments = 24, open = false) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments, 1, open), mat);
}

function sphere(r, mat, w = 24, h = 16) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, w, h), mat);
}

function at(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}

function named(obj, name) {
  obj.name = name;
  return obj;
}

/** Botões rotativos na frente de um equipamento. */
function knobs(g, count, width, y, z, mat) {
  for (let i = 0; i < count; i++) {
    const x = -width / 2 + (width * (i + 1)) / (count + 1);
    const k = cyl(0.025, 0.03, 0.03, mat, 16);
    k.rotation.x = Math.PI / 2;
    g.add(at(k, x, y, z + 0.015));
  }
}

/** Corpo base de equipamento de cozinha (caixa + rodapé). */
function applianceBody(g, w, h, d, m) {
  g.add(at(box(w - 0.04, 0.1, d - 0.08, m('kick', 'darkSteel')), 0, 0.05, -0.02));
  g.add(at(box(w, h - 0.1, d, m('body', 'stainless')), 0, 0.1 + (h - 0.1) / 2, 0));
}

// ---------- mobiliário ----------

export function counter(p, m) {
  const { width = 2, depth = 0.7, height = 0.9, topThickness = 0.05, doors = Math.max(1, Math.round(width / 0.6)) } = p;
  const g = new THREE.Group();
  const bodyH = height - topThickness - 0.1;
  g.add(at(box(width - 0.04, 0.1, depth - 0.1, m('kick', 'darkSteel')), 0, 0.05, -0.03));
  g.add(at(box(width, bodyH, depth - 0.04, m('body', 'stainless')), 0, 0.1 + bodyH / 2, -0.02));
  g.add(at(box(width + 0.02, topThickness, depth, m('top', 'woodCounter')), 0, height - topThickness / 2, 0));

  // portas e puxadores
  const doorW = width / doors;
  const handleMat = m('handle', 'darkSteel');
  for (let i = 0; i < doors; i++) {
    const x = -width / 2 + doorW * (i + 0.5);
    g.add(at(box(doorW - 0.02, bodyH - 0.04, 0.015, m('door', 'stainless')), x, 0.1 + bodyH / 2, depth / 2 - 0.03));
    const h = cyl(0.008, 0.008, Math.min(0.3, doorW * 0.5), handleMat, 8);
    h.rotation.z = Math.PI / 2;
    g.add(at(h, x, height - topThickness - 0.09, depth / 2 - 0.005));
  }
  return g;
}

export function table(p, m) {
  const { width = 2, depth = 1, height = 0.9, topThickness = 0.05 } = p;
  const g = new THREE.Group();
  g.add(at(box(width, topThickness, depth, m('top', 'wood')), 0, height - topThickness / 2, 0));
  g.add(at(box(width - 0.12, 0.02, depth - 0.12, m('shelf', 'stainless')), 0, 0.22, 0));
  const legMat = m('legs', 'stainless');
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      g.add(at(cyl(0.025, 0.025, height - topThickness, legMat, 12), sx * (width / 2 - 0.06), (height - topThickness) / 2, sz * (depth / 2 - 0.06)));
    }
  }
  return g;
}

// ---------- linha de montagem (US3) ----------

export function receivingPlatform(p, m) {
  const { width = 0.6, depth = 0.6, height = 0.06, rim = 0.03 } = p;
  const g = new THREE.Group();
  g.add(at(box(width, height, depth, m('body', 'stainless')), 0, height / 2, 0));
  const rimMat = m('rim', 'darkSteel');
  // rebordo em 3 lados (o lado do tapete fica aberto para a massa passar)
  g.add(at(box(width, rim, 0.02, rimMat), 0, height + rim / 2, -depth / 2 + 0.01));
  g.add(at(box(width, rim, 0.02, rimMat), 0, height + rim / 2, depth / 2 - 0.01));
  g.add(at(box(0.02, rim, depth, rimMat), -width / 2 + 0.01, height + rim / 2, 0));
  return g;
}

export function dispenser(p, m) {
  const {
    tubeRadius = 0.24,
    tubeHeight = 0.8,
    clearance = 0.45, // altura entre a bancada e o fundo do dispensador
    postOffset = 0.7, // distância do poste (atrás) ao centro do tubo
    crustCount = 10,
    crustRadius = 0.2,
    crustThickness = 0.02,
  } = p;
  const g = new THREE.Group();
  const frame = m('frame', 'darkSteel');
  const body = m('body', 'stainless');
  const topY = clearance + tubeHeight;

  // poste e braço de suporte
  g.add(at(box(0.08, topY + 0.15, 0.08, frame), 0, (topY + 0.15) / 2, -postOffset));
  g.add(at(box(0.08, 0.08, postOffset, frame), 0, topY + 0.1, -postOffset / 2));

  // gaiola do tubo (anéis + varões) para se verem as massas lá dentro
  const tube = named(new THREE.Group(), 'tube');
  for (const y of [clearance + 0.04, clearance + tubeHeight / 2, topY]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(tubeRadius, 0.012, 8, 40), body);
    ring.rotation.x = Math.PI / 2;
    tube.add(at(ring, 0, y, 0));
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    tube.add(at(cyl(0.01, 0.01, tubeHeight, body, 8), Math.cos(a) * tubeRadius, clearance + tubeHeight / 2, Math.sin(a) * tubeRadius));
  }
  // funil de carga no topo
  tube.add(at(cyl(tubeRadius * 1.35, tubeRadius, 0.15, body, 32, true), 0, topY + 0.075, 0));
  g.add(tube);

  // pilha de massas (o sprint 3 vai largá-las uma a uma)
  const crusts = named(new THREE.Group(), 'crustStack');
  const crustMat = m('crust', 'dough');
  for (let i = 0; i < crustCount; i++) {
    const c = named(cyl(crustRadius, crustRadius, crustThickness, crustMat, 32), `crust${i}`);
    crusts.add(at(c, 0, clearance + 0.06 + i * (crustThickness + 0.005), 0));
  }
  g.add(crusts);

  // comporta inferior em duas metades com charneira (pivots) — abre no sprint 3
  for (const side of [-1, 1]) {
    const pivot = named(new THREE.Group(), side < 0 ? 'hatchLeft' : 'hatchRight');
    pivot.position.set(side * tubeRadius, clearance + 0.02, 0);
    const plate = box(tubeRadius, 0.015, tubeRadius * 2, frame);
    plate.position.x = -side * tubeRadius / 2;
    pivot.add(plate);
    g.add(pivot);
  }
  return g;
}

export function conveyor(p, m) {
  const { length = 5, width = 0.5, height = 0.18, rollerRadius = 0.07 } = p;
  const g = new THREE.Group();
  const frame = m('frame', 'stainless');
  const dark = m('motor', 'darkSteel');

  // calhas laterais
  for (const s of [-1, 1]) g.add(at(box(length, height * 0.75, 0.03, frame), 0, height * 0.55, s * (width / 2 + 0.03)));
  // pés
  for (const x of [-length / 2 + 0.15, 0, length / 2 - 0.15]) {
    for (const s of [-1, 1]) g.add(at(box(0.05, height * 0.2, 0.05, frame), x, height * 0.1, s * (width / 2 + 0.03)));
  }
  // rolos nas pontas (rodam no sprint 3)
  [-1, 1].forEach((s, i) => {
    const r = named(cyl(rollerRadius, rollerRadius, width, dark, 24), `roller${i}`);
    r.rotation.x = Math.PI / 2;
    g.add(at(r, s * (length / 2 - rollerRadius), height - rollerRadius, 0));
  });
  // tapete (superfície de cima e retorno por baixo); o offset da textura anima no sprint 3
  g.add(named(at(box(length - 0.02, 0.012, width, m('belt', 'belt')), 0, height, 0), 'belt'));
  g.add(at(box(length - 0.2, 0.012, width, m('belt', 'belt')), 0, height - 2 * rollerRadius + 0.01, 0));
  // motor
  g.add(at(box(0.2, 0.14, 0.18, dark), -length / 2 + 0.25, 0.07, -(width / 2 + 0.16)));
  return g;
}

export function roboticArm(p, m) {
  const {
    upperLength = 0.45,
    foreLength = 0.4,
    shoulderAngle = 30, // graus (inclinação para a frente)
    elbowAngle = 80,
  } = p;
  const deg = THREE.MathUtils.degToRad;
  const armMat = m('arm', 'robotPaint');
  const jointMat = m('joint', 'darkSteel');
  const g = new THREE.Group();

  g.add(at(cyl(0.13, 0.15, 0.08, m('base', 'darkSteel'), 32), 0, 0.04, 0));

  // hierarquia: turret -> shoulder -> elbow -> wrist (cada um é um pivot a animar no sprint 3)
  const turret = named(new THREE.Group(), 'turret');
  turret.position.y = 0.08;
  turret.add(at(cyl(0.09, 0.1, 0.12, armMat, 24), 0, 0.06, 0));
  g.add(turret);

  const shoulder = named(new THREE.Group(), 'shoulder');
  shoulder.position.y = 0.18;
  shoulder.rotation.x = deg(shoulderAngle);
  const sj = sphere(0.075, jointMat);
  sj.scale.set(1.15, 1, 1);
  shoulder.add(sj);
  shoulder.add(at(box(0.08, upperLength, 0.08, armMat), 0, upperLength / 2, 0));
  turret.add(shoulder);

  const elbow = named(new THREE.Group(), 'elbow');
  elbow.position.y = upperLength;
  elbow.rotation.x = deg(elbowAngle);
  elbow.add(sphere(0.058, jointMat));
  elbow.add(at(box(0.065, foreLength, 0.065, armMat), 0, foreLength / 2, 0));
  shoulder.add(elbow);

  // pulso: mantém a cabeça sempre a apontar para baixo
  const wrist = named(new THREE.Group(), 'wrist');
  wrist.position.y = foreLength;
  wrist.rotation.x = Math.PI - deg(shoulderAngle + elbowAngle);
  wrist.add(sphere(0.045, jointMat));
  // cabeça doseadora: depósito + bico (o +Y local aponta para baixo)
  const head = m('head', 'stainless');
  wrist.add(at(cyl(0.075, 0.075, 0.1, head, 24), 0, -0.02, 0));
  wrist.add(at(cyl(0.02, 0.075, 0.1, head, 24), 0, 0.08, 0));
  wrist.add(named(at(cyl(0.012, 0.012, 0.04, jointMat, 12), 0, 0.15, 0), 'nozzle'));
  // tampa colorida com a cor do ingrediente deste braço
  wrist.add(at(cyl(0.07, 0.07, 0.025, m('ingredient', 'ingredientTomato'), 24), 0, -0.08, 0));
  elbow.add(wrist);

  g.userData.ingredient = p.ingredient;
  return g;
}

export function woodOven(p, m) {
  const {
    radius = 0.7,
    baseWidth = 1.6,
    baseDepth = 1.5,
    baseHeight = 0.12,
    serviceMouth = true, // segunda abertura, de lado, para tirar pizzas à mão
    serviceDoorAngle = 0, // graus: 0 = porta fechada
  } = p;
  const g = new THREE.Group();
  const brick = m('base', 'ovenBrick');
  const dome = m('dome', 'ovenDome');
  const domeH = 0.85;
  const mouthW = 0.6;
  const mouthH = 0.34;
  const front = radius * 0.86;

  g.add(at(box(baseWidth, baseHeight, baseDepth, brick), 0, baseHeight / 2, 0));

  const d = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), dome);
  d.scale.y = domeH;
  g.add(at(d, 0, baseHeight, 0));

  /** Entrada em arco com o fogo visível lá dentro, virada para +Z e depois rodada `angle` em Y. */
  const buildMouth = (name, angle) => {
    const pivot = new THREE.Group();
    pivot.rotation.y = angle;
    pivot.add(at(box(mouthW + 0.14, mouthH, 0.36, brick), 0, baseHeight + mouthH / 2, front));
    const arch = new THREE.Mesh(new THREE.CylinderGeometry((mouthW + 0.14) / 2, (mouthW + 0.14) / 2, 0.36, 32, 1, false, Math.PI / 2, Math.PI), brick);
    arch.rotation.x = Math.PI / 2;
    pivot.add(at(arch, 0, baseHeight + mouthH, front));

    // abertura (plano emissivo com o fogo)
    const mouth = named(new THREE.Group(), name);
    mouth.position.set(0, baseHeight + 0.02, front + 0.181);
    const fire = named(new THREE.Mesh(new THREE.PlaneGeometry(mouthW - 0.12, mouthH * 0.85), m('fire', 'fire')), name + 'Fire');
    fire.position.y = mouthH * 0.42;
    mouth.add(fire);
    const fireTop = new THREE.Mesh(new THREE.CircleGeometry((mouthW - 0.12) / 2, 24, 0, Math.PI), m('fire', 'fire'));
    fireTop.position.y = mouthH * 0.84;
    mouth.add(fireTop);
    pivot.add(mouth);
    g.add(pivot);
    return mouth;
  };

  // entrada principal (+Z): é aqui que o tapete entrega as pizzas
  buildMouth('mouth', 0);

  if (serviceMouth) {
    // abertura de serviço (+X): acesso manual com a pá, sem parar a linha.
    // No sprint 3 também pode ser a saída das pizzas já cozidas.
    const service = buildMouth('serviceMouth', Math.PI / 2);

    // porta metálica com charneira do lado esquerdo — "serviceDoor" é o pivot a animar
    const doorW = mouthW - 0.08;
    const doorH = mouthH + (mouthW - 0.12) / 2;
    const door = named(new THREE.Group(), 'serviceDoor');
    door.position.set(-doorW / 2, 0, 0.012);
    door.rotation.y = -THREE.MathUtils.degToRad(serviceDoorAngle);
    door.add(at(box(doorW, doorH, 0.02, m('door', 'darkSteel')), doorW / 2, doorH / 2, 0));
    const handle = cyl(0.012, 0.012, 0.12, m('handle', 'wood'), 10);
    handle.rotation.z = Math.PI / 2;
    door.add(at(handle, doorW * 0.75, doorH * 0.45, 0.04));
    service.add(door);

    // patamar de pedra à frente da abertura, para pousar a pizza ao tirá-la
    const ledge = box(0.3, 0.05, mouthW + 0.2, m('ledge', 'ovenBrick'));
    g.add(at(ledge, front + 0.18 + 0.15, baseHeight + 0.02 - 0.025, 0));
  }

  // chaminé
  g.add(at(cyl(0.08, 0.1, 0.6, m('chimney', 'darkSteel'), 20), 0, baseHeight + radius * domeH + 0.15, radius * 0.45));
  return g;
}

// ---------- equipamento de cozinha (US2) ----------

export function deepFryer(p, m) {
  const { width = 0.8, depth = 0.8, height = 0.9 } = p;
  const g = new THREE.Group();
  applianceBody(g, width, height, depth, m);
  const oil = m('oil', 'fryerOil');
  const basketMat = m('basket', 'stainless');
  const wellW = width / 2 - 0.08;
  for (const s of [-1, 1]) {
    g.add(at(box(wellW, 0.01, depth * 0.6, oil), s * (width / 4), height + 0.001, 0.02));
    // cesto + pega
    g.add(at(box(wellW * 0.85, 0.12, depth * 0.45, basketMat), s * (width / 4), height + 0.03, 0.04));
    const handle = cyl(0.012, 0.012, 0.28, m('handle', 'darkSteel'), 8);
    handle.rotation.x = Math.PI / 2 - 0.5;
    g.add(at(handle, s * (width / 4), height + 0.12, depth * 0.38));
  }
  g.add(at(box(width, 0.3, 0.04, m('body', 'stainless')), 0, height + 0.15, -depth / 2 + 0.02));
  knobs(g, 2, width, height - 0.12, depth / 2, m('knob', 'darkSteel'));
  return g;
}

export function griddle(p, m) {
  const { width = 1, depth = 0.8, height = 0.9 } = p;
  const g = new THREE.Group();
  applianceBody(g, width, height, depth, m);
  g.add(at(box(width - 0.06, 0.03, depth - 0.12, m('plate', 'darkSteel')), 0, height + 0.015, 0.02));
  const body = m('body', 'stainless');
  g.add(at(box(width, 0.18, 0.03, body), 0, height + 0.09, -depth / 2 + 0.015));
  for (const s of [-1, 1]) g.add(at(box(0.03, 0.1, depth - 0.1, body), s * (width / 2 - 0.015), height + 0.05, 0.02));
  knobs(g, 3, width, height - 0.12, depth / 2, m('knob', 'darkSteel'));
  return g;
}

export function grill(p, m) {
  const { width = 1, depth = 0.8, height = 0.9, bars = 14 } = p;
  const g = new THREE.Group();
  applianceBody(g, width, height, depth, m);
  g.add(at(box(width - 0.08, 0.04, depth - 0.14, m('firebox', 'charcoal')), 0, height - 0.01, 0.02));
  const grate = m('grate', 'darkSteel');
  for (let i = 0; i < bars; i++) {
    const x = -width / 2 + 0.07 + (i * (width - 0.14)) / (bars - 1);
    const b = cyl(0.008, 0.008, depth - 0.14, grate, 8);
    b.rotation.x = Math.PI / 2;
    g.add(at(b, x, height + 0.02, 0.02));
  }
  g.add(at(box(width, 0.18, 0.03, m('body', 'stainless')), 0, height + 0.09, -depth / 2 + 0.015));
  knobs(g, 3, width, height - 0.12, depth / 2, m('knob', 'darkSteel'));
  return g;
}

export function exhaustHood(p, m) {
  const { width = 3, depth = 1, height = 0.5, topScale = 0.45, ductHeight = 0.6 } = p;
  const g = new THREE.Group();
  const body = m('body', 'stainless');
  // pirâmide truncada de base retangular (cilindro de 4 lados rodado 45º e escalado)
  const geo = new THREE.CylinderGeometry(topScale * Math.SQRT1_2, Math.SQRT1_2, 1, 4, 1, true);
  geo.rotateY(Math.PI / 4);
  const hood = new THREE.Mesh(geo, m('hood', 'stainlessDouble'));
  hood.scale.set(width, height, depth);
  g.add(at(hood, 0, 0.12 + height / 2, 0));
  g.add(at(box(width, 0.12, depth, body), 0, 0.06, 0));
  // filtros por baixo
  const filters = m('filter', 'darkSteel');
  const n = Math.max(2, Math.round(width / 0.5));
  for (let i = 0; i < n; i++) {
    g.add(at(box(width / n - 0.04, 0.01, depth - 0.1, filters), -width / 2 + (width / n) * (i + 0.5), 0.005, 0));
  }
  // conduta até ao teto
  g.add(at(box(width * topScale * 0.6, ductHeight, depth * topScale * 0.6, body), 0, 0.12 + height + ductHeight / 2, 0));
  return g;
}

export function refrigerator(p, m) {
  const { width = 1.3, depth = 0.8, height = 2, doors = 2 } = p;
  const g = new THREE.Group();
  const body = m('body', 'stainless');
  for (const s of [-1, 1]) for (const z of [-1, 1]) g.add(at(cyl(0.03, 0.03, 0.08, m('feet', 'darkSteel'), 10), s * (width / 2 - 0.08), 0.04, z * (depth / 2 - 0.08)));
  g.add(at(box(width, height - 0.08, depth - 0.05, body), 0, 0.08 + (height - 0.08) / 2, -0.025));
  g.add(at(box(width - 0.04, 0.12, 0.01, m('grille', 'darkSteel')), 0, height - 0.08, depth / 2 - 0.045));
  const doorW = width / doors;
  const doorH = height - 0.3;
  for (let i = 0; i < doors; i++) {
    const x = -width / 2 + doorW * (i + 0.5);
    g.add(at(box(doorW - 0.015, doorH, 0.05, m('door', 'stainless')), x, 0.12 + doorH / 2, depth / 2 - 0.025));
    const hx = i < doors / 2 ? x + doorW / 2 - 0.07 : x - doorW / 2 + 0.07;
    g.add(at(cyl(0.015, 0.015, doorH * 0.5, m('handle', 'darkSteel'), 10), hx, 0.12 + doorH * 0.6, depth / 2 + 0.03));
  }
  return g;
}

export function dishwasher(p, m) {
  const { width = 0.6, depth = 0.65, height = 0.85 } = p;
  const g = new THREE.Group();
  applianceBody(g, width, height, depth, m);
  g.add(at(box(width - 0.04, height - 0.24, 0.02, m('door', 'stainless')), 0, 0.1 + (height - 0.24) / 2 + 0.02, depth / 2));
  g.add(at(box(width, 0.1, 0.02, m('panel', 'darkSteel')), 0, height - 0.06, depth / 2));
  const h = cyl(0.012, 0.012, width * 0.7, m('handle', 'darkSteel'), 10);
  h.rotation.z = Math.PI / 2;
  g.add(at(h, 0, height - 0.16, depth / 2 + 0.03));
  g.add(at(box(0.04, 0.015, 0.01, m('led', 'ledGreen')), width / 2 - 0.08, height - 0.06, depth / 2 + 0.012));
  return g;
}

export function wallShelf(p, m) {
  const { width = 1.6, depth = 0.3, levels = 2, spacing = 0.4 } = p;
  const g = new THREE.Group();
  const bracket = m('bracket', 'darkSteel');
  for (let i = 0; i < levels; i++) {
    const y = i * spacing;
    g.add(at(box(width, 0.03, depth, m('board', 'wood')), 0, y, 0));
    for (const s of [-1, 1]) g.add(at(box(0.03, 0.12, depth * 0.8, bracket), s * (width / 2 - 0.15), y - 0.07, 0));
  }
  return g;
}

export function pendantLamp(p, m) {
  const { cord = 0.6, shadeRadius = 0.22 } = p;
  const g = new THREE.Group();
  // origem no teto; o candeeiro desce
  g.add(at(cyl(0.006, 0.006, cord, m('cord', 'darkSteel'), 6), 0, -cord / 2, 0));
  g.add(at(cyl(0.03, shadeRadius, 0.22, m('shade', 'lampShade'), 32, true), 0, -cord - 0.11, 0));
  g.add(at(sphere(0.05, m('bulb', 'bulb')), 0, -cord - 0.17, 0));
  return g;
}

/** Utensílios de cozinha. p.kind escolhe o utensílio. */
export function cookingTool(p, m) {
  const g = new THREE.Group();
  switch (p.kind) {
    case 'peel': {
      // pá de pizza
      const blade = cyl(0.18, 0.18, 0.012, m('blade', 'wood'), 32);
      blade.scale.z = 1.2;
      g.add(at(blade, 0, 0.006, 0));
      const handle = cyl(0.015, 0.015, 0.6, m('handle', 'wood'), 10);
      handle.rotation.x = Math.PI / 2;
      g.add(at(handle, 0, 0.015, 0.5));
      break;
    }
    case 'rollingPin': {
      const body = cyl(0.03, 0.03, 0.3, m('body', 'wood'), 16);
      body.rotation.z = Math.PI / 2;
      g.add(at(body, 0, 0.03, 0));
      for (const s of [-1, 1]) {
        const h = cyl(0.012, 0.012, 0.09, m('body', 'wood'), 10);
        h.rotation.z = Math.PI / 2;
        g.add(at(h, s * 0.195, 0.03, 0));
      }
      break;
    }
    case 'bowl': {
      const r = p.radius ?? 0.14;
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push(new THREE.Vector2(r * 0.45 + r * 0.55 * Math.sin((t * Math.PI) / 2), t * r * 0.7));
      }
      const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), m('body', 'stainlessDouble'));
      g.add(bowl);
      g.add(at(cyl(r * 0.45, r * 0.45, 0.004, m('body', 'stainless'), 32), 0, 0.002, 0));
      break;
    }
    case 'pan': {
      const r = p.radius ?? 0.17;
      g.add(at(cyl(r, r * 0.9, 0.05, m('body', 'darkSteel'), 32), 0, 0.025, 0));
      const h = cyl(0.012, 0.012, 0.25, m('handle', 'darkSteel'), 8);
      h.rotation.z = Math.PI / 2;
      g.add(at(h, r + 0.12, 0.045, 0));
      break;
    }
    case 'pizzaTray': {
      const r = p.radius ?? 0.2;
      g.add(at(cyl(r, r, 0.01, m('body', 'stainless'), 40), 0, 0.005, 0));
      break;
    }
    case 'cutter': {
      const wheel = cyl(0.045, 0.045, 0.004, m('blade', 'stainless'), 32);
      wheel.rotation.z = Math.PI / 2;
      g.add(at(wheel, 0, 0.045, 0));
      const h = cyl(0.012, 0.012, 0.14, m('handle', 'wood'), 10);
      h.rotation.x = Math.PI / 2 - 0.3;
      g.add(at(h, 0, 0.07, 0.08));
      break;
    }
    default:
      console.warn(`[cookingTool] tipo desconhecido: ${p.kind}`);
  }
  return g;
}

export const BUILDERS = {
  counter,
  table,
  receivingPlatform,
  dispenser,
  conveyor,
  roboticArm,
  woodOven,
  deepFryer,
  griddle,
  grill,
  exhaustHood,
  refrigerator,
  dishwasher,
  wallShelf,
  pendantLamp,
  cookingTool,
};
