import {Vector3} from "three";

export default {
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