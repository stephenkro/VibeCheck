import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";
import CANNON from "cannon";

/**
 * Loaders
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

// Textures

const floorColorTexture = textureLoader.load(
  "/textures/floor/fine_grained_wood_col_1k.jpg"
);
const floorNormalTexture = textureLoader.load(
  "/textures/floor/fine_grained_wood_normal_1k.jpg"
);
const floorAmbientTexture = textureLoader.load(
  "/textures/floor/fine_grained_wood_ao_1k.jpg"
);
const floorRoughTexture = textureLoader.load(
  "/textures/floor/fine_grained_wood_rough_1k.jpg"
);

floorColorTexture.repeat.set(8, 8);
floorAmbientTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorRoughTexture.repeat.set(8, 8);

floorColorTexture.wrapS = THREE.RepeatWrapping;
floorAmbientTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorRoughTexture.wrapS = THREE.RepeatWrapping;

floorColorTexture.wrapT = THREE.RepeatWrapping;
floorAmbientTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorRoughTexture.wrapT = THREE.RepeatWrapping;

const particleTexture = textureLoader.load("/textures/particles/13.png");
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Debug
 */
const gui = new dat.GUI();

/**
 * Physics
 */

const world = new CANNON.World();
world.gravity.set(0, -10, 0);

const sphereShape = new CANNON.Sphere(1);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 5, 0),
  shape: sphereShape,
});
world.addBody(sphereBody);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
world.defaultContactMaterial = defaultContactMaterial;

/**
 * Environment Map
 */

const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/1/px.jpg",
  "/textures/environmentMaps/1/nx.jpg",
  "/textures/environmentMaps/1/py.jpg",
  "/textures/environmentMaps/1/ny.jpg",
  "/textures/environmentMaps/1/pz.jpg",
  "/textures/environmentMaps/1/nz.jpg",
]);

// environmentMap.encoding = THREE.sRGBEncoding
// scene.background = environmentMap
// scene.environment = environmentMap

/**
 * Floor
 */
const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 32, 32);
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture,
  aoMap: floorAmbientTexture,
  normalMap: floorNormalTexture,
  roughnessMap: floorRoughTexture,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

/**
 *  Test Object
 */

const geometry = new THREE.SphereBufferGeometry(1, 16, 16);
const material = new THREE.MeshStandardMaterial();

const sphere = new THREE.Mesh(geometry, material);
sphere.position.y = 1;
scene.add(sphere);

/**
 * Rain
 */
const rainParameters = {};
rainParameters.count = 5000;
rainParameters.velocity = 0;

// const rainPositions = new Float32Array(rainParameters.count * 3)

// const rainGeometry = new THREE.BufferGeometry()
const rainMaterial = new THREE.PointsMaterial({
  map: particleTexture,
  color: "#91a3b0",
  size: 2,
  sizeAttenuation: true,
  transparent: true,
  alphaMap: particleTexture,
  alphaTest: 0.001,
  blending: THREE.AdditiveBlending,
});

const rainGeometry = new THREE.Geometry();
for (let i = 0; i < rainParameters.count; i++) {
  let rainDrop = new THREE.Vector3(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
  rainDrop.velocity = {};
  rainDrop.velocity = 0;
  rainGeometry.vertices.push(rainDrop);
}

const rain = new THREE.Points(rainGeometry, rainMaterial);

scene.add(rain);

gui
  .add(rainParameters, "count")
  .min(500)
  .max(5000)
  .step(10)
  .name("rainCount")
  .onFinishChange(() => {});

const rainAnimation = () => {
  rainGeometry.vertices.forEach((drop) => {
    drop.velocity -= 0.1 + Math.random() * 0.1;
    drop.y += drop.velocity;

    if (drop.y < -10) {
      drop.y = 100;
      drop.velocity = -1;
    }
  });
  rainGeometry.verticesNeedUpdate = true;
};

// console.log(rainGeometry.attributes.position)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
// scene.add(ambientLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 10, 10);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// Object controls movement

document.addEventListener("keydown", (event) => {
  let elapsedTime = clock.getElapsedTime();
  if (event.key === "w") {
    sphereBody.position.z -= 1.5;
  }
  if (event.key === "d") {
    sphereBody.position.x += 1.5;
  }
  if (event.key === "a") {
    sphereBody.position.x -= 1.5;
  }
  if (event.key === "s") {
    sphereBody.position.z += 1.5;
  }
  if (event.key === "g") {
    sphereBody.position.y += 2.5;
  }
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  // Rain falling
  rainAnimation();

  // Update physics world
  world.step(1 / 60, deltaTime, 3);
  sphere.position.copy(sphereBody.position);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
