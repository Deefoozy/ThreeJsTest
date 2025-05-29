<script>
  import {onMount} from "svelte";
  import * as ThreeJs from 'three';

  import ShipInfo from "./classes/shipInfo.js";
  import FileLoader from "./classes/fileLoader.js";
  import ShipRenderer from "./classes/shipRenderer.js";

  const ship = new ShipInfo(
    JSON.parse(
      FileLoader.loadFromFS("NOT IMPLEMENTED")
    )
  )

  const width = window.innerWidth;
  const height = window.innerHeight;

  onMount(() => {
    const canvasElement = document.getElementById("app_container")
    const renderer = new ThreeJs.WebGLRenderer();
    // const camera = new ThreeJs.OrthographicCamera(10, 10, 10, 10, 1, 100);
    const camera = new ThreeJs.PerspectiveCamera(80, width / height, 0.1, 1000);

    const shipRenderer = new ShipRenderer(
      canvasElement,
      renderer,
      camera,
      width,
      height
    );

    shipRenderer.start(ship)
  })
</script>

<main id="app_container"></main>

<style>
</style>
