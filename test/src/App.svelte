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
        position: new Vector3(0, 0, 0),
        centerX: true,
        centerY: false,
        centerZ: false,
        sizeX: 4,
        sizeY: 4,
        sizeZ: 4,
      },
      {
        name: "Dropseat Grid",
        position: new Vector3(0, 0, -4),
        centerX: true,
        centerY: false,
        centerZ: false,
        sizeX: 1,
        sizeY: 3,
        sizeZ: 3,
      }
    ],
  };

  class ShipRenderer {
      gridInfo = {}
      renderedGridInfo = []

      canvas = null
      renderer = null
      camera = null
      controls = null

      width = null
      height = null

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
       * @param {{shipName: string, hangarSize: string, cargoSize: number, grids: {name: string, position: Vector3, centerX: boolean, centerY: boolean, centerZ: boolean, sizeX: number, sizeY: number, sizeZ: number}[]}} gridInformation
       */
      start(gridInformation) {
          this.setupLighting();
          this.setupCamera();
          this.setSize(width, height);
          this.setupCanvas();

          this.renderer.setAnimationLoop( () => {this.animate()} );

          this.loadGridInfo(gridInformation);
      }

      /**
       * @param {{shipName: string, hangarSize: string, cargoSize: number, grids: {name: string, position: Vector3, centerX: boolean, centerY: boolean, centerZ: boolean, sizeX: number, sizeY: number, sizeZ: number}[]}} gridInformation
       * @param reRender
       */
      loadGridInfo(gridInformation, reRender = false) {
          this.gridInfo = gridInformation

          if (reRender) {
              this.clearModels()
          }

          this.createModels()
      }

      clearModels() {
          console.error("NOT IMPLEMENTED")
      }

      /**
       * @param {{name: string, position: Vector3, centerX: boolean, centerY: boolean, centerZ: boolean, sizeX: number, sizeY: number, sizeZ: number}} gridInformation
       */
      determineGridOffsetVector(gridInformation) {
          let offsetX = 0;
          let offsetY = 0;
          let offsetZ = 0;

          if (gridInformation.centerX && gridInformation.centerX === true) {
              offsetX -= gridInformation.sizeX * 0.5
          }

          return new Vector3(offsetX, offsetY, offsetZ)
      }

      createModels() {
          for (let i = 0, c = this.gridInfo.grids.length; i < c; ++i) {
              const baseInfo = this.gridInfo.grids[i];

              // create grid obj
              const gridInfo = {
                  name: baseInfo.name,
                  offset: this.determineGridOffsetVector(baseInfo),
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
                  boxObject.position.add(gridInfo.offset)

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
          this.camera.position.set(5, 5, 5)

          this.controls = new OrbitControls(this.camera, this.canvas);
          this.controls.target.set(-0.5, 1, 0);
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
