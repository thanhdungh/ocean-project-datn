import * as THREE from 'three';

export function createScene(canvas) {
    const scene = new THREE.Scene();

    const shallowColor = new THREE.Color(0x87ceeb);
    scene.background = shallowColor;
    scene.fog = new THREE.Fog(0x87ceeb, 80, 260);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.set(0, 6, 28);
    camera.lookAt(0, 4, -80);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 20);
    pointLight.position.set(20, 30, 20);
    scene.add(pointLight);

    return { scene, camera, renderer, shallowColor };
}