import App3 from "./fish/App3.js";
import FishSwarm from "./fish/FishSwarm.js";
import FishTank from "./fish/FishTank.js";

export function createDepthWorld(scene, camera, renderer, sky) {
    const THREE = App3.THREE;
    const depthOffsetY = -180;
    const depthRoot = new THREE.Group();
    depthRoot.name = 'DepthWorld';
    depthRoot.position.y = depthOffsetY;
    depthRoot.visible = false;
    scene.add(depthRoot);

    const app = {
        scene: depthRoot,
        camera,
        THREE,
        App3,
        assetRoot: '',
        renderer,
        domElement: renderer.domElement,
        addEventListener: document.addEventListener.bind(document),
        removeEventListener: document.removeEventListener.bind(document),
        dispatchEvent: document.dispatchEvent.bind(document)
    };

    App3.startLoadPhase = () => {};
    App3.loadPhaseComplete = () => {};

    Math.seededRandom = function (a) {
        return function () {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    };
    Math.random = Math.seededRandom(window.SimConfig.SEED);

    new FishSwarm(app);
    const fishTank = new FishTank(app);

    const sun = new THREE.DirectionalLight('white', 2.9);
    sun.position.set(0, 70, 0);
    sun.castShadow = true;
    sun.shadow.bias = -0.005;
    sun.shadow.normalBias = 0.02;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.right = sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = sun.shadow.camera.left = -100;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.near = 1;
    sun.shadow.intensity = 0.5;
    sun.shadow.radius = 3.0;
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sun);

    scene.add(new THREE.AmbientLight('white', 0.35));

    const fogColor = '#0b3142';
    const depthFog = new THREE.FogExp2(fogColor, 0.006);
    let lastTimeMs = performance.now();

    return {
        depthRoot,
        depthOffsetY,
        update: (elapsedTime, cameraY) => {
            const isUnderwater = cameraY < -10;
            depthRoot.visible = isUnderwater;

            if (isUnderwater) {
                scene.background = new THREE.Color(fogColor);
                scene.fog = depthFog;
                if (sky) sky.visible = false;

                const nowMs = performance.now();
                const frameEvt = new Event('frame');
                frameEvt.time = elapsedTime * 1000;
                frameEvt.deltaT = nowMs - lastTimeMs;
                lastTimeMs = nowMs;
                document.dispatchEvent(frameEvt);
            } else {
                scene.background = null;
                scene.fog = null;
                if (sky) sky.visible = true;
                lastTimeMs = performance.now();
            }
        },
        getDiveTarget: () => ({
            position: new THREE.Vector3(0, depthOffsetY + 48, 18),
            lookAt: new THREE.Vector3(0, depthOffsetY + 6, 0),
            minDistance: 22,
            maxDistance: 88,
            minY: depthOffsetY + 4,
            maxY: depthOffsetY + 45
        })
    };
}
