import "../types/grids.js"
import "../types/jsonGrids.js"

import * as ThreeJs from "three";
import {Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

/**
 * @typedef renderedGridInformation
 * @type {object}
 * @property {string} name
 * @property {Vector3} offset // Offsets determined by centering the grid. this is added to absolutePosition (doesn't make sense, Needs naming or logic fix)
 * @property {Vector3} absolutePosition // Grid position based on Grid offset added to Group position
 */

/**
 * @property {ShipInfo} shipGridInformation
 * @property {renderedGridInformation[]} renderedGridInfo
 * @property {HTMLElement} canvas
 * @property {ThreeJs.WebGLRenderer} renderer // Find parent class, would probably be a better fit
 * @property {ThreeJs.PerspectiveCamera} camera
 * @property {ThreeJs.Scene} scene
 * @property {number} width
 * @property {number} height
 * @property {?Vector3} currentGridBounds
 * @property {number} boxSize
 */
export default class ShipRenderer {
  shipGridInformation;
  renderedGridInfo;

  canvas;
  renderer;
  camera;
  controls;

  width;
  height;

  currentGridBounds = null
  boxSize = 0.5

  /**
   * @param {HTMLElement} parentElement
   * @param {ThreeJs.WebGLRenderer} renderer
   * @param {ThreeJs.PerspectiveCamera} camera
   * @param {number} width
   * @param {number} height
   */
  constructor(parentElement, renderer, camera,width, height) {
    this.canvas = parentElement;
    this.renderer = renderer;
    this.camera = camera;
    this.scene = new ThreeJs.Scene();

    this.width = width;
    this.height = height;

    this.renderedGridInfo = [];
  }

  /**
   * @param {ShipInfo} shipGridInformation
   */
  start(shipGridInformation) {
    this.setupLighting();
    this.setSize(this.width, this.height);
    this.setupCanvas();

    this.renderer.setAnimationLoop(() => {
      this.animate()
    });
    this.loadGridInfo(shipGridInformation);

    this.setupCamera();
  }

  /**
   * @param {ShipInfo} shipGridInformation
   * @param reRender
   */
  loadGridInfo(shipGridInformation, reRender = false) {
    this.shipGridInformation = shipGridInformation;
    this.currentGridBounds = ShipRenderer.determineMaxGridBounds(shipGridInformation);

    if (reRender) {
      this.clearModels();
    }

    this.createModels();
  }

  clearModels() {
    console.error("NOT IMPLEMENTED")
  }

  /**
   * @param {Grid} gridInformation
   * @returns {Vector3}
   */
  static determineGridOffsetVector(gridInformation) { // should be renamed, something like internalOffset?
    let offsetX = 0;
    let offsetY = 0;
    let offsetZ = 0;

    if (gridInformation.centerX && gridInformation.centerX === true) {
      offsetX -= gridInformation.sizeX * 0.5;
    }

    return new Vector3(offsetX, offsetY, offsetZ);
  }

  /**
   * @param {ShipInfo} shipGridInformation
   * @return {Vector3}
   */
  static determineMaxGridBounds(shipGridInformation) {
    // This function does not take asymmetrical cargo grids into account!!
    let maxX = 0;
    let maxY = 0;
    let maxZ = 0;

    shipGridInformation.iterateOverAllGrids(
      (grid, group) => {
        const absolutePosition = new Vector3(0,0,0);

        absolutePosition.add(grid.offset);
        absolutePosition.add(group.position);

        const gridXSize = grid.centerX ? grid.sizeX * 0.5 : grid.sizeX;

        const gridX = gridXSize + Math.abs(absolutePosition.x);
        const gridY = grid.sizeY + Math.abs(absolutePosition.y);
        const gridZ = grid.sizeZ + Math.abs(absolutePosition.z);

        maxX = gridX > maxX ? gridX : maxX;
        maxY = gridY > maxY ? gridY : maxY;
        maxZ = gridZ > maxZ ? gridZ : maxZ;
      }
    );

    return new Vector3(maxX, maxY, maxZ);
  }

  createModels() {
    this.shipGridInformation.iterateOverAllGrids(
      (grid, group) => {
        const absolutePosition = new Vector3(0, 0, 0);

        // perhaps it is an idea to create an object for each grid. refactor feed.
        absolutePosition.add(group.position);
        absolutePosition.add(grid.offset);

        // create grid obj
        const gridInfo = {
          name: grid.name,
          offset: ShipRenderer.determineGridOffsetVector(grid),
          absolutePosition: absolutePosition,
          boxes: [],
        };

        const boxAmt = grid.sizeX * grid.sizeY * grid.sizeZ;
        const layerBoxAmount = grid.sizeX * grid.sizeY;

        // loop through boxes and add to rGI object that was pushed
        for (let i = 0; i < boxAmt; ++i) {
          const tempBox = new ThreeJs.BoxGeometry(this.boxSize, this.boxSize, this.boxSize);
          const boxObject = new ThreeJs.Mesh(tempBox, new ThreeJs.MeshBasicMaterial({color: 0xaaffaa}));

          const boxNumber = i + 1;

          // figure out box pos
          const rawPosX = (boxNumber % grid.sizeX) - 1;
          const xRowsCompleted = Math.floor(i / grid.sizeX);

          const posX = rawPosX < 0 ? grid.sizeX - 1 : rawPosX;
          const posY = (xRowsCompleted % grid.sizeY);
          const posZ = (Math.floor(i / layerBoxAmount));

          boxObject.position.set(posX, posY, posZ);
          boxObject.position.add(gridInfo.absolutePosition);
          boxObject.position.add(gridInfo.offset);

          this.scene.add(boxObject);
          gridInfo.boxes.push(boxObject);
        }

        // push to rGI for later reference
        this.renderedGridInfo.push(gridInfo)
      }
    );
  }

  setupCanvas() {
    this.canvas.appendChild(this.renderer.domElement)
  }

  setupLighting() {
    const color = 0xFFFFFF;
    const intensity = 1;
    this.scene.add(new ThreeJs.AmbientLight(color, intensity));
  }

  setupCamera() {
    const centerX = -0.5;
    const centerY = this.currentGridBounds.y * 0.5;
    const centerZ = (this.currentGridBounds.z * 0.5) - 0.5;

    // Probably not the best way to scale this. google some more.
    const camDistance = Math.ceil(
      Math.max(
        this.currentGridBounds.x * 2,
        this.currentGridBounds.y * 2,
        this.currentGridBounds.z
      ) * 0.6
    )

    this.camera.position.set(
      centerX + camDistance,
      centerY + camDistance,
      centerZ + camDistance
    );

    this.controls = new OrbitControls(this.camera, this.canvas);

    this.controls.target.set(
      centerX,
      centerY,
      centerZ
    );

    this.controls.update();
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    this.width = width
    this.height = height

    this.renderer.setSize(width, height)
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
  }
}
