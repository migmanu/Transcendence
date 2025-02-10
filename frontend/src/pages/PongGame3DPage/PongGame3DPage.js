import { createSignal, createEffect } from '@reactivity';
import {
  createComponent,
  onCleanup,
  createCleanupContext,
  onMount,
  createMountContext,
} from '@component';

import {
  WebGPURenderer,
  BoxGeometry,
  MeshStandardMaterial,
  MeshNormalMaterial,
  Mesh,
  PerspectiveCamera,
  Scene,
  GridHelper,
  Clock,
  Group,
  Vector2,
  Vector3,
  PlaneGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  ACESFilmicToneMapping,
  Raycaster,
  MathUtils,
  Color,
  Fog,
  VSMShadowMap,
  AxesHelper,
  EquirectangularReflectionMapping,
  FloatType,
  HalfFloatType,
  PMREMGenerator,
  LinearColorSpace,
  LinearFilter,
  LinearEncoding,
  SRGBColorSpace,
  ClampToEdgeWrapping,
  DoubleSide,
  BackSide,
  CylinderGeometry,
  MeshPhysicalMaterial,
  FrontSide,
  PostProcessing,
  NormalBlending,
  AdditiveBlending,
  MeshBasicMaterial,
  NearestMipmapNearestFilter,
  ColorManagement,
  LinearMipmapLinearFilter,
  NearestFilter,
  SpriteMaterial,
  TextureLoader,
  Sprite,
} from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { pass, mrt, output, emissive, uniform, float } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

import Score from '@/components/Score/Score';
import GameBoard from '@/components/GameBoard/GameBoard';
import GameControls from '@/components/GameControls/GameControls';
import Ball from '@/game/Ball.js';
import Paddle from '@/game/Paddle.js';
import AIController from '@/game/AIController.js';
import lights from '@/game/lights.js';
import Firework from '@/game/Firework.js';
import HolographicMaterial from '@/game/HolographicMaterial.js';

import styles from './PongGame3DPage.module.css';

function lerp(from, to, speed) {
  const amount = (1 - speed) * from + speed * to;
  return Math.abs(from - to) < 0.001 ? to : amount;
}

