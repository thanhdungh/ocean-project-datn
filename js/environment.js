import * as THREE from 'three';

export function createWater(scene, size = 1600) {
    const geometry = new THREE.PlaneGeometry(size, size, 160, 160);
    const material = new THREE.MeshPhongMaterial({
        color: 0x2f8fc3,
        shininess: 90,
        specular: 0xa8e7ff,
        transparent: true,
        opacity: 0.96
    });

    const water = new THREE.Mesh(geometry, material);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);

    const positions = geometry.attributes.position;
    const baseHeights = new Float32Array(positions.count);

    for (let index = 0; index < positions.count; index += 1) {
        baseHeights[index] = positions.getZ(index);
    }

    function update(elapsedTime) {
        for (let index = 0; index < positions.count; index += 1) {
            const x = positions.getX(index);
            const y = positions.getY(index);
            const wave =
                Math.sin(x * 0.018 + elapsedTime * 1.2) * 0.8 +
                Math.cos(y * 0.014 + elapsedTime * 0.9) * 0.55 +
                Math.sin((x + y) * 0.01 + elapsedTime * 0.6) * 0.45;

            positions.setZ(index, baseHeights[index] + wave);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    return { mesh: water, update };
}
