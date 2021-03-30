import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// import { FlightHelmet } from '../static/models/FlightHelmet/glTF/FlightHelmet.gltf'

// console.log(FlightHelmet)

/**
 * Loaders
 */
// const dracoloader = new DRACOLoader();
const gltfLoader = new GLTFLoader()

const cubeTextureLoader = new THREE.CubeTextureLoader()
/**
 * Models
 */
// Hemlet
console.log(require('../static/models/FlightHelmet/glTF/FlightHelmet.gltf'))
// console.log(gltfLoader)
gltfLoader.load(
    require('../static/models/FlightHelmet/glTF/FlightHelmet.gltf'),
    (gltf) => {
      console.log(gltf)
        gltf.scene.scale.set(10,10,10)
        gltf.scene.position.set(0,-4,0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        gui
            .add(gltf.scene.rotation, 'x', -Math.PI, Math.PI, 0.001).name('Hemlet-x')

      updateAllMaterials()
    }
)
// Burger

// gltfLoader.load(
//     '/models/hamburger.glb',
//     (gltf) => {
//       gltf.scene.scale.set(0.3,0.3,0.3)
//       gltf.scene.position.set(0,-4,0)
//       gltf.scene.rotation.y = Math.PI * 0.5
//       scene.add(gltf.scene)
//
//       gui
//           .add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.001).name('Hemlet-x')
//
//       updateAllMaterials()
//     }
// )
/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity
      child.material.needsUpdate = true // для обновы новых тонов
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}
/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    'textures/environmentMaps/5/px.jpg',
    'textures/environmentMaps/5/nx.jpg',
    'textures/environmentMaps/5/py.jpg',
    'textures/environmentMaps/5/ny.jpg',
    'textures/environmentMaps/5/pz.jpg',
    'textures/environmentMaps/5/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding  // гамма кодировка на окружение
scene.background = environmentMap
//scene.environment = environmentMap  // применение ко всем объектам сцены окружение

debugObject.envMapIntensity = 5
gui.add(debugObject, 'envMapIntensity', 0, 10, 0.001).onChange(() => {
  updateAllMaterials() //вызов функции для пересбора модели при каждом изменении
})
/**
 * Lights
 */

const directionLight = new THREE.DirectionalLight('#ffffff', 3)
directionLight.position.set(0.25, 3,-2.25)
directionLight.castShadow = true // отброс теней
directionLight.shadow.camera.far = 15 // дальность света
directionLight.shadow.mapSize.set(1024, 1024) // качество теней
directionLight.shadow.normalBias = 0.05  //  если объект начианет отбрасывать тень от пикселей (артефакты)

scene.add(directionLight)

// const directionLightCameraHelper = new THREE.CameraHelper(directionLight.shadow.camera)
// scene.add(directionLightCameraHelper)

gui.add(directionLight, 'intensity', 0, 10, 0.001).name('lightIntensity')
gui.add(directionLight.position, 'x', -5, 5, 0.001).name('light-x')
gui.add(directionLight.position, 'y', -5, 5, 0.001).name('light-y')
gui.add(directionLight.position, 'z', -5, 5, 0.001).name('light-z')

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
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true // MSAA (Multi Sampling) сглаживание
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true // физически правильный свет
renderer.outputEncoding = THREE.sRGBEncoding // гамма кодировка на рендер

// renderer.toneMapping = THREE.NoToneMapping // (default) тональный пресет гаммы
// renderer.toneMapping = THREE.LinearEncoding // тональный пресет гаммы
// renderer.toneMapping = THREE.ReinhardToneMapping // тональный пресет гаммы
// renderer.toneMapping = THREE.CineonToneMapping // тональный пресет гаммы
renderer.toneMapping = THREE.ACESFilmicToneMapping // тональный пресет гаммы
renderer.toneMappingExposure = 3 // експозиция тональной карты
renderer.shadowMap.enabled = true  // карта теней
renderer.shadowMap.type = THREE.PCFShadowMap // тип теней

gui.add(renderer, 'toneMapping',{
  No: THREE.NoToneMapping,
  Linear: THREE.LinearEncoding,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping
})
    .onFinishChange(() => {
      renderer.toneMapping = Number(renderer.toneMapping)
      updateAllMaterials() // для обновы новых тонов
    })

gui.add(renderer, 'toneMappingExposure', 0, 10, 0.001)

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()