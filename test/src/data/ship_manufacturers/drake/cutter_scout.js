import {Vector3} from "three";

export default {
  shipName: "Cutter Scout",
  hangarSize: "Small",
  cargoSize: 2,
  grids: [
    {
      name: "Main grid",
      position: new Vector3(0, 0, 2),
      centerX: true,
      sizeX: 1,
      sizeY: 2,
      sizeZ: 3,
    },
  ],
};