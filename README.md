# LaPrizza – Cozinha 3D (SGRAI 2026/27)

Módulo 3D em **Three.js** (com **Vite**) para o trabalho de SGRAI. O grupo não tem alunos de LAPR5, por isso a US1 (integração no SPA) não se aplica.

## Como correr

```powershell
cd laprizza-3d
npm install      # só da primeira vez
npm run dev      # abre http://localhost:5173 no browser
```

`npm run build` gera a pasta `dist/`, a versão final do site.

## Controlos (US7)

| Ação | Rato |
|---|---|
| Pan | botão esquerdo + arrastar |
| Orbitar | botão direito + arrastar |
| Zoom (dolly) | roda |

O alvo inicial da câmara é o centro do chão. O pan está limitado à área da cozinha, a distância fica entre 1,5 m e 16 m e a câmara não pode ir abaixo do chão. Os limites vêm de `camera.limits` no JSON.

## Estrutura

```
public/
  data/kitchen.json   ← TUDO o que define a cena: dimensões, objetos, materiais, texturas, luzes, câmara
  textures/…          ← imagens das texturas
  models/…            ← (opcional) modelos .glb importados
src/
  main.js             ← arranque: renderer, carregar JSON, montar cena, ciclo de render
  core/materials.js   ← cria materiais/texturas a partir do JSON (US4)
  core/builders.js    ← modelos procedurais: bancada, forno, braços robóticos, tapete… (US2/US3)
  core/kitchen.js     ← percorre o JSON e coloca cada objeto na cena (procedural ou .glb)
  core/lights.js      ← luzes a partir do JSON, com sombras (US5)
  core/lightsGui.js   ← painel lil-gui das luzes (US6)
  core/cameraControls.js ← câmara + OrbitControls com os botões pedidos (US7)
```

## User stories do sprint 2

- **US2 Cozinha:** layout em `kitchen.json` (`kitchen` + `objects`). Equipamento: bancadas, mesa de preparação, forno a lenha, fritadeira, chapa, grelhador, frigorífico, máquina da loiça, exaustor, prateleira, utensílios (pá, rolo, taças, frigideiras, tabuleiros, cortador) e candeeiros.
- **US3 Linha de montagem:** na parede do fundo há uma bancada de 8,6 m com a plataforma de receção à esquerda, o dispensador de massas por cima, o tapete rolante e 6 braços robóticos (um por ingrediente). O forno fica à direita.
  As peças que vão ser animadas no sprint 3 têm nome e podem ser obtidas com `getObjectByName`:
  - dispensador: `crustStack`, `crust0…`, `hatchLeft`, `hatchRight`
  - tapete: `belt`, `roller0`, `roller1`
  - braços: `turret`, `shoulder`, `elbow`, `wrist`, `nozzle`
  - forno: `mouth`, `fire`
- **US4 Texturas:** todos os materiais estão em `materials` no JSON (cor, rugosidade, metalicidade, URLs e repetição). Cada textura tem um mapa de cor e um mapa normal, bump ou roughness.
- **US5 Luzes:** luz ambiente, luz hemisférica, 4 spotlights com sombras e uma point light no fogo do forno.
- **US6 GUI:** há uma pasta por luz, com uma checkbox para ligar e desligar, cor, intensidade e, nas spotlights, ângulo e penumbra. Com a luz desligada, os controlos ficam desativados.

## Texturas

Todas as texturas são **CC0** (domínio público), em resolução 1K e formato JPG. Cada uma tem um mapa de cor, um normal (OpenGL) e um roughness. Os metais têm também metalness e o fogo tem um mapa de emissão. Estão em `public/textures/<material>/` e ficam ligadas aos materiais em `kitchen.json`.

| Pasta | Usada em | Origem |
|---|---|---|
| `floor` | chão | Poly Haven – *Checkered Pavement Tiles* |
| `walls` | paredes | Poly Haven – *Large Red Bricks* |
| `oven_brick` | base e entradas do forno | Poly Haven – *Medieval Red Brick* |
| `oven_dome` | cúpula do forno | Poly Haven – *Rough Plaster Brick* |
| `wood` | tampos, mesa, prateleira, utensílios | Poly Haven – *Kitchen Wood* |
| `dough` | massas de pizza (com tom de massa) | Poly Haven – *White Plaster 02* |
| `stainless` | inox: bancadas, equipamentos, tubo do dispensador | ambientCG – *Metal009* |
| `dark_steel` | aço escuro: rodapés, chapa, grelhas, puxadores | ambientCG – *Metal027* |
| `robot_paint` | braços robóticos | ambientCG – *PaintedMetal004* |
| `belt` | tapete rolante | ambientCG – *Rubber004* |
| `fire` | fogo dentro do forno | ambientCG – *Lava004* |
| `embers` | brasas do grelhador | ambientCG – *Lava001* |
| `plastic_white` | tampas dos ingredientes, óleo, LED, lâmpadas | ambientCG – *Plastic010* |
| `plastic_black` | abajures | ambientCG – *Plastic006* |

## Créditos

- Three.js, lil-gui e OrbitControls: https://threejs.org (licença MIT)
- Texturas: [Poly Haven](https://polyhaven.com) (CC0) e [ambientCG](https://ambientcg.com) (CC0), conforme a tabela acima
