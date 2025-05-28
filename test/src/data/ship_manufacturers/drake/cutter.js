import {Vector3} from "three";

export default {
  shipName: "Cutter",
  hangarSize: "Small",
  cargoSize: 4,
  grids: [
    {
      name: "Front grid",
      position: new Vector3(0, 0, 2),
      centerX: true,
      sizeX: 1,
      sizeY: 2,
      sizeZ: 1,
    },
    {
      name: "Back grid",
      position: new Vector3(0, 0, 0),
      centerX: true,
      sizeX: 1,
      sizeY: 2,
      sizeZ: 1,
    }
  ],
};