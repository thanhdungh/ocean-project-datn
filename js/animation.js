import * as THREE from 'three';

export function createDiveAnimation(camera, scene, shallowColor, getDiveTarget, onComplete) {
    let progress = 0;
    let state = 'intro';

    const deepColor = new THREE.Color(0x001e2d);
    const workingColor = new THREE.Color();
    const startPosition = new THREE.Vector3();
    const endPosition = new THREE.Vector3();
    const startLookAt = new THREE.Vector3();
    const endLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3();
    const overlay = document.getElementById('overlay');

    function start() {
        if (state !== 'intro') return false;

        progress = 0;
        state = 'diving';

        startPosition.copy(camera.position);
        startLookAt.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(40));

        const target = getDiveTarget();
        endPosition.copy(target.position);
        endLookAt.copy(target.lookAt);

        return true;
    }

    function update(delta) {
        if (state !== 'diving') return;

        progress = Math.min(progress + delta * 0.28, 1);
        const eased = THREE.MathUtils.smootherstep(progress, 0, 1);

        camera.position.lerpVectors(startPosition, endPosition, eased);
        currentLookAt.lerpVectors(startLookAt, endLookAt, eased);
        camera.lookAt(currentLookAt);

        workingColor.copy(shallowColor).lerp(deepColor, eased);
        scene.background = workingColor.clone();
        scene.fog.color.copy(workingColor);
        scene.fog.near = 8;
        scene.fog.far = THREE.MathUtils.lerp(260, 90, eased);
        overlay.style.opacity = (0.7 * eased).toFixed(3);

        if (progress >= 1) {
            state = 'explore';
            onComplete?.();
        }
    }

    function isIntro() {
        return state === 'intro';
    }

    return { start, update, isIntro };
}