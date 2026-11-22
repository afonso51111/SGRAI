# LaPrizza – Cozinha 3D (SGRAI 2026/27)

Módulo 3D em **Three.js** (com **Vite**) para o trabalho de SGRAI. O grupo não tem alunos de LAPR5, por isso a US1 (integração no SPA) não se aplica.

## Como correr

```powershell
cd SGRAI-main    # a pasta onde está o package.json
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
- **US5 Luzes:** luz ambiente, luz hemisférica, 4 spotlights (3 com sombras: as duas da linha de montagem a 2048 px e a da mesa a 1024 px) e uma point light no fogo do forno. Os reflexos do inox vêm de um mapa de ambiente com intensidade baixa (`scene.environmentIntensity`, 0.25), para que desligar as luzes na GUI se note.
- **US6 GUI:** há uma pasta por luz, com uma checkbox para ligar e desligar, cor, intensidade e, nas spotlights, ângulo e penumbra. Com a luz desligada, os controlos ficam desativados.

## Decisões de projeto

- **Unidade de medida:** 1 unidade = 1 metro (o three.js não define nenhuma). Cozinha de 10 × 8 × 3,2 m; bancadas a 0,9 m, que é a altura real de uma bancada de cozinha profissional.
- **Layout:** a linha de montagem fica na parede do fundo, numa bancada de 8,6 m (plataforma de receção, tapete e forno a lenha em fila, da esquerda para a direita, como pede a US3). O equipamento de cozinha fica nas paredes laterais (fogão, chapa e grelhador sob o exaustor à direita; frigorífico, máquina da loiça e prateleira à esquerda), e a mesa de preparação ao centro. Assim, o centro do chão fica livre para a câmara e as duas zonas de trabalho não se atravessam.
- **Procedural vs importado:** todos os modelos são criados por código (`builders.js`). Dá controlo total sobre as peças que se animam no sprint 3 (cada uma tem nome), mantém o carregamento instantâneo (não há ficheiros `.glb`) e evita problemas de licença. O JSON continua a suportar `.glb` (`models`), caso seja preciso importar algo.
- **Estilo de render:** realista, com materiais PBR (`MeshStandardMaterial`), tone mapping ACES e sombras. Escolhemos este estilo porque a US4 pede texturas PBR e realismo, e porque o inox, o tijolo e o fogo do forno beneficiam de reflexos e de luz física. Não usamos cel shading nem low-poly.
- **Performance:** texturas de 1K em JPG; repetições de textura definidas no JSON; elementos repetidos (lenha, ingredientes das pizzas) em `InstancedMesh`, que gasta um draw call por tipo; `pixelRatio` limitado a 2; só 3 luzes projetam sombras; a luz do exaustor e as lâmpadas não projetam sombras.
- **Teto:** é um plano virado para baixo (`FrontSide`), por isso desaparece quando se olha de cima e a vista aérea continua livre. As lâmpadas e as tiras de LED prendem-se a ele.
- **Pizzas na linha:** as pizzas de `pizzaPlatform`, `pizzaBelt1…6` e `pizzaTable` são só decoração para o sprint 2 (mostram cada fase da montagem). No sprint 3 são substituídas pelas pizzas animadas; basta removê-las do JSON.
- **Lenha:** o nicho sob o forno (`niche` na bancada) está aberto e cheio de troncos (`logPile`), como nos exemplos de referência.
- **Variedade (US4):** as 10 massas do dispensador diferem em tom, raio, rotação e posição; cada ingrediente tem o seu material e recipiente (`bin…`), e as camadas das pizzas têm materiais próprios (`pizzaSauce`, `pizzaCheese`, `topping…`).

## Texturas

Todas as texturas são **CC0** (domínio público), em resolução 1K e formato JPG. Cada uma tem um mapa de cor, um normal (OpenGL) e um roughness. Os metais têm também metalness e o fogo tem um mapa de emissão. Estão em `public/textures/<material>/` e ficam ligadas aos materiais em `kitchen.json`.

| Pasta | Usada em | Origem |
|---|---|---|
| `floor` | chão | Poly Haven – *Checkered Pavement Tiles* |
| `walls` | paredes | Poly Haven – *Large Red Bricks* |
| `oven_brick` | base e entradas do forno | Poly Haven – *Medieval Red Brick* |
| `oven_dome` | cúpula do forno | Poly Haven – *Rough Plaster Brick* |
| `wood` | tampos, mesa, prateleira, utensílios, lenha | Poly Haven – *Kitchen Wood* |
| `dough` | massas de pizza, molho, queijo, fiambre, cogumelos (cada um com a sua cor) e teto | Poly Haven – *White Plaster 02* |
| `stainless` | inox: bancadas, equipamentos, tubo do dispensador | ambientCG – *Metal009* |
| `dark_steel` | aço escuro: rodapés, chapa, grelhas, puxadores | ambientCG – *Metal027* |
| `robot_paint` | braços robóticos | ambientCG – *PaintedMetal004* |
| `belt` | tapete rolante | ambientCG – *Rubber004* |
| `fire` | fogo dentro do forno | ambientCG – *Lava004* |
| `embers` | brasas do grelhador | ambientCG – *Lava001* |
| `plastic_white` | tampas dos ingredientes, óleo, LEDs, lâmpadas, tiras de LED, manjericão | ambientCG – *Plastic010* |
| `plastic_black` | abajures, azeitonas das pizzas | ambientCG – *Plastic006* |

## Créditos

- Three.js, lil-gui e OrbitControls: https://threejs.org (licença MIT)
- Texturas: [Poly Haven](https://polyhaven.com) (CC0) e [ambientCG](https://ambientcg.com) (CC0), conforme a tabela acima
