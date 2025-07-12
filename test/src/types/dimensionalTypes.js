import {Vector3} from "three"

import {Calc} from "../classes/calc.js";

/**
 * @typedef BoundingVectors
 * @type {object}
 * @property {Vector3} maxVector
 * @property {Vector3} minVector
 * @property {Vector3} center
 * @property {Vector3} size
 */
export class BoundingVectors {
  constructor(max, min) {
    this.maxVector = max;
    this.minVector = min;

    this.center = this.getCenterVector();
    this.size = this.getSizeVector();
  }

  getCenterVector() {
    const centerX = Calc.getMidpoint(this.minVector.x, this.maxVector.x)
    const centerY = Calc.getMidpoint(this.minVector.y, this.maxVector.y)
    const centerZ = Calc.getMidpoint(this.minVector.z, this.maxVector.z)

    return new Vector3(centerX, centerY, centerZ);
  }

  getSizeVector() {
    const sizeX = Calc.getDelta(this.minVector.x, this.maxVector.x);
    const sizeY = Calc.getDelta(this.minVector.y, this.maxVector.y);
    const sizeZ = Calc.getDelta(this.minVector.z, this.maxVector.z);

    return new Vector3(sizeX, sizeY, sizeZ)
  }
}