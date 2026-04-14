import * as THREE from 'three';

export function createDiveAnimation(camera, scene, controls, shallowColor) {
    let progress = 0;
    let state = "intro";
    let hasStarted = false;

    const deepColor = new THREE.Color(0x001e2d);
    const overlay = document.getElementById('overlay');

    function start() {
        if (state !== "intro" || hasStarted) return;
        hasStarted = true;
        state = "diving";
    }

    function update() {
        if (state !== "diving") return;

        progress += 0.01;

        camera.position.y = 10 - progress * 6;
        camera.position.z = 20 - progress * 10;

        camera.lookAt(0, -2, 0);

        scene.background = shallowColor.clone().lerp(deepColor, progress);
        scene.fog.far = 20 + progress * 60;

        overlay.style.opacity = progress;

        if (progress >= 1) {
            state = "explore";
            controls.lock();
        }
    }

    return { start, update };
}