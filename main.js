import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { createScene } from './js/scene.js';
import { createControls } from './js/controls.js';
import { createDiveAnimation } from './js/animation.js';
import { createWater } from './js/environment.js';

const canvas = document.querySelector('#webgl');
const diveBtn = document.getElementById('diveBtn');
const hud = document.getElementById('hud');
const clock = new THREE.Clock();

const { scene, camera, renderer, shallowColor, sunLight } = createScene(canvas);
const { update: updateControls, startDiveMode, enableExploreMode, requestExploreLock, getDiveTarget } = createControls(camera);
const dive = createDiveAnimation(camera, scene, shallowColor, getDiveTarget, enableExploreMode);
const water = createWater(scene, 1600);

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

sky.material.uniforms.turbidity.value = 6;
sky.material.uniforms.rayleigh.value = 2;
sky.material.uniforms.mieCoefficient.value = 0.005;
sky.material.uniforms.mieDirectionalG.value = 0.82;

const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(90 - 8);
const theta = THREE.MathUtils.degToRad(180);
sun.setFromSphericalCoords(1, phi, theta);
sky.material.uniforms.sunPosition.value.copy(sun);

const sunGeometry = new THREE.SphereGeometry(18, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdd88,
    transparent: true,
    opacity: 0.95
});
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.copy(sun).multiplyScalar(500);
scene.add(sunMesh);

sunLight.position.copy(sunMesh.position);

hud.innerHTML = `
  <div class="hud-title">Ocean Scene</div>
  <div>Da tao lai mat bien, bau troi va mat troi bang Three.js.</div>
  <div>Ban nay tam thoi bo logic thuyen de on dinh camera.</div>
`;

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

    const elapsedTime = clock.getElapsedTime();
    const delta = clock.getDelta();

    water.update(elapsedTime);
    updateControls(delta);
    dive.update(delta);

    renderer.render(scene, camera);
}

animate();
