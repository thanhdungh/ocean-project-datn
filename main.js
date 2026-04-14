import * as THREE from 'three';
import { createScene } from './js/scene.js';
import { createControls } from './js/controls.js';
import { createDiveAnimation } from './js/animation.js';
import { createWater } from './js/environment.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#webgl');

const { scene, camera, renderer, shallowColor } = createScene(canvas);

// controls
const { controls, setupMovement } = createControls(camera);
setupMovement();

// water
const water = createWater(scene);

// sky
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const sun = new THREE.Vector3();
sun.setFromSphericalCoords(1, Math.PI / 2, Math.PI);

sky.material.uniforms.sunPosition.value.copy(sun);
water.material.uniforms.sunDirection.value.copy(sun).normalize();

// dive
const dive = createDiveAnimation(camera, scene, controls, shallowColor);

// button
document.getElementById('diveBtn').onclick = (e) => {
    e.stopPropagation();
    dive.start();
};

// resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// boat
const loader = new GLTFLoader();
loader.load('/models/projects/boat.glb', (gltf) => {
    const boat = gltf.scene;
    boat.scale.set(4, 4, 4);
    boat.position.set(0, 1.5, -90);
    scene.add(boat);
});

// loop
function animate() {
    requestAnimationFrame(animate);

    water.material.uniforms.time.value += 0.02;

    dive.update();

    renderer.render(scene, camera);
}

animate();
