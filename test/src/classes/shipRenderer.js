import "../types/grids.js"
import "../types/jsonGrids.js"
import "../types/viewport.js"

import {AmbientLight, Box3, BoxGeometry, Object3D, Material, Mesh, MeshBasicMaterial, Scene, Vector3} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {CameraPosition, CameraType, getAxisByIndexes, returnZeroAxisIndexes} from "../types/viewport.js";

/**
 * @property {ShipInfo} shipGridInformation
 * @property {Material[]} materials
 * @property {BoxGeometry} boxGeometry
 * @property {Scene} scene
 * @property {Object3D} gridCollection
 * @property {Box3} currentGridBounds
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
    this.gridCollection = new Object3D();
    this.currentGridBounds = new Box3();
    this.viewports = viewports;
    this.scene = new Scene();

    this.scene.add(this.gridCollection);
  }

  /**
   * @param {ShipInfo} shipGridInformation
   */
  start(shipGridInformation) {
    this.createMaterials();
    this.createBoxGeometry();
    // this.setupLighting(); // Does not seem to be doing anything currently
    this.setupViewports();

    this.loadGridInfo(shipGridInformation);

    this.setSize();
  }

  createBoxGeometry() {
    this.boxGeometry = new BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
  }

  createMaterials() {
    this.materials = [
      new MeshBasicMaterial({color: 0xffffff}),
      new MeshBasicMaterial({color: 0xaaaaaa})
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
    if (reRender) {
      this.clearGrids();
    }

    this.createModels();

    this.updateGridBox();
    this.updateCameraPositions();
    this.setSize();
    this.updateInformationTextElements();
  }

  clearGrids() {
    this.gridCollection.clear();
  }

  updateGridBox() {
    this.currentGridBounds.setFromObject(
      this.gridCollection
    );
  }

  createModels() {
    /**
     * @type {Object3D[]}
     */
    let gridObject3DCollections = [];
    let currentObject3DCollection = null;

    this.shipGridInformation.iterateOverAllGrids(
      (grid, group, indexes) => {
        // When gridIndex === 0 we are on a new group, hence we create a new groupCollection to work with
        if (indexes.gridIndex === 0) {
          currentObject3DCollection = new Object3D();

          currentObject3DCollection.position.add(group.position);
          gridObject3DCollections.push(currentObject3DCollection);
        }

        const currentGridCollection = new Object3D();
        currentGridCollection.position.add(grid.offset);

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

          const boxPosition = new Vector3(posX, posY, posZ);

          /** @type {MaterialInterpolationParameters} */
          const boxParams = group.boxParams ?? {};

          const boxObject = new Mesh(
            this.boxGeometry,
            this.determineBlockMaterial(
              boxParams.size ?? 2,
              boxPosition.x,
              boxPosition.y,
              boxPosition.z,
              this.materials,
              boxParams.offsetX ?? 0,
              boxParams.offsetY ?? 0,
              boxParams.offsetZ ?? 0,
            )
          );

          boxObject.position.add(boxPosition);

          currentGridCollection.add(boxObject);
        }

        currentObject3DCollection.add(currentGridCollection);
      }
    );

    for (let gridObject3DIndex = 0, gridObject3DLength = gridObject3DCollections.length; gridObject3DIndex < gridObject3DLength; ++gridObject3DIndex) {
      this.gridCollection.add(gridObject3DCollections[gridObject3DIndex]);
    }

    this.centerGricCollection();
  }

  centerGricCollection() {
    this.updateGridBox();

    const tempSize = new Vector3();
    this.currentGridBounds.getSize(tempSize);

    tempSize.multiply(new Vector3(-0.5, -0.5, -0.5));
    tempSize.round()
    tempSize.add(new Vector3(0.5, 0.5, 0.5))

    this.gridCollection.position.set(0, 0, 0)
    this.gridCollection.position.add(tempSize);
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

  updateInformationTextElements() {
    for (let i = 0, l = this.viewports.length; i < l; ++i) {
      this.updateInformationText(this.viewports[i]);
    }
  }

  updateInformationText(viewport) {
    const textElements = viewport.canvas.getElementsByClassName("camera_container-information");

    if (textElements.length > 0) {
      const usedElement = textElements[0];

      while (usedElement.firstChild) {
        usedElement.removeChild(usedElement.lastChild)
      }

      let text;
      if (viewport.mainCamera) {
        text = `
          ship name: ${this.shipGridInformation.shipName} | 
          hangar size: ${this.shipGridInformation.hangarSize} | 
          cargo size: ${this.shipGridInformation.cargoSize} | 
          landable: ${this.shipGridInformation.canLand}
        `;
      } else {
        text = viewport.name ?? ""
      }

      usedElement.appendChild(document.createTextNode(text));
    }
  }

  setupLighting() {
    const color = 0xFF0000;
    const intensity = 1000;
    this.scene.add(new AmbientLight(color, intensity));
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
    const center = new Vector3();
    this.currentGridBounds.getCenter(center);

    const size = new Vector3();
    this.currentGridBounds.getSize(size);

    let camDistance;
    // Camera distance setting needs some adjustments for consistency
    switch (viewport.cameraType) {
      case CameraType.PERSPECTIVE:
        camDistance = Math.ceil(
          Math.max(
            size.x * 4,
            size.y * 4,
            size.z
          ) * 0.6
        )

        break;
      case CameraType.ORTHOGRAPHIC:
        camDistance = Math.max(
          size.x,
          size.y,
          size.z
        ) + 5;
        let aspect = viewport.canvas.getBoundingClientRect().width / viewport.canvas.getBoundingClientRect().width

        this.updateOrthoSize(viewport, aspect)

        break;
    }

    const camDistanceVector = new Vector3(camDistance, camDistance, camDistance)
    camDistanceVector.multiply(viewport.cameraPosition.position)

    viewport.camera.position.set(center.x, center.y, center.z);
    viewport.camera.position.add(camDistanceVector)

    if (viewport.useControls) {
      console.log("using controls")

      viewport.controls.target.set(center.x, center.y, center.z);

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
      const tempSizeVector = new Vector3()
      this.currentGridBounds.getSize(tempSizeVector)

      // Uses 0 values used in CameraPosition to determine relevant axes for size. will not work with CameraPosition.EQUAL
      orthographicViewportSize = Math.max(
        ...getAxisByIndexes(
          tempSizeVector,
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
