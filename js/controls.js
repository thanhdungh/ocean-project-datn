import * as THREE from 'three';

export function createControls(camera) {
    const keys = { w: false, a: false, s: false, d: false };
    const currentPosition = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();
    const boatForward = new THREE.Vector3();

    let boat = null;
    let boatSize = 10;
    let mode = 'locked';

    function setupMovement() {
        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (keys[key] !== undefined) keys[key] = true;
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (keys[key] !== undefined) keys[key] = false;
        });
    }

    function setBoat(target, size = 10) {
        boat = target;
        boatSize = size;
        updateCamera(1, true);
    }

    function calculateIdealOffset() {
        const offset = new THREE.Vector3(
            0,
            Math.max(boatSize * 0.9, 10),
            -Math.max(boatSize * 1.8, 16)
        );
        offset.applyQuaternion(boat.quaternion);
        offset.add(boat.position);
        return offset;
    }

    function calculateIdealLookAt() {
        const lookAt = new THREE.Vector3(
            0,
            Math.max(boatSize * 0.3, 3),
            Math.max(boatSize * 2.2, 22)
        );
        lookAt.applyQuaternion(boat.quaternion);
        lookAt.add(boat.position);
        return lookAt;
    }

    function updateCamera(delta, immediate = false) {
        if (!boat) return;

        targetPosition.copy(calculateIdealOffset());
        targetLookAt.copy(calculateIdealLookAt());

        if (immediate) {
            currentPosition.copy(targetPosition);
            currentLookAt.copy(targetLookAt);
        } else {
            const t = 1.0 - Math.pow(0.001, delta);
            currentPosition.lerp(targetPosition, t);
            currentLookAt.lerp(targetLookAt, t);
        }

        camera.position.copy(currentPosition);
        camera.lookAt(currentLookAt);
    }

    function update(delta) {
        if (!boat) return;

        if (mode === 'explore') {
            const moveSpeed = Math.max(boatSize * 1.2, 10);
            const turnSpeed = 1.2;

            if (keys.a) boat.rotateY(turnSpeed * delta);
            if (keys.d) boat.rotateY(-turnSpeed * delta);

            const moveZ = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
            if (moveZ !== 0) {
                boat.translateZ(moveZ * moveSpeed * delta);
            }
        }

        updateCamera(delta);
    }

    function startExploreMode() {
        mode = 'explore';
    }

    function startDiveMode() {
        mode = 'diving';
    }

    function lock() {
        mode = 'diving';
    }

    return { setupMovement, setBoat, update, lock, startDiveMode, startExploreMode };
}
