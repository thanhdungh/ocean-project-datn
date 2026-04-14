import * as THREE from 'three';
import { createScene } from './js/scene.js';
import { createControls } from './js/controls.js';
import { createDiveAnimation } from './js/animation.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { createWater } from './js/environment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#webgl');
const diveBtn = document.getElementById('diveBtn');
const clock = new THREE.Clock();

const { scene, camera, renderer, shallowColor } = createScene(canvas);
const { setBoat, update: updateControls, startDiveMode, enableExploreMode, requestExploreLock, getDiveTarget } = createControls(camera);
const dive = createDiveAnimation(camera, scene, shallowColor, getDiveTarget, enableExploreMode);
const water = createWater(scene, 1400);

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(90 - 2);
const theta = THREE.MathUtils.degToRad(180);
sun.setFromSphericalCoords(1, phi, theta);
sky.material.uniforms.sunPosition.value.copy(sun);
water.material.uniforms.sunDirection.value.copy(sun).normalize();

let boat = null;

const loader = new GLTFLoader();
loader.load('/models/projects/boat.glb', (gltf) => {
    boat = gltf.scene;
    boat.scale.set(5, 5, 5);
    boat.position.set(0, 1.2, -120);
    scene.add(boat);
    setBoat(boat);
});

diveBtn.addEventListener('click', (event) => {
    event.stopPropagation();

    if (!dive.isIntro()) return;

    const started = dive.start();
    if (!started) return;

    startDiveMode();
    requestExploreLock();
    diveBtn.disabled = true;
    diveBtn.style.opacity = '0.65';
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    water.material.uniforms.time.value += delta * 0.8;

    updateControls(delta);
    dive.update(delta);

    renderer.render(scene, camera);
}

animate();