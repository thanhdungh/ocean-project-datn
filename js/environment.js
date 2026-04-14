import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

export function createWater(scene, size = 1400) {
    const waterGeometry = new THREE.PlaneGeometry(size, size, 128, 128);

    const water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
            'https://threejs.org/examples/textures/waternormals.jpg',
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        ),
        sunDirection: new THREE.Vector3(1, 1, 1),
        sunColor: 0xffffff,
        waterColor: 0x006994,
        distortionScale: 3.2,
        fog: scene.fog !== undefined
    });

    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    return water;
}
