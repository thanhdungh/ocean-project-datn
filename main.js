import * as THREE from 'three';
import { createScene } from './js/scene.js';
import { createControls } from './js/controls.js';
import { createDiveAnimation } from './js/animation.js';
import { createDepthWorld } from './js/depth.js';
import { createWater } from './js/environment.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#webgl');
const introScreen = document.getElementById('intro-screen');
const loadingText = document.getElementById('loading-text');
const progressText = document.getElementById('progress');
const startBtn = document.getElementById('startBtn');
const heroUi = document.getElementById('hero-ui');
const diveBtn = document.getElementById('diveBtn');
const clock = new THREE.Clock();

const { scene, camera, renderer, shallowColor } = createScene(canvas);
const { setupMovement, setBoat, update: updateControls, lock, startExploreMode, startDepthMode, getBoatState } = createControls(camera);
setupMovement();

const water = createWater(scene);
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);
const surfaceObjects = [sky];
if (water) surfaceObjects.push(water);
let isDepthModeActive = false;
let depthWorld = null;

function setSurfaceVisible(visible) {
    surfaceObjects.forEach((object) => {
        object.visible = visible;
    });
    isDepthModeActive = !visible;
}

const sun = new THREE.Vector3();
const baseSunPhi = Math.PI / 2 - 0.035;
const baseSunTheta = Math.PI * 1.08;
sky.material.uniforms.turbidity.value = 3.2;
sky.material.uniforms.rayleigh.value = 1.05;
sky.material.uniforms.mieCoefficient.value = 0.018;
sky.material.uniforms.mieDirectionalG.value = 0.82;
sun.setFromSphericalCoords(1, baseSunPhi, baseSunTheta);
sky.material.uniforms.sunPosition.value.copy(sun);
if (water) {
    water.material.uniforms.sunDirection.value.copy(sun).normalize();
}

function ensureDepthWorld() {
    if (!depthWorld) {
        depthWorld = createDepthWorld(scene, camera, renderer, sky);
    }
    return depthWorld;
}

const dive = createDiveAnimation(camera, scene, { lock, startDepthMode }, shallowColor, getBoatState, () => ensureDepthWorld().getDiveTarget(), () => {
    setSurfaceVisible(false);
});
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
            if (heroUi) heroUi.style.display = 'block';
            isGameStarted = true;
            startExploreMode();
        }, 800);
    };
}

if (diveBtn) {
    diveBtn.onclick = (event) => {
        event.stopPropagation();
        if (heroUi) heroUi.style.display = 'none';
        ensureDepthWorld();
        lock();
        dive.start();
    };
}

const loader = new GLTFLoader(manager);
loader.load('models/projects/boat.glb', (gltf) => {
    const boat = gltf.scene;
    boat.scale.set(4, 4, 4);
    boat.position.set(0, -2, 0);
    boat.rotation.y = Math.PI / 2;
    scene.add(boat);
    surfaceObjects.push(boat);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (water && !isDepthModeActive) {
        water.material.uniforms.time.value += 0.002;
        const sunWave = Math.sin(elapsedTime * 0.55) * 0.012;
        sun.setFromSphericalCoords(1, baseSunPhi + sunWave, baseSunTheta + Math.sin(elapsedTime * 0.2) * 0.006);
        sky.material.uniforms.sunPosition.value.copy(sun);
        water.material.uniforms.sunDirection.value.copy(sun).normalize();
    }

    if (isGameStarted) {
        updateControls(delta);
        dive.update(delta);
    }

    if (depthWorld) {
        depthWorld.update(elapsedTime, camera.position.y);
    }

    renderer.render(scene, camera);
}

animate();
