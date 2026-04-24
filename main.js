import * as THREE from 'three';
import { createScene } from './js/scene.js';
import { createControls } from './js/controls.js';
import { createDiveAnimation } from './js/animation.js';
import { createWater } from './js/environment.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#webgl');
const introScreen = document.getElementById('intro-screen');
const loadingText = document.getElementById('loading-text');
const progressText = document.getElementById('progress');
const startBtn = document.getElementById('startBtn');
const diveBtn = document.getElementById('diveBtn');
const clock = new THREE.Clock();

const { scene, camera, renderer, shallowColor } = createScene(canvas);
const { setupMovement, setBoat, update: updateControls, lock, startExploreMode } = createControls(camera);
setupMovement();

const water = createWater(scene);
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const sun = new THREE.Vector3();
sun.setFromSphericalCoords(1, Math.PI / 2, Math.PI);
sky.material.uniforms.sunPosition.value.copy(sun);
if (water) {
    water.material.uniforms.sunDirection.value.copy(sun).normalize();
}

const dive = createDiveAnimation(camera, scene, { lock }, shallowColor);
let isGameStarted = false;

const manager = new THREE.LoadingManager();
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    if (progressText) {
        progressText.innerText = Math.floor((itemsLoaded / itemsTotal) * 100) + '%';
    }
};
manager.onLoad = () => {
    if (loadingText) loadingText.style.display = 'none';
    if (startBtn) startBtn.style.display = 'inline-block';
};

if (startBtn) {
    startBtn.onclick = () => {
        if (introScreen) introScreen.style.opacity = '0';
        setTimeout(() => {
            if (introScreen) introScreen.style.display = 'none';
            if (diveBtn) diveBtn.style.display = 'block';
            isGameStarted = true;
            startExploreMode();
        }, 800);
    };
}

if (diveBtn) {
    diveBtn.onclick = (event) => {
        event.stopPropagation();
        diveBtn.style.display = 'none';
        lock();
        dive.start();
    };
}

const loader = new GLTFLoader(manager);
loader.load('models/projects/boat.glb', (gltf) => {
    const boat = gltf.scene;
    boat.scale.set(4, 4, 4);
    boat.position.set(0, 1.5, 0);
    boat.rotation.y = Math.PI / 2;
    scene.add(boat);

    const box = new THREE.Box3().setFromObject(boat);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    setBoat(boat, maxDim);
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

    if (water) {
        water.material.uniforms.time.value += 0.004;
    }

    if (isGameStarted) {
        updateControls(delta);
        dive.update(delta);
    }

    renderer.render(scene, camera);
}

animate();
