<script>
  import {onMount} from "svelte";
  import * as ThreeJs from 'three';

  import ShipInfo from "./classes/shipInfo.js";
  import ShipRenderer from "./classes/shipRenderer.js";
  import {CameraType, CameraPosition} from "./types/viewport.js";
  import {resolveResource} from "@tauri-apps/api/path";
  import {readTextFile} from "@tauri-apps/plugin-fs";

  onMount(() => {
    const canvasElements = document.getElementsByClassName("camera_container")

    const aspect1 = canvasElements[0].getBoundingClientRect().width / canvasElements[0].getBoundingClientRect().height;
    const aspect2 = canvasElements[1].getBoundingClientRect().width / canvasElements[1].getBoundingClientRect().height;
    const aspect3 = canvasElements[2].getBoundingClientRect().width / canvasElements[2].getBoundingClientRect().height;
    const aspect4 = canvasElements[3].getBoundingClientRect().width / canvasElements[3].getBoundingClientRect().height;
    const orthoSize = 20;

    const viewports = [
      {
        camera: new ThreeJs.PerspectiveCamera(80, aspect1, 0.1, 1000),
        cameraType: CameraType.PERSPECTIVE,
        cameraPosition: CameraPosition.EQUAL,
        canvas: canvasElements[0],
        renderer: new ThreeJs.WebGLRenderer(),
        useControls: true,
      },
      {
        camera: new ThreeJs.OrthographicCamera( orthoSize * aspect2 / -2, orthoSize * aspect2 / 2, orthoSize / 2, orthoSize / -2, 1, 1000),
        cameraType: CameraType.ORTHOGRAPHIC,
        cameraPosition: CameraPosition.TOP,
        canvas: canvasElements[1],
        renderer: new ThreeJs.WebGLRenderer(),
        useControls: false,
      },
      {
        camera: new ThreeJs.OrthographicCamera( orthoSize * aspect3 / -2, orthoSize * aspect3 / 2, orthoSize / 2, orthoSize / -2, 1, 1000),
        cameraType: CameraType.ORTHOGRAPHIC,
        cameraPosition: CameraPosition.FRONT,
        canvas: canvasElements[2],
        renderer: new ThreeJs.WebGLRenderer(),
        useControls: false,
      },
      {
        camera: new ThreeJs.OrthographicCamera( orthoSize * aspect4 / -2, orthoSize * aspect4 / 2, orthoSize / 2, orthoSize / -2, 1, 1000),
        cameraType: CameraType.ORTHOGRAPHIC,
        cameraPosition: CameraPosition.SIDE,
        canvas: canvasElements[3],
        renderer: new ThreeJs.WebGLRenderer(),
        useControls: false,
      },
    ]

    const shipRenderer = new ShipRenderer(
      viewports
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

    window.addEventListener("resize", (evt) => {
      shipRenderer.setSize()
    })
  })
</script>

<main id="app_container">
  <div class="camera_container"></div>
  <div class="camera_container"></div>
  <div class="camera_container"></div>
  <div class="camera_container"></div>
</main>

<style>
</style>
