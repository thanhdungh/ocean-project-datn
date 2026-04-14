import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export function createControls(camera) {
    const controls = new PointerLockControls(camera, document.body);

    function setupMovement() {
        document.addEventListener('keydown', (e) => {
            if (!controls.isLocked) return;

            if (e.key === 'w') controls.moveForward(0.5);
            if (e.key === 's') controls.moveForward(-0.5);
            if (e.key === 'a') controls.moveRight(-0.5);
            if (e.key === 'd') controls.moveRight(0.5);
        });
    }

    return { controls, setupMovement };
}