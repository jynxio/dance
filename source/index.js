import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import SpotLight from "./SpotLight";

import SpotLightHelper from "./SpotLightHelper";

import GUI from "lil-gui";

/* ------------------------------------------------------------------------------------------------------ */
/* GUI */
const gui = new GUI();

/* Renderer */
const renderer = new three.WebGLRenderer({ antialias: window.devicePixelRatio < 2 });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = three.sRGBEncoding;
renderer.toneMapping = three.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = three.PCFSoftShadowMap;

document.body.append(renderer.domElement);

gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.01).name("ToneMappingExposure");
gui.add(renderer, "toneMapping", {
    No: three.NoToneMapping,
    Linear: three.LinearToneMapping,
    Reinhard: three.ReinhardToneMapping,
    Cineon: three.CineonToneMapping,
    ACESFilmic: three.ACESFilmicToneMapping
}).onFinishChange(_ => {

    renderer.toneMapping = Number(renderer.toneMapping);

    scene.traverse(item => {

        if (item instanceof three.Mesh === false) return;
        if (item.material instanceof three.MeshStandardMaterial === false) return;

        item.material.needsUpdate = true;

    });

});

/* Scene */
const scene = new three.Scene();

/* Camera */
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

camera.position.set(0, 4, 6);
// camera.lookAt( 0, 2, 0 );

scene.add(camera);

/* Controls */
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.target = new three.Vector3(0, 1.65, 0);

/* ------------------------------------------------------------------------------------------------------ */
/* Fog */
scene.fog = new three.FogExp2(0x262837, 0.04);
scene.background = new three.Color(0x262837);

// gui.add(scene.fog, "density").min(0).max(1).min(0.00001).name("Fog");

/* Model */
let mixer;

new GLTFLoader().load("/static/model/scene.glb", gltf => {

    const model = gltf.scene;

    model.scale.set(0.2, 0.2, 0.2);
    model.traverse(item => {

        if (item instanceof three.Mesh === false) return;
        if (item.material instanceof three.MeshStandardMaterial === false) return;

        item.castShadow = true;
        item.receiveShadow = true;

        other_object3d_map.set(item, item.material);

    });

    mixer = new three.AnimationMixer(model);

    const action = mixer.clipAction(gltf.animations[0]);

    action.play();

    scene.add(model);

});

/* Ground */
const ground = new three.Mesh(
    new three.CircleGeometry(50, 254).rotateX(-Math.PI / 2),
    new three.MeshStandardMaterial({ color: 0x262837 }),
);

ground.receiveShadow = true;

scene.add(ground);

/* Light：用雾紫色的光，灯芯使用镜头光晕（使用多重光片会更真实）。 */
const ambient_light = new three.AmbientLight(0xffffff, 1); // 0.05

scene.add(ambient_light);

const spot_light_1 = new SpotLight();
const spot_light_2 = new SpotLight();
const spot_light_3 = new SpotLight();

scene.add(spot_light_1, spot_light_2, spot_light_3);

/* Helper */
const helper_color = undefined;
const helper_opacity = 0.01;

const helper_1 = createSpotLightHelper(spot_light_1, helper_color, helper_opacity);
const helper_2 = createSpotLightHelper(spot_light_2, helper_color, helper_opacity);
const helper_3 = createSpotLightHelper(spot_light_3, helper_color, helper_opacity);

scene.add(helper_1, helper_2, helper_3);

function createSpotLightHelper(light, color, opacity) {

    const helper = new SpotLightHelper(light, color, opacity);
    const material = helper.cone.material;

    material.blending = three.AdditiveBlending;
    material.depthWrite = false;
    material.needsUpdate = true;

    return helper;

}

/* 调试聚光灯 */
const light_helper_1 = new three.SpotLightHelper(spot_light_1);
const light_helper_2 = new three.SpotLightHelper(spot_light_2);
const light_helper_3 = new three.SpotLightHelper(spot_light_3);

const camera_helper_1 = new three.CameraHelper(spot_light_1.shadow.camera);
const camera_helper_2 = new three.CameraHelper(spot_light_2.shadow.camera);
const camera_helper_3 = new three.CameraHelper(spot_light_3.shadow.camera);

// scene.add(light_helper_1, light_helper_2, light_helper_3);
// scene.add(camera_helper_1, camera_helper_2, camera_helper_3);

const debug_options = {
    height: 12,
    radius: 4,
    angle: 0.25,
    penumbra: 1,
    decay: 0,
    distance: 50,
    intensity: 10,
};

updateHeight(debug_options.height);
updateRadius(debug_options.radius);
updateAngle(debug_options.angle);
updatePenumbra(debug_options.penumbra);
updateDecay(debug_options.decay);
updateDistance(debug_options.distance);
updateIntensity(debug_options.intensity);

gui.add(debug_options, "height").min(0).max(100).step(0.1).name("Height").onChange(updateHeight);
gui.add(debug_options, "radius").min(0).max(50).step(0.1).name("Radius").onChange(updateRadius);
gui.add(debug_options, "angle").min(0).max(Math.PI / 2).step(Math.PI / 200).name("Angle").onChange(updateAngle);
gui.add(debug_options, "penumbra").min(0).max(1).step(0.01).name("Penumbra").onChange(updatePenumbra);
gui.add(debug_options, "decay").min(0).max(10).step(0.01).name("Decay").onChange(updateDecay);
gui.add(debug_options, "distance").min(0).max(50).step(0.01).name("Distance").onChange(updateDistance);
gui.add(debug_options, "intensity").min(0).max(100).step(1).name("Intensity").onChange(updateIntensity);

