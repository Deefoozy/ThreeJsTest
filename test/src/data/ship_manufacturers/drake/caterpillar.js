import {Vector3} from "three";

export default {
  shipName: "Caterpillar",
  hangarSize: "Large",
  cargoSize: 576,
  gridInfo: [
    {
      groupName: "1st section",
      position: new Vector3(0, 0 , 0),
      grids: [
        {
          name: "Main grid",
          offset: new Vector3(1, 0, 1),
          centerX: true,
          sizeX: 6,
          sizeY: 4,
          sizeZ: 4,
        },
        {
          name: "Port grid",
          offset: new Vector3(0, 0, 1),
          centerX: true,
          sizeX: 1,
          sizeY: 2,
          sizeZ: 4,
        },
        {
          name: "Back grid",
          offset: new Vector3(2, 0, 0),
          centerX: true,
          sizeX: 5,
          sizeY: 4,
          sizeZ: 1,
        }
      ]
    },

    {
      groupName: "2nd section",
      position: new Vector3(0, 0 , 6),
      grids: [
        {
          name: "Main grid",
          offset: new Vector3(1, 0, 1),
          centerX: true,
          sizeX: 6,
          sizeY: 4,
          sizeZ: 4,
        },
        {
          name: "Port grid",
          offset: new Vector3(0, 0, 1),
          centerX: true,
          sizeX: 1,
          sizeY: 2,
          sizeZ: 4,
        },
        {
          name: "Back grid",
          offset: new Vector3(2, 0, 0),
          centerX: true,
          sizeX: 5,
          sizeY: 4,
          sizeZ: 1,
        }
      ]
    },

    {
      groupName: "3rd section",
      position: new Vector3(0, 0 , 12),
      grids: [
        {
          name: "Main grid",
          offset: new Vector3(1, 0, 1),
          centerX: true,
          sizeX: 6,
          sizeY: 4,
          sizeZ: 4,
        },
        {
          name: "Port grid",
          offset: new Vector3(0, 0, 1),
          centerX: true,
          sizeX: 1,
          sizeY: 2,
          sizeZ: 4,
        },
        {
          name: "Back grid",
          offset: new Vector3(2, 0, 0),
          centerX: true,
          sizeX: 5,
          sizeY: 4,
          sizeZ: 1,
        }
      ]
    },

    {
      groupName: "4th section",
      position: new Vector3(0, 0 , 18),
      grids: [
        {
          name: "Main grid",
          offset: new Vector3(1, 0, 1),
          centerX: true,
          sizeX: 6,
          sizeY: 4,
          sizeZ: 4,
        },
        {
          name: "Port grid",
          offset: new Vector3(0, 0, 1),
          centerX: true,
          sizeX: 1,
          sizeY: 2,
          sizeZ: 4,
        },
        {
          name: "Back grid",
          offset: new Vector3(2, 0, 0),
          centerX: true,
          sizeX: 5,
          sizeY: 4,
          sizeZ: 1,
        }
      ]
    },

    {
      groupName: "Nose section",
      position: new Vector3(0, 0 , 24),
      grids: [
        {
          name: "nose bottom grid",
          offset: new Vector3(0, 0, 0),
          centerX: true,
          sizeX: 5,
          sizeY: 2,
          sizeZ: 6,
        },
        {
          name: "nose top grid",
          offset: new Vector3(0, 2, 2),
          centerX: true,
          sizeX: 5,
          sizeY: 1,
          sizeZ: 4,
        },
      ]
    },
  ],
};