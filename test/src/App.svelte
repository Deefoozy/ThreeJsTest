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
        sizeX: 4,
        sizeY: 4,
        sizeZ: 4,
      },
      {
        name: "Dropseat Grid",
        position: new Vector3(-2, 0, 1),
        sizeX: 1,
        sizeY: 3,
        sizeZ: 3,
      }
    ],
  };


  const renderer = new ThreeJs.WebGLRenderer();
  renderer.setSize(width, height)

  onMount(() => {
    const canvasElement = document.getElementById("app_container")

    canvasElement.appendChild(renderer.domElement)

    // const camera = new ThreeJs.OrthographicCamera(10, 10, 10, 10, 1, 100);
    const camera = new ThreeJs.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(1.5, 1.5, 10)

    // Set up FreqVars
    const scene = new ThreeJs.Scene();
    const material = new ThreeJs.MeshBasicMaterial({ color: 0xaaffaa });

    // Set up lighting
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new ThreeJs.AmbientLight(color, intensity);
    scene.add(light);

    // Set up camera controls
    const controls = new OrbitControls(camera, canvasElement);
    controls.target.set(0, 5, 0);
    controls.update();

    const renderedGridInformation = [];

    for (let i = 0, c = dataJson.grids.length; i < c; ++i) {
      const BaseInfo = dataJson.grids[i];

      // create grid obj
      const gridInfo = {
        name: BaseInfo.name,
        boxes: [],
      };

      const boxAmt = BaseInfo.sizeX * BaseInfo.sizeY * BaseInfo.sizeZ;
      const layerBoxAmount = BaseInfo.sizeX * BaseInfo.sizeY;

      // loop through boxes and add to rGI object that was pushed
      for (let i = 0; i < boxAmt; ++i) {
        const tempBox = new ThreeJs.BoxGeometry(boxSize, boxSize, boxSize);
        const boxObject = new ThreeJs.Mesh(tempBox, material);

        const boxNumber = i + 1;

        // figure out box pos
        const rawPosX = (boxNumber % BaseInfo.sizeX) - 1;
        const xRowsCompleted = Math.floor(i / BaseInfo.sizeX);

        const posX = rawPosX < 0 ? BaseInfo.sizeX - 1 : rawPosX;
        const posY = (xRowsCompleted % BaseInfo.sizeY);
        const posZ = (Math.floor(i / layerBoxAmount));

        boxObject.position.set(posX, posY, posZ);
        boxObject.position.add(BaseInfo.position)

        scene.add(boxObject);
        gridInfo.boxes.push(boxObject);
      }

      // push to rGI for later reference
      renderedGridInformation.push(gridInfo)
    }

    function animate() {
      renderer.render( scene, camera );
    }
    renderer.setAnimationLoop( animate );
  })
</script>

<main id="app_container"></main>

<style>
</style>
