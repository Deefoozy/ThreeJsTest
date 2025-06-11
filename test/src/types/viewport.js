import {Camera, WebGLRenderer, Vector3, Euler} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

const radigrees = Math.PI / 180

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
 * @typedef CameraInformation
 * @property {Vector3} position
 * @property {Euler?} rotation
 */

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
 * @enum {CameraInformation}
 */
export const CameraPosition = {
  FRONT: {
    position: new Vector3(0, 0, 1),
  },
  SIDE: {
    position: new Vector3(1, 0, 0),
    rotation: new Euler(0, radigrees * 90, 0)
  },
  TOP: {
    position: new Vector3(0, 1, 0),
    rotation: new Euler(-(radigrees * 90), 0, 0)
  },
  EQUAL: {
    position: new Vector3(1, 1, 1),
  },
}

/**
 * @typedef Viewport
 * @type {object}
 * @property {boolean?} mainCamera
 * @property {string?} name
 * @property {Camera} camera
 * @property {?CameraType} cameraType // default should be interpreted as PERSPECTIVE
 * @property {CameraPosition} cameraPosition
 * @property {Element} canvas
 * @property {WebGLRenderer} renderer
 * @property {boolean} useControls
 * @property {?OrbitControls} controls
 */
