import {Vector3} from "three";

/**
 * @description An object that contains the rendering parameters for the grid
 * @typedef Grid
 * @type {object}
 * @property {string} name
 * @property {Vector3} offset
 * @property {boolean} centerX
 * @property {number} sizeX
 * @property {number} sizeY
 * @property {number} sizeZ
 */

/**
 * @description An object for grouping grids, created to enable position offsets based on the group position for repeating complex grids (i.e. caterpillar).
 * @typedef GridGroup
 * @type {object}
 * @property {string} name
 * @property {Vector3} position
 * @property {Grid[]} grids
 */
