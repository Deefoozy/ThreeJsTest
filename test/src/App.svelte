<script>
  import {onMount} from "svelte";
  import * as ThreeJs from 'three';

  import ShipInfo from "./classes/shipInfo.js";
  import ShipRenderer from "./classes/shipRenderer.js";
  import {CameraType, CameraPosition} from "./types/viewport.js";
  import {resolveResource} from "@tauri-apps/api/path";
  import {readTextFile} from "@tauri-apps/plugin-fs";

  const width = window.innerWidth * 0.5;
  const height = window.innerHeight;

  onMount(() => {
    const canvasElements = document.getElementsByClassName("camera_container")

    const viewports = [
      {
        camera: new ThreeJs.PerspectiveCamera(80, width / height, 0.1, 1000),
        cameraType: CameraType.PERSPECTIVE,
        cameraPosition: CameraPosition.EQUAL,
        canvas: canvasElements[0],
        renderer: new ThreeJs.WebGLRenderer(),
        useControls: true,
      },
      {
        camera: new ThreeJs.PerspectiveCamera(80, width / height, 0.1, 1000),
        cameraType: CameraType.PERSPECTIVE,
        cameraPosition: CameraPosition.TOP,
        canvas: canvasElements[1],
        renderer: new ThreeJs.WebGLRenderer(),
        useControls: true,
      },
    ]

    const shipRenderer = new ShipRenderer(
      viewports,
      width,
      height
    );

    /**
     * @type {ShipInfo}
     */
    let ship;

    const resourcePrefix = "resources/ship_manufacturers/";

    const ships = [
      "drake/caterpillar",
      "drake/corsair",
      "drake/cutlassBlack",
      "drake/cutlassBlue",
      "drake/cutlassRed",
      "drake/cutter",
      "drake/cutterRambler",
      "drake/cutterScout",
      "drake/vulture",
    ]

    /**
     * @param {string} shipFile
     */
    function getShipLayout(shipFile) {
      // Yes, I hate this.
      resolveResource(resourcePrefix + shipFile + ".json").then(
        (value) => {
          readTextFile(value).then(
            (value) => {
              ship = new ShipInfo(
                JSON.parse(value)
              )

              shipRenderer.loadGridInfo(ship, true)
            }
          )
        }
      )
    }

    let shipIndex = 0;

    // Yes, I hate this.
    resolveResource(resourcePrefix + ships[shipIndex] + ".json").then(
      (value) => {
        readTextFile(value).then(
          (value) => {
            ship = new ShipInfo(
              JSON.parse(value)
            )

            shipRenderer.start(ship)

            ++shipIndex

            if (shipIndex >= ships.length) {
              shipIndex = 0;
            }
          }
        )
      }
    )

    setInterval(
      () => {
        getShipLayout(ships[shipIndex]);

        ++shipIndex

        if (shipIndex >= ships.length) {
          shipIndex = 0;
        }
      }, 5000
    )
  })
</script>

<main id="app_container">
  <div class="camera_container"></div>
  <div class="camera_container"></div>
</main>

<style>
</style>