export default function PongGame3DPage({ navigate }) {
  const cleanup = createCleanupContext();
  const mount = createMountContext();

  const clock = new Clock();

  const [size, setSize] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const fov = 75;
  //colors
  const params = {
    environment: {
      backgroundColor: 0xb499ff, //0x9e7aff,
      fog: {
        color: 0xb499ff, //0x9e7aff,
        near: 25,
        far: 250,
      },
    },
    colors: {
      plane: 0xb994ff, //0x9b71ea, //0x6966ff,
      paddleP1: 0x14d9c5, // 0x3633ff, //0x3633ff,
      paddleP2: 0xd90da2, // 0x363300, //0x3633ff,
      scoreP1: 0x14d9c5, // 0x3633ff, //0x3633ff,
      scoreP2: 0xd90da2, // 0x363300, //0x3633ff,
      ball: 0xffcc00, // 0xce47ff, //0xe63d05,
    },
    dimensions: {
      boundaries: new Vector2(20, 30),
      paddle: new Vector2(5, 1),
      ballRadius: 1,
    },
    positions: {
      ball: new Vector3(0, 0, 0),
      ballDirection: new Vector3(1, 0, 1),
      paddleP1: new Vector3(0, 0, 28),
      paddleP2: new Vector3(0, 0, -28),
    },
    score: {
      p1: 0,
      p2: 0,
      max: 3,
      info: {
        p1: { id: -1, name: 'Player One' },
        p2: { id: -1, name: 'Player Two' },
      },
    },
    bloom: {
      threshold: 0.0,
      strength: 1.0,
      radius: 0.0,
    },
  };

  // Font Loader

  let player2ScoreMesh, player1ScoreMesh, loadedFont, bloomPass;
  const TEXT_PARAMS = {
    size: 5,
    depth: 0.5,
    curveSegments: 16,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.15,
    bevelOffset: 0,
    bevelSegments: 8,
  };

  const scoreP1Material = new MeshStandardMaterial({
    color: params.colors.scoreP1,
  });
  const scoreP2Material = new MeshStandardMaterial({
    color: params.colors.scoreP2,
  });

  let scoreP1MessageMaterial;
  let scoreP2MessageMaterial;

  const scoreMessageGeometry = new PlaneGeometry(1, 1);

  const holographicMaterial = new HolographicMaterial({
    hologramColor: new Color('#00d5ff'),
    fresnelAmount: 0.7,
    blendMode: AdditiveBlending,
    scanlineSize: 30,
    signalSpeed: 1.0,
    hologramOpacity: 0.5,
    blinkFresnelOnly: true,
    hologramBrightness: 2,
    depthTest: false,
  });

  const fontLoader = new FontLoader();
  fontLoader.load(
    'assets/fonts/helvetiker_bold.typeface.json',
    function (font) {
      loadedFont = font;
      const geometry = new TextGeometry('0', {
        font: font,
        ...TEXT_PARAMS,
      });

      geometry.center();

      player1ScoreMesh = new Mesh(geometry, holographicMaterial);
      player2ScoreMesh = new Mesh(geometry, holographicMaterial);
      player1ScoreMesh.position.set(0, 16, params.dimensions.boundaries.y);
      player2ScoreMesh.position.set(0, 16, -params.dimensions.boundaries.y);

      player1ScoreMesh.castShadow = true;
      player2ScoreMesh.castShadow = true;

      scene.add(player2ScoreMesh, player1ScoreMesh);
    }
  );

  function getScoreGeometry(score) {
    const geometry = new TextGeometry(`${score}`, {
      font: loadedFont,
      ...TEXT_PARAMS,
    });

    geometry.center();
    return geometry;
  }

  let camera, renderer, gameRef, controls, postProcessing;

  // Scene Setup
  const scene = new Scene();
  scene.background = new Color(params.environment.backgroundColor);
  scene.fog = new Fog(
    params.environment.fog.color,
    params.environment.fog.near,
    params.environment.fog.far
  );

  scene.add(...lights);

  const axesHelper = new AxesHelper(5);
  axesHelper.position.y = -1;
  scene.add(axesHelper);
  const gridHelper = new GridHelper();
  scene.add(gridHelper);

  const stats = new Stats();

  const gui = new GUI();

  const sceneFolder = gui.addFolder('Scene').close();
  sceneFolder
    .addColor(params.colors, 'paddleP1')
    .name('Player 1 Paddle Color')
    .onChange((val) => {
      player1Paddle.material.color.set(val);
    });
  sceneFolder
    .addColor(params.colors, 'scoreP1')
    .name('Player 1 Score Color')
    .onChange((val) => {
      player1ScoreMesh.material.color.set(val);
    });
  sceneFolder
    .addColor(params.colors, 'paddleP2')
    .name('Player 2 Paddle Color')
    .onChange((val) => {
      player2Paddle.material.color.set(val);
    });
  sceneFolder
    .addColor(params.colors, 'scoreP2')
    .name('Player 2 Score Color')
    .onChange((val) => {
      player2ScoreMesh.material.color.set(val);
    });
  sceneFolder
    .addColor(params.colors, 'ball')
    .name('Ball Color')
    .onChange((val) => {
      ball.material.color.set(val);
    });
  sceneFolder
    .addColor(params.colors, 'plane')
    .name('Plane Color')
    .onChange((val) => {
      planeMaterial.color.set(val);
    });
  sceneFolder
    .add(params.environment.fog, 'near', 0, 100, 1)
    .name('Near')
    .onChange((val) => {
      scene.fog.near = val;
    });
  sceneFolder
    .add(params.environment.fog, 'far', 50, 1000, 1)
    .name('Far')
    .onChange((val) => {
      scene.fog.far = val;
    });
  sceneFolder
    .addColor(params.environment, 'backgroundColor')
    .name('Background Color')
    .onChange((val) => {
      scene.background.set(val);
    });
  sceneFolder
    .addColor(params.environment.fog, 'color')
    .name('Fog Color')
    .onChange((val) => {
      scene.fog.color.set(val);
    });

  const bloomFolder = gui.addFolder('Bloom').close();
  bloomFolder
    .add(params.bloom, 'threshold', 0, 1, 1)
    .name('Bloom Threshold')
    .onChange((value) => {
      bloomPass.threshold.value = value;
    });
  bloomFolder
    .add(params.bloom, 'strength', 0.0, 10.0)
    .name('Bloom Strength')
    .onChange((value) => {
      bloomPass.strength.value = value;
    });
  bloomFolder
    .add(params.bloom, 'radius', 0.0, 1.0, 0.01)
    .name('Bloom Radius')
    .onChange((value) => {
      bloomPass.radius.value = value;
    });

  const holoFolder = gui.addFolder('Holographic Material').close();
  holoFolder
    .add(holographicMaterial.fresnelOpacityNode, 'value')
    .min(0)
    .max(1)
    .step(0.01)
    .name('Fresnel Opacity');
  holoFolder
    .add(holographicMaterial.fresnelAmountNode, 'value')
    .min(0)
    .max(2)
    .step(0.01)
    .name('Fresnel Amount');
  holoFolder
    .add(holographicMaterial.scanlineSizeNode, 'value')
    .min(0)
    .max(20)
    .step(0.01)
    .name('Scanline Size');
  holoFolder
    .add(holographicMaterial.hologramBrightnessNode, 'value')
    .min(0)
    .max(2)
    .step(0.01)
    .name('Hologram Brightness');
  holoFolder
    .add(holographicMaterial.signalSpeedNode, 'value')
    .min(0)
    .max(2)
    .step(0.01)
    .name('Signal Speed');
  holoFolder
    .addColor(
      {
        HologramColor: holographicMaterial.hologramColorNode.value.getStyle(),
      },
      'HologramColor'
    )
    .onChange((color) => {
      holographicMaterial.hologramColorNode.value.setStyle(color);
      holographicMaterial.needsUpdate = true;
    });
  holoFolder
    .add(holographicMaterial.enableBlinkingNode, 'value')
    .name('Enable Blinking');
  holoFolder
    .add(holographicMaterial.blinkFresnelOnlyNode, 'value')
    .name('Blink Fresnel Only');
  holoFolder
    .add(holographicMaterial.hologramOpacityNode, 'value')
    .min(0)
    .max(1)
    .step(0.01)
    .name('Hologram Opacity');

  // Cursor
  const cursor = new Vector2(0, 0);
  const raycaster = new Raycaster();

  window.addEventListener('mousemove', (e) => {
    cursor.x = 2 * (e.clientX / window.innerWidth) - 1;
    cursor.y = -2 * (e.clientY / window.innerHeight) + 1;
  });

  // Plane
  const planeGeometry = new PlaneGeometry(
    params.dimensions.boundaries.x * 20,
    params.dimensions.boundaries.y * 20,
    params.dimensions.boundaries.x * 20,
    params.dimensions.boundaries.y * 20
  );
  planeGeometry.rotateX(-Math.PI * 0.5);
  const planeMaterial = new MeshStandardMaterial({
    color: params.colors.plane,
    // wireframe: true,
    // transparent: true,
    // opacity: 0.1,
  });

  const plane = new Mesh(planeGeometry, planeMaterial);
  // plane.castShadow = true;
  plane.receiveShadow = true;
  plane.position.y = -1.5;
  scene.add(plane);

  /**
   *
   **/
  const coliseumGeometry = new RoundedBoxGeometry(
    params.dimensions.boundaries.x * 2 + 1,
    3.5,
    params.dimensions.boundaries.y * 2 + 1,
    8,
    1.5
  );

  const coliseumMaterial = new MeshPhysicalMaterial({
    transparent: true,
    roughness: 0.15,
    transmission: 1.0,
    ior: 1.15,
    envMapIntensity: 25,
    transparent: true,
    opacity: 1.0,
    metalness: 0,
    thickness: 2.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0,
    // side: BackSide,
  });

  const coliseum = new Mesh(coliseumGeometry, coliseumMaterial);

  const platformGeometry = new RoundedBoxGeometry(
    params.dimensions.boundaries.x * 4,
    2,
    params.dimensions.boundaries.y * 4,
    8,
    3
  );
  platformGeometry.translate(0, -0.5, 0);

  const platformMaterial = new MeshStandardMaterial({
    metalness: 1.5,
    roughness: 0.25,
    flatShading: true,
    side: FrontSide,
  });

  const platformBrush = new Brush(platformGeometry, platformMaterial);
  const coliseumBrush = new Brush(coliseumGeometry, coliseumMaterial);

  const finalPlatform = new Evaluator().evaluate(
    platformBrush,
    coliseumBrush,
    SUBTRACTION
  );

  scene.add(coliseum);
  scene.add(finalPlatform);
  /**/

  // const boundGeometry = new RoundedBoxGeometry(
  //   1,
  //   2,
  //   params.dimensions.boundaries.y * 2,
  //   5,
  //   0.5
  // );
  // const boundMaterial = new MeshStandardMaterial({ color: 0xdddddd });
  // const rightBound = new Mesh(boundGeometry, boundMaterial);
  // rightBound.position.x = params.dimensions.boundaries.x + 1;
  // const leftBound = rightBound.clone();
  // leftBound.position.x *= -1;

  // leftBound.castShadow = true;
  // // leftBound.receiveShadow = true;
  // rightBound.castShadow = true;
  // rightBound.receiveShadow = true;

  // scene.add(leftBound);
  // scene.add(rightBound);

  const player1Paddle = new Paddle(
    scene,
    params.dimensions,
    params.positions.paddleP1,
    params.colors.paddleP1
  );
  const bloomIntensity = 1;
  player1Paddle.material.mrtNode = mrt({
    bloomIntensity: uniform(bloomIntensity),
  });

  const player2Paddle = new Paddle(
    scene,
    params.dimensions,
    params.positions.paddleP2,
    params.colors.paddleP2
  );
  player2Paddle.material.mrtNode = mrt({
    bloomIntensity: uniform(bloomIntensity),
  });

  const ball = new Ball(
    scene,
    params.dimensions.boundaries,
    [player1Paddle, player2Paddle],
    params.colors.ball
  );
  ball.material.mrtNode = mrt({
    bloomIntensity: uniform(bloomIntensity),
  });

  // Pong Model
  // new GLTFLoader().load('assets/models/pong-v1.glb', (gltf) => {
  //   console.log('gltf', gltf);
  //   console.log('gltf.scene', gltf.scene);
  //   // s.position.set(0, 35, 0);
  //   // s.rotation.set(0, 0, Math.PI / 2);
  //   // s.scale.set(10, 10, 10);
  //   // gltf.scene.traverse((child) => {
  //   //   if (child.material) {
  //   //     child.material.polygonOffset = true;
  //   //     child.material.polygonOffsetFactor = -1;
  //   //     child.material.polygonOffsetUnits = -1;
  //   //     child.material.side = DoubleSide;
  //   //   }
  //   // if (child.isMesh) {
  //   //   const normalHelper = new VertexNormalsHelper(child, 0.5, 0xff0000);
  //   //   scene.add(normalHelper);
  //   // }
  //   // });
  //   const s = gltf.scene;
  //   s.scale.x *= -1;
  //   scene.add(s);
  // });

  const fireworks = [];

  const controller = new AIController(player2Paddle, ball);

  //

  onMount(() => {
    const container = window.document.querySelector('.container');
    if (gameRef) {
      setSize({
        width: window.innerWidth,
        height: container.getBoundingClientRect().height,
      });
    }

    init();

    window.addEventListener('resize', () => {
      if (!renderer || !camera) return;
      setSize({
        width: window.innerWidth,
        height: container.getBoundingClientRect().height,
      });
      const { width, height } = size();

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(pixelRatio);
    });

    onCleanup(() => {
      resizeObserver.disconnect();
      device?.destroy();
      fireworks.forEach((f) => f.die());
    });
  });

  let adapter, device, format;

  async function initWebGPU() {
    if (!navigator.gpu) throw new Error('WebGPU not supported');
    adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No WebGPU adapter found');
    device = await adapter.requestDevice();
    format = navigator.gpu.getPreferredCanvasFormat();
    return {
      adapter,
      device,
      format,
    };
  }

  const init = async () => {
    try {
      const { adap, devi, form } = await initWebGPU();

      renderer = new WebGPURenderer({
        antialias: window.devicePixelRatio < 2,
        // device: devi,
        // format: form,
        // logarithmicDepthBuffer: true,
      });
      renderer.init();
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = VSMShadowMap;
      renderer.setPixelRatio(window.devicePixelRatio);

      // environment
      // const hdr = 'assets/images/shanghai_bund_4k.hdr';
      // const hdr = 'assets/images/kloppenheim_02_puresky_2k.hdr';
      // const hdr = 'assets/images/kloppenheim_03_puresky_2k.hdr';
      // const hdr = 'assets/images/autumn_field_puresky_2k.hdr';

      const hdr = 'assets/images/hdris/autumn_field_puresky_4k.hdr.jpg';

      // NOTE: loader for hdri
      // // let environmentTexture;
      // const pmremGenerator = new PMREMGenerator(renderer);
      // pmremGenerator.compileEquirectangularShader();

      // const loadEnv = async () => {
      //   new RGBELoader().loadAsync(hdr).then((texture) => {
      //     // environmentTexture = texture;
      //     // environmentTexture.mapping = EquirectangularReflectionMapping;
      //     // environmentTexture.needsUpdate = true;

      //     texture.mapping = EquirectangularReflectionMapping;
      //     // texture.colorSpace = LinearColorSpace;
      //     texture.colorSpace = SRGBColorSpace;
      //     texture.minFilter = LinearFilter;
      //     texture.magFilter = LinearFilter;
      //     texture.generateMipmaps = false;

      //     const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      //     texture.dispose();

      //     scene.environment = envMap;
      //     scene.environmentIntensity = 0.75;
      //     scene.background = envMap;
      //     scene.backgroundIntensity = 0.75;
      //     scene.backgroundBlurriness = 0.0;
      //   });
      // };

      // loadEnv();

      // NOTE: Loader for hdri+jpg
      // let loader = new UltraHDRLoader();
      // // loader.setDataType(FloatType);
      // loader.setDataType(HalfFloatType);

      // const loadEnvironment = async () => {
      //   loader.load(hdr, (texture) => {
      //     texture.mapping = EquirectangularReflectionMapping;
      //     texture.colorSpace = SRGBColorSpace;
      //     texture.wrapS = ClampToEdgeWrapping;
      //     texture.wrapT = ClampToEdgeWrapping;
      //     texture.minFilter = LinearFilter;
      //     texture.magFilter = LinearFilter;
      //     texture.generateMipmaps = false;

      //     scene.background = texture;
      //     // scene.backgroundIntensity = 0.75;
      //     scene.backgroundBlurriness = 0.0;
      //     scene.environment = texture;
      //     // scene.environmentIntensity = 0.75;
      //   });
      // };

      // loadEnvironment();

      //

      const { width, height } = size();

      renderer.setSize(width, height);
      camera = new PerspectiveCamera(fov, width / height, 0.1, 10000);
      // camera.position.set(0, 20, 45);
      camera.position.set(0, 25, 50);
      camera.lookAt(new Vector3(0, 5, 0));

      /**
       **/
      const pingTexture = await new TextureLoader().loadAsync(
        'assets/images/ping.webp'
      );
      const pongTexture = await new TextureLoader().loadAsync(
        'assets/images/pong.webp'
      );

      scoreP1MessageMaterial = new HolographicMaterial({
        useMap: true,
        map: pongTexture,
        hologramColor: new Color(params.colors.paddleP1),
        fresnelAmount: 0.7,
        blendMode: AdditiveBlending,
        scanlineSize: 3.7,
        signalSpeed: 4.0,
        hologramOpacity: 0.0,
        hologramBrightness: 2.0,
        blinkFresnelOnly: false,
        enableBlinking: true,
      });
      scoreP2MessageMaterial = new HolographicMaterial({
        useMap: true,
        map: pingTexture,
        hologramColor: new Color(params.colors.paddleP2),
        fresnelAmount: 0.7,
        blendMode: AdditiveBlending,
        scanlineSize: 3.7,
        signalSpeed: 4.0,
        hologramOpacity: 0.0,
        hologramBrightness: 2.0,
        blinkFresnelOnly: false,
        enableBlinking: true,
      });

      const scoreMessageP1 = new Mesh(
        scoreMessageGeometry,
        scoreP1MessageMaterial
      );
      scoreMessageP1.scale.set(
        params.dimensions.boundaries.y * 2,
        params.dimensions.boundaries.x * 2,
        1
      );
      scoreMessageP1.rotateX(-Math.PI * 0.5);
      scoreMessageP1.rotateZ(Math.PI * 0.5);
      scoreMessageP1.position.set(0, -1, 0);

      const scoreMessageP2 = new Mesh(
        scoreMessageGeometry,
        scoreP2MessageMaterial
      );
      scoreMessageP2.scale.set(
        params.dimensions.boundaries.y * 2,
        params.dimensions.boundaries.x * 2,
        1
      );
      scoreMessageP2.rotateX(-Math.PI * 0.5);
      scoreMessageP2.rotateZ(Math.PI * 0.5);
      scoreMessageP2.position.set(0, -1, 0);
      scene.add(scoreMessageP1);
      scene.add(scoreMessageP2);
      /**
       **/
      function triggerScoreEffect(player) {
        let mesh;
        if (player === 'p1') {
          mesh = scoreMessageP1;
        } else {
          mesh = scoreMessageP2;
        }
        mesh.visible = true;
        mesh.material.hologramOpacityNode.value = 1.0;
        mesh.material.hologramBrightnessNode.value = 3.0;

        setTimeout(() => {
          mesh.visible = false;
          mesh.material.hologramOpacityNode.value = 0.0;
        }, 800);
      }

      ball.addEventListener('onGoal', (e) => {
        params.score[e.message] += 1;
        const mesh = e.message === 'p2' ? player2ScoreMesh : player1ScoreMesh;
        const geometry = getScoreGeometry(params.score[e.message]);
        mesh.geometry.dispose();
        mesh.geometry = geometry;

        triggerScoreEffect(e.message);

        const firework = new Firework(
          20,
          3,
          e.message === 'player2'
            ? player2ScoreMesh.position
            : player1ScoreMesh.position
        );
        scene.add(firework.mesh);
        fireworks.push(firework);
      });

      ball.addEventListener('collide', () => {
        const firework = new Firework(50, 5, ball.mesh.position);
        scene.add(firework.mesh);
        fireworks.push(firework);
      });

      gameRef.appendChild(renderer.domElement);
      gameRef.appendChild(stats.dom);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      /**
       **/
      const scenePass = pass(scene, camera);
      scenePass.setMRT(
        mrt({
          output,
          bloomIntensity: float(0), // default bloom intensity
        })
      );

      const outputPass = scenePass.getTextureNode();
      const bloomIntensityPass = scenePass.getTextureNode('bloomIntensity');

      bloomPass = bloom(outputPass.mul(bloomIntensityPass));
      bloomPass.threshold.value = params.bloom.threshold;
      bloomPass.strength.value = params.bloom.strength;
      bloomPass.radius.value = params.bloom.radius;

      postProcessing = new PostProcessing(renderer);
      postProcessing.outputColorTransform = false;
      postProcessing.outputNode = outputPass.add(bloomPass).renderOutput();
      /**
       **/

      renderer.setAnimationLoop(animate);
    } catch (error) {
      console.error('WebGPU setup failed:', error);
    }
  };

  function animate() {
    /**
     * Time between frames
     */
    const deltaTime = clock.getDelta();

    raycaster.setFromCamera(cursor, camera);
    const [intersection] = raycaster.intersectObject(plane);

    const dt = deltaTime * 0.1;

    for (let i = 0; i < 10; i++) {
      if (intersection) {
        const nextX = intersection.point.x;
        const prevX = player1Paddle.mesh.position.x;
        player1Paddle.setX(lerp(prevX, nextX, 0.5));
      }

      ball.update(dt);
      controller.update(dt);
    }

    fireworks.forEach((firework, index) => {
      if (firework.isDie) {
        scene.remove(firework.mesh);
        fireworks.splice(index, 1);
      } else {
        firework.update(deltaTime);
      }
    });

    controls.update();

    holographicMaterial.update();
    scoreP1MessageMaterial.update();
    scoreP2MessageMaterial.update();

    postProcessing.render();
    // renderer.render(scene, camera);
    stats.update();
  }

  return createComponent('div', {
    className: `${styles.gameWrapper}`,
    children: [],
    ref: (element) => (gameRef = element),
    cleanup,
    mount,
  });
}
