import "../types/grids.js"
import "../types/jsonGrids.js"
import "../types/viewport.js"

import * as ThreeJs from "three";
import {Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {CameraPosition, CameraType, getAxisByIndexes, returnZeroAxisIndexes} from "../types/viewport.js";

/**
 * @property {ShipInfo} shipGridInformation
 * @property {ThreeJs.Material[]} materials
 * @property {ThreeJs.BoxGeometry} boxGeometry
 * @property {ThreeJs.Scene} scene
 * @property {?Vector3} currentGridBounds
 * @property {number} boxSize
 * @property {Viewport[]} viewports
 * @property {OrbitControls} controls
 */
export default class ShipRenderer {
  shipGridInformation;
  materials;
  boxGeometry;

  controls;
  viewports;

  currentGridBounds = null
  boxSize = 0.9

  /**
   * @param {Viewport[]} viewports
   */
  constructor(viewports) {
    this.viewports = viewports;
    this.scene = new ThreeJs.Scene();
  }

  /**
   * @param {ShipInfo} shipGridInformation
   */
  start(shipGridInformation) {
    this.createMaterials();
    this.createBoxGeometry();
    this.setupLighting();
    this.setupViewports();

    this.loadGridInfo(shipGridInformation);

    this.setSize();
  }

  createBoxGeometry() {
    this.boxGeometry = new ThreeJs.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
  }

  createMaterials() {
    this.materials = [
      new ThreeJs.MeshBasicMaterial({color: 0xffffff}),
      new ThreeJs.MeshBasicMaterial({color: 0xaaaaaa})
    ];

    // this.materials = [
    //   new MeshNormalMaterial(),
    //   new MeshNormalMaterial(),
    // ]
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

    this.updateCameraPositions();
    this.setSize();
  }

  clearModels() {
    this.scene.clear()
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

          /** @type {MaterialInterpolationParameters} */
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

  setupViewports() {
    for (let i = 0, l = this.viewports.length; i < l; ++i) {
      const currentViewport = this.viewports[i];
      const canvas = currentViewport.canvas;
      const renderer = currentViewport.renderer;

      canvas.appendChild(renderer.domElement)

      this.setupControls(currentViewport);

      renderer.setAnimationLoop(
        this.buildAnimationCallback(currentViewport)
      );
    }
  }

  setupLighting() {
    const color = 0xFFFFFF;
    const intensity = 1;
    this.scene.add(new ThreeJs.AmbientLight(color, intensity));
  }

  updateCameraPositions() {
    for (let i = 0, l = this.viewports.length; i < l; ++i) {
      this.updateCameraPosition(this.viewports[i])
    }
  }

  /**
   * @param {Viewport} viewport
   */
  updateCameraPosition(viewport) {
    const centerX = (this.currentGridBounds.x * 0.5) - 0.5;
    const centerY = (this.currentGridBounds.y * 0.5) - 0.5;
    const centerZ = (this.currentGridBounds.z * 0.5) - 0.5;

    let camDistance;
    // Camera distance setting needs some adjustments for consistency
    switch (viewport.cameraType) {
      case CameraType.PERSPECTIVE:
        camDistance = Math.ceil(
          Math.max(
            this.currentGridBounds.x * 2,
            this.currentGridBounds.y * 2,
            this.currentGridBounds.z
          ) * 0.6
        )
        break;
      case CameraType.ORTHOGRAPHIC:
        camDistance = Math.max(
          this.currentGridBounds.x,
          this.currentGridBounds.y,
          this.currentGridBounds.z
        ) + 5;
        let aspect = viewport.canvas.getBoundingClientRect().width / viewport.canvas.getBoundingClientRect().width

        this.updateOrthoSize(viewport, aspect)

        break;
    }

    const camDistanceVector = new Vector3(camDistance, camDistance, camDistance)
    camDistanceVector.multiply(viewport.cameraPosition.position)

    viewport.camera.position.set(centerX, centerY, centerZ);
    viewport.camera.position.add(camDistanceVector)

    if (viewport.useControls) {
      console.log("using controls")

      viewport.controls.target.set(centerX, centerY, centerZ);

      viewport.controls.update();
    } else if (viewport.cameraPosition.rotation !== undefined) {
      viewport.camera.rotation.copy(viewport.cameraPosition.rotation)
    }
  }

  /**
   * @param {Viewport} viewport
   */
  setupControls(viewport) {
    if (viewport.useControls) {
      console.log("setting up controls")
      viewport.controls = new OrbitControls(viewport.camera, viewport.canvas);
      viewport.controls.update();
    }
  }

  setSize() {
    for (let i = 0, l = this.viewports.length; i < l; ++i) {
      const width = this.viewports[i].canvas.getBoundingClientRect().width;
      const height = this.viewports[i].canvas.getBoundingClientRect().height

      console.log(width, height, width / height);

      this.viewports[i].renderer.setSize(width, height);

      switch (this.viewports[i].cameraType) {
        case CameraType.ORTHOGRAPHIC:
          this.updateOrthoSize(this.viewports[i], width / height)
          break;
        case CameraType.PERSPECTIVE:
          this.viewports[i].camera.aspect = width / height
          this.viewports[i].camera.updateProjectionMatrix()
          break;
      }
    }
  }

  updateOrthoSize(viewport, aspect) {
    let orthographicViewportSize = 20
    if (viewport.cameraPosition !== CameraPosition.EQUAL) {
      // Uses 0 values used in CameraPosition to determine relevant axes for size. will not work with CameraPosition.EQUAL
      orthographicViewportSize = Math.max(
        ...getAxisByIndexes(
          this.currentGridBounds,
          returnZeroAxisIndexes(viewport.cameraPosition.position)
        )
      ) + 2
    }

    viewport.camera.left = orthographicViewportSize * aspect / -2
    viewport.camera.right = orthographicViewportSize * aspect / 2
    viewport.camera.top = orthographicViewportSize / 2
    viewport.camera.bottom = orthographicViewportSize / -2

    viewport.camera.updateProjectionMatrix()
  }

  /**
   * @param {Viewport} viewport
   * @returns {function}
   */
  buildAnimationCallback(viewport) {
    return () => {
      viewport.renderer.render(this.scene, viewport.camera)
    }
  }
}
