import "../types/grids.js"
import "../types/jsonGrids.js"

import * as ThreeJs from "three";
import {Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

/**
 * @property {ShipInfo} shipGridInformation
 * @property {ThreeJs.Material[]} materials
 * @property {ThreeJs.BoxGeometry} boxGeometry
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
  materials;
  boxGeometry;

  canvas;
  renderer;
  camera;
  controls;

  width;
  height;

  currentGridBounds = null
  boxSize = 0.9

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
  }

  /**
   * @param {ShipInfo} shipGridInformation
   */
  start(shipGridInformation) {
    this.createMaterials();
    this.createBoxGeometry();
    this.setupLighting();
    this.setSize(this.width, this.height);
    this.setupCanvas();

    this.setupControls()

    this.loadGridInfo(shipGridInformation);

    this.renderer.setAnimationLoop(() => {
      this.animate()
    });
  }

  createBoxGeometry() {
    this.boxGeometry = new ThreeJs.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
  }

  createMaterials() {
    this.materials = [
      new ThreeJs.MeshBasicMaterial({color: 0x2222ff}),
      new ThreeJs.MeshBasicMaterial({color: 0xff2222})
    ];
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
    this.setupCamera();
  }

  clearModels() {
    this.scene.clear()
  }

  /**
   * @param {Grid} gridInformation
   * @returns {Vector3}
   */
  static determineGridOffsetVector(gridInformation) { // should be renamed, something like internalOffset?
    let offsetX = 0;
    let offsetY = 0;
    let offsetZ = 0;

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

        const gridX = grid.sizeX + Math.abs(absolutePosition.x);
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
        const gridOffset = ShipRenderer.determineGridOffsetVector(grid)

        const boxAmt = grid.sizeX * grid.sizeY * grid.sizeZ;
        const layerBoxAmount = grid.sizeX * grid.sizeY;

        // loop through boxes and add to rGI object that was pushed
        for (let i = 0; i < boxAmt; ++i) {
          const boxNumber = i + 1;

          // figure out box pos
          const rawPosX = (boxNumber % grid.sizeX) - 1;
          const xRowsCompleted = Math.floor(i / grid.sizeX);

          const posX = rawPosX < 0 ? grid.sizeX - 1 : rawPosX;
          const posY = (xRowsCompleted % grid.sizeY);
          const posZ = (Math.floor(i / layerBoxAmount));

          const positionVector3 = new Vector3(posX, posY, posZ)

          // perhaps it is an idea to create an object for each grid. refactor feed.
          positionVector3.add(grid.offset);

          const boxParams = group.boxParams ?? {};

          const boxObject = new ThreeJs.Mesh(
            this.boxGeometry,
            this.determineBlockMaterial(
              boxParams.size ?? 2,
              positionVector3.x,
              positionVector3.y,
              positionVector3.z,
              this.materials,
              boxParams.offsetX ?? 0,
              boxParams.offsetY ?? 0,
              boxParams.offsetZ ?? 0,
            )
          );

          positionVector3.add(group.position);
          positionVector3.add(gridOffset);
          boxObject.position.add(positionVector3);

          this.scene.add(boxObject);
        }
      }
    );
  }

  determineBlockMaterial(cubeSize, posX, posY, posZ, materials, offsetX = 0, offsetY = 0, offsetZ = 0) {
    // x | 0 is a bitwise operation which in this case converts the numbers into ints internally having the side effect of flooring the number.
    // I should benchmark this against other options like Math.Floor
    const posXTemp = ((posX + offsetX) / cubeSize) | 0;
    const posYTemp = ((posY + offsetY) / cubeSize) | 0;
    const posZTemp = ((posZ + offsetZ) / cubeSize) | 0;

    // Determine if the rounded numbers are even or uneven, and using the Z axis modulo result as offset
    const posZModulo = posZTemp % cubeSize;
    const posXModulo = posXTemp % cubeSize;
    const posYModulo = (posYTemp + posZModulo) % cubeSize;

    const materialIndex = posXModulo === posYModulo ? 1 : 0

    return materials[materialIndex]
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
    const centerX = (this.currentGridBounds.x * 0.5) - 0.5;
    const centerY = (this.currentGridBounds.y * 0.5) - 0.5;
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

    this.controls.target.set(
      centerX,
      centerY,
      centerZ
    );

    this.controls.update();
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
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
