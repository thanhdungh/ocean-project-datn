import * as THREE from 'three';

export function createScene(canvas) {
    const scene = new THREE.Scene();

    const shallowColor = new THREE.Color(0x87cfee);
    scene.background = shallowColor;
    scene.fog = new THREE.Fog(0x87cfee, 120, 900);

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );

    camera.position.set(0, 18, 84);
    camera.lookAt(0, 6, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const hemiLight = new THREE.HemisphereLight(0xdff5ff, 0x18425b, 1.3);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1c2, 1.8);
    sunLight.position.set(180, 160, -120);
    scene.add(sunLight);

    return { scene, camera, renderer, shallowColor, sunLight };
}
