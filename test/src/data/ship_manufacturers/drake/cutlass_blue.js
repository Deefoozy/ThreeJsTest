import {Vector3} from "three";

export default {
  shipName: "Cutlass Blue",
  hangarSize: "Medium",
  cargoSize: 12,
  grids: [
    {
      name: "Starboard grid",
      position: new Vector3(4, 0, 0),
      centerX: true,
      sizeX: 1,
      sizeY: 2,
      sizeZ: 3,
    },
    {
      name: "Port grid",
      position: new Vector3(0, 0, 0),
      centerX: true,
      sizeX: 1,
      sizeY: 2,
      sizeZ: 3,
    }
  ],
};