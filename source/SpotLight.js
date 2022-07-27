import * as three from "three";

/**
 * SpotLight。
 * @param   {Object}        [options = {}]                       - 参数集合。
 * @param   {number}        [options.color = 0xffffff]           - 颜色。
 * @param   {number}        [options.intensity = 10]             - 强度。
 * @param   {number}        [options.distance = 50]              - 距离。
 * @param   {number}        [options.angle = 0.3]                - 角度。
 * @param   {number}        [options.penumbra = 1]               - 半影衰减百分比。
 * @param   {Array<number>} [options.targetPosition = [0, 0, 0]] - 目标位置（默认值是原点，如果设置为其他坐标，则需要主动将光源的target加入到场景中）。
 * @param   {boolean}       [options.castShadow = true]          - 是否投射阴影。
 * @param   {Array<number>} [options.mapSize = [1024, 1024]]     - 阴影贴图的宽度和高度（必须设置为2的次幂）。
 * @param   {number}        [options.near = 0.1]                 - 阴影相机的near。
 * @param   {number}        [options.far = 20]                   - 阴影相机的far。
 * @returns {Obect}                                              - three.SpotLight实例。
 */
export default function ({
    color = 0xffffff,
    intensity = 10,
    distance = 50,
    angle = 0.3,
    penumbra = 1,
    decay = 0,
    targetPosition = [0, 0, 0],
    castShadow = true,
    mapSize = [1024, 1024],
    near = 0.1,
    far = 20,
} = {}) {

    const light = new three.SpotLight();

    light.color = new three.Color(color);
    light.intensity = intensity;
    light.angle = angle;
    light.penumbra = penumbra;
    light.decay = decay;
    light.distance = distance;

    light.castShadow = castShadow;
    light.shadow.mapSize.set(...mapSize);
    light.shadow.camera.near = near;
    light.shadow.camera.far = far;

    light.target.position.set(...targetPosition);

    return light;

}
