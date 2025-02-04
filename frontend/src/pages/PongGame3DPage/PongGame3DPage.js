import { createSignal, createEffect } from '@reactivity';
import {
  createComponent,
  onCleanup,
  createCleanupContext,
  onMount,
  createMountContext,
} from '@component';

import {
  BoxGeometry,
  MeshStandardMaterial,
  MeshNormalMaterial,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGPURenderer,
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
} from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import Score from '@/components/Score/Score';
import GameBoard from '@/components/GameBoard/GameBoard';
import GameControls from '@/components/GameControls/GameControls';
import Ball from '@/game/Ball.js';
import Paddle from '@/game/Paddle.js';

import styles from './PongGame3DPage.module.css';

export default function PongGame3DPage({ navigate }) {
  const cleanup = createCleanupContext();
  const mount = createMountContext();

  const clock = new Clock();

  const [size, setSize] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const fov = 60;
  const data = {
    color: 0x00ff00,
    lightColor: 0xffffff,
    planeColor: 0x994ff,
    fogColor: 0xb499ff,
    fogNear: 25,
    fogFar: 150,
    paddleColor: 0x3633ff,
    ballColor: 0xce47ff,
  };
  let camera, renderer, gameRef, controls;

  // Scene Setup
  const scene = new Scene();

  const gridHelper = new GridHelper();
  scene.add(gridHelper);

  // const helpers = new Group();
  // helpers.visible = true;
  // scene.add(helpers);

  const stats = new Stats();
  const gui = new GUI();
  // gui.add(helpers, 'visible').name('helpers');

  // Cursor
  const cursor = new Vector2(0, 0);
  const raycaster = new Raycaster();

  window.addEventListener('mousemove', (e) => {
    cursor.x = 2 * (e.clientX / window.innerWidth) - 1;
    cursor.y = -2 * (e.clientY / window.innerHeight) + 1;
  });

  const boundaries = new Vector2(20, 20);
  // Plane
  const planeGeometry = new PlaneGeometry(
    boundaries.x * 20,
    boundaries.y * 20,
    boundaries.x * 20,
    boundaries.y * 20
  );
  planeGeometry.rotateX(-Math.PI * 0.5);
  const planeMaterial = new MeshNormalMaterial({ wireframe: true });

  const plane = new Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  const boundGeometry = new RoundedBoxGeometry(1, 2, boundaries.y * 2, 5, 0.5);
  const boundMaterial = new MeshNormalMaterial();
  const leftBound = new Mesh(boundGeometry, boundMaterial);
  leftBound.position.x = -boundaries.x - 0.25;
  const rightBound = leftBound.clone();
  rightBound.position.x *= -1;

  scene.add(leftBound);
  scene.add(rightBound);

  const ball = new Ball(scene, boundaries);
  const playerPaddle = new Paddle(scene, new Vector3(0, 0, 15));
  const pcPaddle = new Paddle(scene, new Vector3(0, 0, -15));

  const directionalLight = new DirectionalLight(data.lightColor, Math.PI);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const directionalLightHelper = new DirectionalLightHelper(directionalLight);
  directionalLightHelper.visible = false;
  scene.add(directionalLightHelper);

  const directionalLightFolder = gui.addFolder('DirectionalLight');
  directionalLightFolder.add(directionalLight, 'visible');
  directionalLightFolder.addColor(data, 'lightColor').onChange(() => {
    directionalLight.color.set(data.lightColor);
  });
  directionalLightFolder.add(directionalLight, 'intensity', 0, Math.PI * 10);

  const directionalLightFolderControls =
    directionalLightFolder.addFolder('Controls');
  directionalLightFolderControls
    .add(directionalLight.position, 'x', -1, 1, 0.001)
    .onChange(() => {
      directionalLightHelper.update();
    });
  directionalLightFolderControls
    .add(directionalLight.position, 'y', -1, 1, 0.001)
    .onChange(() => {
      directionalLightHelper.update();
    });
  directionalLightFolderControls
    .add(directionalLight.position, 'z', -1, 1, 0.001)
    .onChange(() => {
      directionalLightHelper.update();
    });
  directionalLightFolderControls
    .add(directionalLightHelper, 'visible')
    .name('Helper Visible');
  directionalLightFolderControls.close();

  onMount(() => {
    if (gameRef) {
      console.log('Game Ref:', gameRef);
      setSize({
        width: window.innerWidth,
        height: gameRef.offsetHeight,
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      setSize({
        width: window.innerWidth,
        height: gameRef.offsetHeight,
      });
      const { width, height } = size();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(gameRef);

    onCleanup(() => resizeObserver.disconnect());

    init();
  });

  const init = async () => {
    if (!navigator.gpu) {
      alert('WebGPU not supported. Falling back to WebGL');
      return;
    }

    try {
      const { width, height } = size();

      camera = new PerspectiveCamera(fov, width / height, 0.1, 1000);
      camera.position.set(-10, 20, 40);
      camera.lookAt(0, 2.5, 0);

      // WebGPU Renderer setup
      renderer = new WebGPURenderer({ antialias: true });
      // renderer.toneMapping = ACESFilmicToneMapping;
      // renderer.toneMappingExposure = 0.333;
      // renderer.shadowMap.enabled = true;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      renderer.setAnimationLoop(animate);
      gameRef.appendChild(renderer.domElement);
      gameRef.appendChild(stats.dom);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
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

    if (intersection) {
      playerPaddle.mesh.position.x = intersection.point.x;
    }

    ball.update(deltaTime);
    pcPaddle.mesh.position.x = ball.mesh.position.x;

    controls.update();

    renderer.render(scene, camera);
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
