import * as THREE from 'three';

export function createControls(camera) {
    const currentPosition = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();
    const depthForward = new THREE.Vector3();
    const depthTarget = new THREE.Vector3();

    let boat = null;
    let boatSize = 10;
    let boatBaseY = 1.5;
    let boatBaseRotationY = 0;
    let mode = 'locked';
    let isDraggingView = false;
    let yaw = 0;
    let pitch = 0;
    let orbitDistance = 70;
    let minOrbitDistance = 22;
    let maxOrbitDistance = 88;
    let minDepthY = -176;
    let maxDepthY = -135;
    let surfaceTime = 0;

    function syncDepthLookFromCamera() {
        camera.getWorldDirection(depthForward);
        yaw = Math.atan2(depthForward.x, depthForward.z);
        pitch = Math.asin(THREE.MathUtils.clamp(depthForward.y, -1, 1));
    }

    function updateOrbitDistanceFromCamera() {
        orbitDistance = THREE.MathUtils.clamp(camera.position.distanceTo(depthTarget), minOrbitDistance, maxOrbitDistance);
    }

    function applyDepthOrbit() {
        pitch = THREE.MathUtils.clamp(pitch, -0.42, -0.08);
        orbitDistance = THREE.MathUtils.clamp(orbitDistance, minOrbitDistance, maxOrbitDistance);
        depthForward.set(
            Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            Math.cos(yaw) * Math.cos(pitch)
        ).normalize();

        camera.position.copy(depthTarget).addScaledVector(depthForward, -orbitDistance);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, minDepthY, maxDepthY);
        camera.lookAt(depthTarget);
    }

    function setupMovement() {
        window.addEventListener('mousedown', (event) => {
            if (mode !== 'depth' || event.button !== 0) return;
            isDraggingView = true;
        });

        window.addEventListener('mouseup', () => {
            isDraggingView = false;
        });

        window.addEventListener('mousemove', (event) => {
            if (!isDraggingView || mode !== 'depth') return;
            yaw -= event.movementX * 0.003;
            pitch -= event.movementY * 0.003;
            applyDepthOrbit();
        });

        window.addEventListener('wheel', (event) => {
            if (mode !== 'depth') return;
            event.preventDefault();
            orbitDistance += event.deltaY * 0.06;
            applyDepthOrbit();
        }, { passive: false });
    }

    function setBoat(target, size = 10) {
        boat = target;
        boatSize = size;
        boatBaseY = boat.position.y;
        boatBaseRotationY = boat.rotation.y;
        updateCamera(1, true);
    }

    function calculateIdealOffset() {
        const offset = new THREE.Vector3(
            -Math.max(boatSize * 0.72, 7),
            Math.max(boatSize * 0.5, 6),
            -Math.max(boatSize * 0.82, 9)
        );
        offset.applyQuaternion(boat.quaternion);
        offset.add(boat.position);
        return offset;
    }

    function calculateIdealLookAt() {
        const lookAt = new THREE.Vector3(
            Math.max(boatSize * 0.28, 2),
            Math.max(boatSize * 0.52, 3),
            Math.max(boatSize * 1.45, 12)
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

        if (mode === 'depth') {
            return;
        }

        if (mode !== 'explore') {
            return;
        }

        surfaceTime += delta;
        const waveIn = THREE.MathUtils.smootherstep(Math.min(surfaceTime / 1.8, 1), 0, 1);
        boat.position.y = boatBaseY + waveIn * (Math.sin(surfaceTime * 1.35) * 0.18 + Math.sin(surfaceTime * 0.68) * 0.08);
        boat.rotation.y = boatBaseRotationY + waveIn * Math.sin(surfaceTime * 0.18) * 0.05;
        boat.rotation.x = waveIn * (Math.sin(surfaceTime * 1.02 - 0.35) * 0.045 + Math.sin(surfaceTime * 0.5) * 0.014);
        boat.rotation.z = waveIn * Math.sin(surfaceTime * 0.84) * 0.022;

        updateCamera(delta);
    }

    function startExploreMode() {
        mode = 'explore';
        surfaceTime = 0;
        if (boat) {
            boat.position.y = boatBaseY;
            boat.rotation.set(0, boatBaseRotationY, 0);
            updateCamera(1, true);
        }
    }

    function startDiveMode() {
        mode = 'diving';
    }

    function lock() {
        mode = 'diving';
    }

    function startDepthMode(target) {
        mode = 'depth';
        isDraggingView = false;
        if (target?.lookAt) depthTarget.copy(target.lookAt);
        else depthTarget.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(70));
        minOrbitDistance = target?.minDistance ?? minOrbitDistance;
        maxOrbitDistance = target?.maxDistance ?? maxOrbitDistance;
        minDepthY = target?.minY ?? minDepthY;
        maxDepthY = target?.maxY ?? maxDepthY;
        depthTarget.y = THREE.MathUtils.clamp(depthTarget.y, minDepthY + 8, maxDepthY - 8);
        syncDepthLookFromCamera();
        updateOrbitDistanceFromCamera();
        applyDepthOrbit();
    }

    function getBoatState() {
        if (!boat) return null;

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(boat.quaternion).normalize();

        return {
            position: boat.position.clone(),
            quaternion: boat.quaternion.clone(),
            forward,
            size: boatSize
        };
    }

    return { setupMovement, setBoat, update, lock, startDiveMode, startExploreMode, startDepthMode, getBoatState };
}
