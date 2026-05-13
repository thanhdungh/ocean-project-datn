import * as THREE from 'three';

export function createDiveAnimation(camera, scene, controls, shallowColor, getBoatState, getDiveTarget, onComplete) {
    let progress = 0;
    let state = "intro";
    let hasStarted = false;

    const deepColor = new THREE.Color(0x001e2d);
    const overlay = document.getElementById('overlay');
    const startPosition = new THREE.Vector3();
    const endPosition = new THREE.Vector3();
    const startForward = new THREE.Vector3();
    const startLookAt = new THREE.Vector3();
    const endLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3();
    const diveApex = new THREE.Vector3();
    const diveDirection = new THREE.Vector3();
    const diveSide = new THREE.Vector3();
    const diveMid = new THREE.Vector3();
    const curveA = new THREE.Vector3();
    const curveB = new THREE.Vector3();
    const fallbackDiveTarget = {
        position: new THREE.Vector3(0, -132, 18),
        lookAt: new THREE.Vector3(0, -174, 0)
    };
    let activeDiveTarget = fallbackDiveTarget;

    function start() {
        if (state !== "intro" || hasStarted) return;
        hasStarted = true;
        state = "diving";
        progress = 0;

        startPosition.copy(camera.position);
        startForward.copy(camera.getWorldDirection(new THREE.Vector3())).normalize();
        startLookAt.copy(camera.position).add(startForward.clone().multiplyScalar(30));

        const boatState = getBoatState?.();
        const diveTarget = getDiveTarget?.() ?? fallbackDiveTarget;
        activeDiveTarget = diveTarget;
        if (boatState) {
            diveDirection.copy(boatState.forward).normalize();
            diveSide.set(diveDirection.z, 0, -diveDirection.x).normalize();

            endPosition.copy(diveTarget.position);
            endLookAt.copy(diveTarget.lookAt);
        } else {
            diveDirection.copy(startForward);
            endPosition.copy(diveTarget.position);
            endLookAt.copy(diveTarget.lookAt);
        }

        diveApex.copy(startPosition)
            .addScaledVector(startForward, 16)
            .add(new THREE.Vector3(0, 10, 0));

        diveMid.copy(startPosition)
            .lerp(endPosition, 0.42)
            .addScaledVector(startForward, 30);
        diveMid.y = Math.max(diveMid.y, startPosition.y + 4);
    }

    function update(delta = 1 / 60) {
        if (state !== "diving") return;

        progress = Math.min(progress + delta * 0.38, 1);
        const eased = THREE.MathUtils.smootherstep(progress, 0, 1);

        curveA.copy(startPosition).lerp(diveApex, eased);
        curveB.copy(diveApex).lerp(diveMid, eased);
        curveA.lerp(curveB, eased);

        curveB.copy(diveMid).lerp(endPosition, eased * eased);
        camera.position.copy(curveA).lerp(curveB, THREE.MathUtils.smootherstep(eased, 0.25, 1));

        currentLookAt.copy(startLookAt).lerp(endLookAt, eased * 0.9);
        camera.lookAt(currentLookAt);

        scene.background = shallowColor.clone().lerp(deepColor, eased);
        if (scene.fog && scene.fog.isFog) {
            scene.fog.far = 20 + eased * 60;
        }

        if (overlay) {
            overlay.style.opacity = eased;
        }

        if (progress >= 1) {
            state = "explore";
            if (overlay) {
                overlay.style.opacity = '0';
            }
            controls.startDepthMode?.(activeDiveTarget);
            onComplete?.();
        }
    }

    return { start, update };
}