function updateHeight() {

    const h = debug_options.height;

    spot_light_1.position.y = h;
    spot_light_2.position.y = h;
    spot_light_3.position.y = h;

    updateLight();

}

function updateRadius() {

    const r = debug_options.radius;

    spot_light_1.position.x = 0;
    spot_light_1.position.z = - r;

    spot_light_2.position.x = 3 ** 0.5 / 2 * r;
    spot_light_2.position.z = r / 2;

    spot_light_3.position.x = - spot_light_2.position.x;
    spot_light_3.position.z = spot_light_2.position.z;

    updateLight();

}

function updateAngle() {

    const a = debug_options.angle;

    spot_light_1.angle = a;
    spot_light_2.angle = a;
    spot_light_3.angle = a;

    updateLight();

}

function updatePenumbra() {

    const p = debug_options.penumbra;

    spot_light_1.penumbra = p;
    spot_light_2.penumbra = p;
    spot_light_3.penumbra = p;

    updateLight();

}

function updateDecay() {

    const d = debug_options.decay;

    spot_light_1.decay = d;
    spot_light_2.decay = d;
    spot_light_3.decay = d;

    updateLight();

}

function updateDistance() {

    const d = debug_options.distance;

    spot_light_1.distance = d;
    spot_light_2.distance = d;
    spot_light_3.distance = d;

    updateLight();

}

function updateIntensity() {

    const i = debug_options.intensity;

    spot_light_1.intensity = i;
    spot_light_2.intensity = i;
    spot_light_3.intensity = i;

    updateLight();

}

function updateLight() {

    helper_1.update();
    helper_2.update();
    helper_3.update();

    light_helper_1.update();
    light_helper_2.update();
    light_helper_3.update();

    spot_light_1.shadow.camera.updateProjectionMatrix();
    spot_light_2.shadow.camera.updateProjectionMatrix();
    spot_light_3.shadow.camera.updateProjectionMatrix();

    camera_helper_1.update();
    camera_helper_2.update();
    camera_helper_3.update();

}

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
/* 合成器1：制造全局泛光 */
const composer_bloom = new EffectComposer(renderer); // 效果合成器
const pass_render = new RenderPass(scene, camera);   // 后期处理（基本）
const pass_bloom = new UnrealBloomPass(renderer.getSize(new three.Vector2), 1.5, 0.4, 0.85);

pass_bloom.threshold = 0;
pass_bloom.strength = 2;
pass_bloom.radius = 0.5;

composer_bloom.renderToScreen = false;
composer_bloom.addPass(pass_render);
composer_bloom.addPass(pass_bloom);
composer_bloom.setSize(window.innerWidth, window.innerHeight);

/* 合成器2：制造局部泛光 */
const pass_final = new ShaderPass(
    new three.ShaderMaterial({
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: composer_bloom.renderTarget2.texture },
        },
        vertexShader: "varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}",
        fragmentShader: "uniform sampler2D baseTexture;uniform sampler2D bloomTexture;varying vec2 vUv;void main() {gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );}",
        defines: {}
    }),
    "baseTexture"
);

pass_final.needsSwap = true;

const composer_final = new EffectComposer(renderer);

composer_final.addPass(pass_render);
composer_final.addPass(pass_final);
composer_final.setSize(window.innerWidth, window.innerHeight);

const flood_object3d = [helper_1.cone, helper_2.cone, helper_3.cone];
const flood_object3d_map = new Map();
const other_object3d_map = new Map();

scene.traverse(item => {

    if (item instanceof three.Mesh === false) return;
    if (item.material instanceof three.Material === false) return;

    other_object3d_map.set(item, item.material);

});

flood_object3d.forEach(object3d => {

    object3d.traverse(item => {

        if (item instanceof three.Mesh === false) return;
        if (item.material instanceof three.Material === false) return;

        flood_object3d_map.set(item, item.material);
        other_object3d_map.delete(item);

    });

});

const material_0x000000 = new three.MeshBasicMaterial({ color: 0x000000 });

const clock = new three.Clock();
let previous_time = 0;
let elapsed_time = 0;
let delta_time = 0;

renderer.setAnimationLoop(function loop() {

    /* CLock。 */
    elapsed_time = clock.getElapsedTime();
    delta_time = elapsed_time - previous_time;
    previous_time = elapsed_time;

    /* 渲染局部泛光。 */
    for (const object3d of other_object3d_map.keys()) object3d.material = material_0x000000;

    scene.fog.color.set(0x000000);
    scene.background.set(0x000000);

    composer_bloom.render();

    other_object3d_map.forEach((material, object3d) => object3d.material = material);

    scene.fog.color.set(0x262837);
    scene.background.set(0x262837);

    /* 模型动画。 */
    mixer && mixer.update(delta_time);

    /* 更新Light的helper。 */
    updateLight();

    /* 更新ontrols。 */
    controls.update();

    /*  */
    composer_final.render();

});

/* Resize */
window.addEventListener("resize", _ => {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    composer_bloom.setSize(width, height);
    composer_final.setSize(width, height);

});
