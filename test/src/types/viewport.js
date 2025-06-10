import {Camera, WebGLRenderer, Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

/**
 * @param {CameraPosition} cameraPosition
 * @returns {number[]}
 */
export function returnZeroAxisIndexes(cameraPosition) {
  const indexes = []

  for (let i = 0, l = 3; i < l; ++i) {
    if (cameraPosition.getComponent(i) === 0) indexes.push(i)
  }

  return indexes;
}

/**
 * @param {Vector3} vector
 * @param {number[]} indexes
 * @returns {number[]}
 */
export function getAxisByIndexes(vector, indexes) {
  const values = []

  for (let i = 0, l = indexes.length; i < l; ++i) {
    values.push(vector.getComponent(indexes[i]))
  }

  return values
}

/**
 * @readonly
 * @enum {number}
 */
export const CameraType = {
  PERSPECTIVE: 0,
  ORTHOGRAPHIC: 1,
}

/**
 * @readonly
 * @enum {Vector3}
 */
export const CameraPosition = {
  FRONT: new Vector3(0,0,1),
  SIDE: new Vector3(1,0,0),
  TOP: new Vector3(0,1,0),
  EQUAL: new Vector3(1,1,1),
}

/**
 * @typedef Viewport
 * @type {object}
 * @property {Camera} camera
 * @property {?CameraType} cameraType // default should be interpreted as PERSPECTIVE
 * @property {CameraPosition} cameraPosition
 * @property {Element} canvas
 * @property {WebGLRenderer} renderer
 * @property {boolean} useControls
 * @property {?OrbitControls} controls
 */
