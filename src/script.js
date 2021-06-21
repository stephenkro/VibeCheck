import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";
import CANNON, { ContactMaterial } from "cannon";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls"
import { Vector2 } from "three";

/**
 * Loaders
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader()

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

const particleTexture = textureLoader.load("/textures/particles/13.png");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Background
scene.background = new THREE.Color('#99a7ba')
// scene.fog = new THREE.Color('#87a2c7')

/**
 * Debug
 */
const gui = new dat.GUI();

/**
 * Models
 */


// Desk area

gltfLoader.load('/models/Models/GLTF format/deskCorner.glb',(gltf)=> {
    gltf.scene.position.set(0,0,-15)
    gltf.scene.scale.set(10,10,10)
    scene.add(gltf.scene)
})

gltfLoader.load('/models/Models/GLTF format/chairDesk.glb',(gltf)=> {
    gltf.scene.position.set(5.3,0,-17)
    gltf.scene.scale.set(9.5,9.5,9.5)
    gltf.scene.rotation.y = (Math.PI * 3) / 4 
    scene.add(gltf.scene)
})
gltfLoader.load('/models/Models/GLTF format/speaker.glb',(gltf)=> {
  gltf.scene.position.set(-3,0,-23)
  gltf.scene.scale.set(10,10,10)
  scene.add(gltf.scene)
})

gltfLoader.load('/models/Models/GLTF format/pottedPlant.glb',(gltf)=> {
  gltf.scene.position.set(13,0,-23)
  gltf.scene.scale.set(10,10,10)
  scene.add(gltf.scene)
})


gltfLoader.load('/models/Models/GLTF format/computerScreen.glb',(gltf)=> {
  gltf.scene.position.set(2,4,-23)
  gltf.scene.scale.set(9.5,9.5,9.5)
  
  scene.add(gltf.scene)
})

gltfLoader.load('/models/Models/GLTF format/computerKeyboard.glb',(gltf)=> {
  gltf.scene.position.set(2.5,4,-21)
  gltf.scene.scale.set(9.5,9.5,9.5)
  
  scene.add(gltf.scene)
})

gltfLoader.load('/models/Models/GLTF format/computerMouse.glb',(gltf)=> {
  gltf.scene.position.set(6,4,-21)
  gltf.scene.scale.set(9.5,9.5,9.5)
  
  scene.add(gltf.scene)
})


// Lounge area

gltfLoader.load('/models/Models/GLTF format/tableCoffeeGlass.glb',(gltf)=> {
  gltf.scene.position.set(12,0,13)
  gltf.scene.scale.set(10,10,10)
  scene.add(gltf.scene)
})

gltfLoader.load('/models/Models/GLTF format/loungeSofaCorner.glb',(gltf)=> {
  gltf.scene.position.set(12,0,13)
  gltf.scene.scale.set(9.5,9.5,9.5)
  gltf.scene.rotation.y = -(Math.PI)/ 2
    scene.add(gltf.scene)
})
gltfLoader.load('/models/Models/GLTF format/loungeChairRelax.glb',(gltf)=> {
  gltf.scene.position.set(6,0,18)
  gltf.scene.scale.set(9.5,9.5,9.5)
  gltf.scene.rotation.y = -(Math.PI) * 1.25
  scene.add(gltf.scene)
})
gltfLoader.load('/models/Models/GLTF format/radio.glb',(gltf)=> {
  gltf.scene.position.set(9,2,13)
  gltf.scene.scale.set(8,8,8)
  scene.add(gltf.scene)
})

// Stairway Area

gltfLoader.load('/models/Models/GLTF format/stairsOpenSingle.glb',(gltf)=> {
  gltf.scene.position.set(-15,0,15)
  gltf.scene.scale.set(9,9,9)
  gltf.scene.rotation.y = Math.PI / 2
  scene.add(gltf.scene)
})

/**
 * Audio 
 */
 const rainSound = new Audio('/sounds/rain-sound.wav')
 const audioObj = {}
 audioObj.rainSoundStatus = false
 audioObj.rainSoundControl = () => {
  if(audioObj.rainSoundStatus === false){
    rainSound.play()
    rainSound.loop = true
    audioObj.rainSoundStatus = true
  }
  else if(audioObj.rainSoundStatus === true){
    rainSound.pause()
    audioObj.rainSoundStatus = false
  }
 }


 gui.add(audioObj,'rainSoundControl').name('Rain Sound')



/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.45 );
hemiLight.position.set( 0.5, 1, 0.75 );



/**
 * Physics
 */

const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -20, 0);

const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.4,
    restitution: 0.9,
  }
);
world.defaultContactMaterial = defaultContactMaterial;

