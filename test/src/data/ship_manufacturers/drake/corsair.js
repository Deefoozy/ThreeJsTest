import {Vector3} from "three";

export default {
  shipName: "Corsair",
  hangarSize: "Medium",
  cargoSize: 72,
  grids: [
    {
      name: "Main grid",
      position: new Vector3(0, 0, 2),
      centerX: true,
      sizeX: 4,
      sizeY: 3,
      sizeZ: 6,
    },
  ],
};