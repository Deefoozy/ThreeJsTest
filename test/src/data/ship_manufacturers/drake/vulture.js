import {Vector3} from "three";

export default {
  shipName: "Vulture",
  hangarSize: "Small",
  cargoSize: 12,
  grids: [
    {
      name: "Main grid",
      position: new Vector3(0, 0, 2),
      centerX: true,
      sizeX: 2,
      sizeY: 2,
      sizeZ: 3,
    },
  ],
};