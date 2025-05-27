<script>
  import {onMount} from "svelte";
  import * as ThreeJs from 'three';
  import {Vector3} from "three";
  import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

  const width = window.innerWidth;
  const height = window.innerHeight;

  const boxSize = 0.9;
  const dataJson = {
    shipName: "Cutlass Black",
    hangarSize: "Medium",
    cargoSize: 46,
    grids: [
      {
        name: "Main grid",
        position: new Vector3(0, 0, 4),
        centerX: true,
        sizeX: 4,
        sizeY: 2,
        sizeZ: 5,
      },
      {
        name: "Dropseat Grid",
        position: new Vector3(0, 0, 0),
        centerX: true,
        sizeX: 1,
        sizeY: 2,
        sizeZ: 3,
      }
    ],
  };

  class ShipRenderer {
      shipGridInformation = {}
      renderedGridInfo = []

      canvas = null
      renderer = null
      camera = null
      controls = null

      width = null
      height = null

      currentGridBounds = null

      /**
       * @param {HTMLElement} parentElement
       * @param {ThreeJs.WebGLRenderer} renderer
       * @param {ThreeJs.PerspectiveCamera} camera
       */
      constructor(parentElement, renderer, camera) {
          this.canvas = parentElement;
          this.renderer = renderer;
          this.camera = camera;
          this.scene = new ThreeJs.Scene();
      }

      /**
       * @param {{shipName: string, hangarSize: string, cargoSize: number, grids: {name: string, position: Vector3, centerX: boolean, sizeX: number, sizeY: number, sizeZ: number}[]}} shipGridInformation
       */
      start(shipGridInformation) {
        this.setupLighting();
        this.setSize(width, height);
        this.setupCanvas();

        this.renderer.setAnimationLoop( () => {this.animate()} );
        this.loadGridInfo(shipGridInformation);

        this.setupCamera();
      }

      /**
       * @param {{shipName: string, hangarSize: string, cargoSize: number, grids: {name: string, position: Vector3, centerX: boolean, sizeX: number, sizeY: number, sizeZ: number}[]}} shipGridInformation
       * @param reRender
       */
      loadGridInfo(shipGridInformation, reRender = false) {
          this.shipGridInformation = shipGridInformation;
          this.currentGridBounds = ShipRenderer.determineMaxGridBounds(shipGridInformation);

          console.log(this.currentGridBounds)

          if (reRender) {
              this.clearModels();
          }

          this.createModels();
      }

      clearModels() {
          console.error("NOT IMPLEMENTED")
      }

      /**
       * @param {{name: string, position: Vector3, centerX: boolean, sizeX: number, sizeY: number, sizeZ: number}} gridInformation
       * @returns {Vector3}
       */
      static determineGridOffsetVector(gridInformation) {
          let offsetX = 0;
          let offsetY = 0;
          let offsetZ = 0;

          if (gridInformation.centerX && gridInformation.centerX === true) {
              offsetX -= gridInformation.sizeX * 0.5;
          }

          return new Vector3(offsetX, offsetY, offsetZ);
      }

      /**
       * @param {{shipName: string, hangarSize: string, cargoSize: number, grids: {name: string, position: Vector3, centerX: boolean, sizeX: number, sizeY: number, sizeZ: number}[]}} shipGridInformation
       * @return {Vector3}
       */
      static determineMaxGridBounds(shipGridInformation) {
        // This function does not take asymmetrical cargo grids into account!!
        let maxX = 0;
        let maxY = 0;
        let maxZ = 0;

        for (let i = 0, gridAmount = shipGridInformation.grids.length; i < gridAmount; ++i) {
          const currentGrid = shipGridInformation.grids[i];

          const gridXSize = currentGrid.centerX ? currentGrid.sizeX * 0.5 : currentGrid.sizeX;

          const gridX = gridXSize + Math.abs(currentGrid.position.x);
          const gridY = currentGrid.sizeY + Math.abs(currentGrid.position.y);
          const gridZ = currentGrid.sizeZ + Math.abs(currentGrid.position.z);

          maxX = gridX > maxX ? gridX : maxX;
          maxY = gridY > maxY ? gridY : maxY;
          maxZ = gridZ > maxZ ? gridZ : maxZ;
        }

        return new Vector3(maxX, maxY, maxZ);
      }

      createModels() {
          for (let i = 0, c = this.shipGridInformation.grids.length; i < c; ++i) {
              const baseInfo = this.shipGridInformation.grids[i];

              // create grid obj
              const gridInfo = {
                  name: baseInfo.name,
                  offset: ShipRenderer.determineGridOffsetVector(baseInfo),
                  boxes: [],
              };

              const boxAmt = baseInfo.sizeX * baseInfo.sizeY * baseInfo.sizeZ;
              const layerBoxAmount = baseInfo.sizeX * baseInfo.sizeY;

              // loop through boxes and add to rGI object that was pushed
              for (let i = 0; i < boxAmt; ++i) {
                  const tempBox = new ThreeJs.BoxGeometry(boxSize, boxSize, boxSize);
                  const boxObject = new ThreeJs.Mesh(tempBox, new ThreeJs.MeshBasicMaterial({ color: 0xaaffaa }));

                  const boxNumber = i + 1;

                  // figure out box pos
                  const rawPosX = (boxNumber % baseInfo.sizeX) - 1;
                  const xRowsCompleted = Math.floor(i / baseInfo.sizeX);

                  const posX = rawPosX < 0 ? baseInfo.sizeX - 1 : rawPosX;
                  const posY = (xRowsCompleted % baseInfo.sizeY);
                  const posZ = (Math.floor(i / layerBoxAmount));

                  boxObject.position.set(posX, posY, posZ);
                  boxObject.position.add(baseInfo.position);
                  boxObject.position.add(gridInfo.offset);

                  this.scene.add(boxObject);
                  gridInfo.boxes.push(boxObject);
              }

              // push to rGI for later reference
              this.renderedGridInfo.push(gridInfo)
          }
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
          const camDistance = Math.max(this.currentGridBounds.x * 2, this.currentGridBounds.y * 2, this.currentGridBounds.z) * 0.6
          this.camera.position.set(camDistance, camDistance, camDistance)

          this.controls = new OrbitControls(this.camera, this.canvas);

          this.controls.target.set(
              -0.5,
              (this.currentGridBounds.y * 0.5),
              (this.currentGridBounds.z * 0.5) - 0.5
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
        this.renderer.render( this.scene, this.camera );
      }
  }

  onMount(() => {
    const canvasElement = document.getElementById("app_container")
    const renderer = new ThreeJs.WebGLRenderer();
    // const camera = new ThreeJs.OrthographicCamera(10, 10, 10, 10, 1, 100);
    const camera = new ThreeJs.PerspectiveCamera(80, width / height, 0.1, 1000);

    const shipRenderer = new ShipRenderer(canvasElement, renderer, camera);

    shipRenderer.start(dataJson)
  })
</script>

<main id="app_container"></main>

<style>
</style>
