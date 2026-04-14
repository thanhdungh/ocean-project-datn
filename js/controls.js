import * as THREE from 'three';

export function createControls(camera) {
    let mode = 'intro';

    function update() {}

    function startDiveMode() {
        mode = 'diving';
    }

    function enableExploreMode() {
        mode = 'explore';
    }

    function requestExploreLock() {}

    function getDiveTarget() {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);

        return {
            position: camera.position.clone().add(new THREE.Vector3(0, -14, 6)),
            lookAt: camera.position.clone().add(forward.multiplyScalar(40)).setY(-8)
        };
    }

    return {
        update,
        startDiveMode,
        enableExploreMode,
        requestExploreLock,
        getDiveTarget,
        get mode() {
            return mode;
        }
    };
}
