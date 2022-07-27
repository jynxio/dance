import * as three from "three";

/**
 * 以圆锥体作为实体的SpotLightHelper。
 * @param {Object} light - SpotLight实例。
 * @param {number} color - 十六进制颜色值，用于设置Helper的颜色，缺省时将使用SpotLight的颜色。
 * @param {number} opacity - 属于[0, 1]的数字值，用于设置Helper的透明度，缺省时透明度为1。
 * @returns {Object} - SpotLightHelper实例。
 * @example new SpotLightHelper( new three.Spotlight() );
 */
export default class SpotLightHelper extends three.Object3D {

    constructor(light, color, opacity) {

        super();

        this.light = light;
        this.light.updateMatrixWorld();

        this.matrix = light.matrixWorld;
        this.matrixAutoUpdate = false;

        this.color = typeof (color) === "number" ? color : this.light.color.getHex();

        this.opacity = typeof (opacity) === "number" ? opacity : 1;

        const geometry = new three.ConeGeometry(1, 1, 512, 1, false, 0, Math.PI * 2)
            .translate(0, -0.5, 0)
            .rotateX(-Math.PI / 2);
        const material = new three.MeshBasicMaterial({ transparent: true });

        this.cone = new three.Mesh(geometry, material);
        this.add(this.cone);

        this.update();

    }

    dispose() {

        this.cone.geometry.dispose();
        this.cone.material.dispose();

    }

    update() {

        this.light.updateMatrixWorld();

        const coneLength = this.light.distance ? this.light.distance : 1000;
        const coneWidth = coneLength * Math.tan(this.light.angle);

        this.cone.scale.set(coneWidth, coneWidth, coneLength);

        this.cone.lookAt(new three.Vector3().setFromMatrixPosition(this.light.target.matrixWorld));

        this.cone.material.color.set(
            this.color === undefined ? this.light.color.getHex() : this.color
        );

        this.cone.material.opacity = this.opacity === undefined ? 1 : this.opacity;

    }

}