const sphereShape = new CANNON.Sphere(1);
const sphereBody = new CANNON.Body({
  mass: 2,
  position: new CANNON.Vec3(-3, 6, 0),
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

const secondFloorShape = new CANNON.Box(new CANNON.Vec3(7.5,5,0.1))
const secondFloorBody = new CANNON.Body({
  mass: 0,
  shape: secondFloorShape,
  position: new CANNON.Vec3(-16,12,-7),
  material: defaultMaterial
});
secondFloorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(secondFloorBody);


const coffeeTableShape = new CANNON.Box(new CANNON.Vec3(6.5/2 , 4.5/2, 4.5/2))
const coffeeTableBody = new CANNON.Body({
  mass:0, 
  shape: coffeeTableShape, 
  position: new  CANNON.Vec3(10.5, 0, 12),
  material: defaultMaterial
})

world.addBody(coffeeTableBody)

// const table = new THREE.BoxBufferGeometry(6.5, 4.5, 4.5)
// const tableMaterial = new THREE.MeshStandardMaterial()
// const tableMesh = new THREE.Mesh(table, tableMaterial)
// tableMesh.position.set(10.5, 0, 12)
// scene.add(tableMesh)


/**
 * Floor
 */
const floorGeometry = new THREE.PlaneBufferGeometry(50, 50, 32, 32);
const secondFloorGeometry = new THREE.BoxBufferGeometry(15,10,1)
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture,
  aoMap: floorAmbientTexture,
  normalMap: floorNormalTexture,
  roughnessMap: floorRoughTexture,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
// floor.receiveShadow = true

const secondFloor = new THREE.Mesh(secondFloorGeometry, floorMaterial)
secondFloor.rotation.x = -Math.PI / 2; 
;
secondFloor.position.set(-16,12,-7)


scene.add(floor);
scene.add(secondFloor)

/**
 *  Test Object
 */

const geometry = new THREE.SphereBufferGeometry(1, 16, 16);
const material = new THREE.MeshStandardMaterial();

const sphere = new THREE.Mesh(geometry, material);
sphere.position.y = 1;
// sphere.castShadow = true
scene.add(sphere);

/**
 * Rain
 */
const rainParameters = {};
rainParameters.rainStatus = false
rainParameters.sunnyStatus = false
rainParameters.count = 5000;
rainParameters.velocity = 0;
rainParameters.rainControl = () => {
   if(rainParameters.rainStatus === false){
    scene.remove(rain)
    rainParameters.rainStatus = true
   }
  else if(rainParameters.rainStatus === true){
    scene.add(rain)
    rainParameters.rainStatus = false
  }
  
}
rainParameters.sunnyControl = () => {
  const hemiLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  if(rainParameters.sunnyStatus === false){
    scene.background = new THREE.Color('#fde1cc')
    rainParameters.sunnyStatus = true
    
  } else {
    scene.background = new THREE.Color('#99a7ba')
    scene.remove(hemiLight) 
    rainParameters.sunnyStatus = false
  }
}

gui.add(rainParameters, 'rainControl').name('Rain On/Off')
gui.add(rainParameters, 'sunnyControl').name('Sunny On/Off')

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
    (Math.random() - 0.5) * 75,
    (Math.random() - 0.5) * 75,
    (Math.random() - 0.5) * 75
  );
  rainDrop.velocity = {};
  rainDrop.velocity = 0;
  rainGeometry.vertices.push(rainDrop);
}

const rain = new THREE.Points(rainGeometry, rainMaterial);

scene.add(rain);



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


// Create Objects to interact 
const interactObj = {}
const objectsToUpdate = []

interactObj.createBox = () => {
  createBox(
      Math.random() * 5,
      Math.random()* 5,
      Math.random() * 5,
      {
          x: (Math.random() - 0.5) * 10, 
          y: (Math.random() * 10), 
          z: (Math.random() - 0.5) * 10
      }
      
      )
}
interactObj.removeBox = () => {
  for(const object of objectsToUpdate){
      // Remove body
      // object.body.removeEventListener('collide', playHitSound)
      world.removeBody(object.body)

      // Remove mesh 
      scene.remove(object.mesh)

  }
}
interactObj.reset = () => {
  sphereBody.position.set(0,1,0)
}


const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3, 
    roughness: 0.4, 
   
})

const createBox = (width, height, depth, position) => {
  // Three.js mesh
  const mesh = new THREE.Mesh(
      boxGeometry,
      boxMaterial
  )
  mesh.scale.set(width, height, depth)
  mesh.castShadow = true 
  mesh.position.copy(position)
  scene.add(mesh)

  // Cannon.js body
  const shape = new CANNON.Box(new CANNON.Vec3(width/2 , height/2, depth/2))
  const body = new CANNON.Body({
      mass:1,
      position: new CANNON.Vec3(0,20,0),
      shape,
      material: defaultMaterial
  })
  body.position.copy(position)
  world.addBody(body)

  //  Save in objects to update
  objectsToUpdate.push({
      mesh:mesh,
      body:body
  })


}

// Controls for Interacting Objects
gui.add(interactObj, 'createBox').name('Add Box')
gui.add(interactObj, 'removeBox').name('Remove Boxes')
gui.add(interactObj, 'reset').name('Reset Position')




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
camera.position.set(0, 10, 20);
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


// Player controls movement

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
    sphereBody.position.y += 3.5;
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
  for(const object of objectsToUpdate){
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
   }
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
