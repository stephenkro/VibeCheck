import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'dat.gui'

/**
 * Loaders
 */
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()


// Textures 
const floorColorTexture = textureLoader.load('/textures/concrete/broken_down_concrete1_albedo.png')
const floorHeightTexture = textureLoader.load('/textures/concrete/broken_down_concrete1_Height.png')
const floorNormalTexture = textureLoader.load('/textures/concrete/broken_down_concrete1_Normal-dx.png')
const floorMetalTexture = textureLoader.load('/textures/concrete/broken_down_concrete1_Metallic.png')
const floorAmbientTexture = textureLoader.load('/textures/concrete/broken_down_concrete1_ao.png')
const floorRoughTexture = textureLoader.load('/textures/concrete/broken_down_concrete1_Roughness.png')

const grassColorTexture = textureLoader.load('/textures/grass/color.jpg')
const grassAmbientTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg')
const grassRoughTexture = textureLoader.load('/textures/grass/roughness.jpg')

grassColorTexture.repeat.set(8,8)
grassAmbientTexture.repeat.set(8,8)
grassNormalTexture.repeat.set(8,8)
grassRoughTexture.repeat.set(8,8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughTexture.wrapT = THREE.RepeatWrapping


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Debug
 */
const gui = new dat.GUI()


/**
 * Environment Map
 */

const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/1/px.jpg',
    '/textures/environmentMaps/1/nx.jpg',
    '/textures/environmentMaps/1/py.jpg',
    '/textures/environmentMaps/1/ny.jpg',
    '/textures/environmentMaps/1/pz.jpg',
    '/textures/environmentMaps/1/nz.jpg',
])

environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap

 


/**
 * Floor
 */
const floorGeometry = new THREE.PlaneBufferGeometry(100,100,32,32)
const floorMaterial = new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap:grassAmbientTexture, 
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughTexture,

})
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = - Math.PI / 2
scene.add(floor)


/**
 *  Test Object
 */

const geometry = new THREE.SphereBufferGeometry(1, 16, 16)
const material = new THREE.MeshStandardMaterial()

const sphere = new THREE.Mesh(geometry, material)
sphere.position.y = 1
scene.add(sphere)




/**
 * Lights 
 */
const directionalLight = new THREE.DirectionalLight()
directionalLight.position.set(0,4,5)
scene.add(directionalLight)


const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
// scene.add(ambientLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,5,4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()