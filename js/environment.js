import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

export function createWater(scene) {
    const geometry = new THREE.PlaneGeometry(10000, 10000);

    const water = new Water(geometry, {
        textureWidth: 512,
        textureHeight: 512,

        waterNormals: new THREE.TextureLoader().load(
            'https://threejs.org/examples/textures/waternormals.jpg',
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        ),

        sunDirection: new THREE.Vector3(1, 1, 1),
        sunColor: 0xffb37a,
        waterColor: 0x1f6477,
        distortionScale: 1.8,
        fog: scene.fog !== undefined
    });

    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    return water;
}
