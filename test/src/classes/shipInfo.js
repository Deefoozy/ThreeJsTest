import "../types/grids.js"
import "../types/jsonGrids.js"

import {Vector3} from "three";


/**
 * @typedef GridIterationIndexes
 * @type {object}
 * @property {number} gridIndex
 * @property {number} groupIndex
 */

/**
 * @callback GridIterationCallback
 * @param {Grid} grid
 * @param {GridGroup} group
 * @param {GridIterationIndexes} indexes
 */

/**
 * @description A class containing some metadata and grid information on a ship.
 * @property {string} shipName
 * @property {string} hangarSize
 * @property {number} cargoSize
 * @property {GridGroup[]} gridInfo
 * @property {boolean} canLand
 */
export default class ShipInfo {
  /**
   * @description The constructor takes the json description of a ship and parses into this current class
   * @param {!JsonShipInfo} parsedJson
   */
  constructor(parsedJson) {
    // Input json should be close to identical. what must happen is parsing the posX, Y and Z into a Vectors.
    this.shipName = parsedJson.shipName;
    this.hangarSize = parsedJson.hangarSize;
    this.cargoSize = parsedJson.cargoSize;
    this.canLand = parsedJson.canLand == null ? true : parsedJson.canLand;
    this.gridInfo = ShipInfo.parseJsonGridGroups(parsedJson.gridInfo)
  }

  /**
   * @param {GridIterationCallback} callback
   */
  iterateOverAllGrids(callback) {
    const indexObj = {groupIndex: 0, gridIndex: 0};

    for (let groupLength = this.gridInfo.length; indexObj.groupIndex < groupLength; ++ indexObj.groupIndex) {
      const currentGridGroup = this.gridInfo[indexObj.groupIndex];

      indexObj.gridIndex = 0;

      for (let gridLength = currentGridGroup.grids.length; indexObj.gridIndex < gridLength; ++indexObj.gridIndex) {
        callback(currentGridGroup.grids[indexObj.gridIndex], currentGridGroup, indexObj)
      }
    }
  }

  /**
   * @description Static method that loops over the input JsonGridGroups and collecting the output of running parseJsonGridGroup with the input data
   * @param {JsonGridGroup[]} jsonGridGroups
   * @returns {GridGroup[]}
   */
  static parseJsonGridGroups(jsonGridGroups) {
    /** @type {GridGroup[]} */
    const tempGridGroups = [];

    for (let i = 0, l = jsonGridGroups.length; i < l; ++i) {
      tempGridGroups.push(ShipInfo.parseJsonGridGroup(jsonGridGroups[i]));
    }

    return tempGridGroups;
  }

  /**
   * @description Static method that assigns a Vector3 to position and parses the subgrids to contain Vector3s for offsets to transform a JsonGridGroup into a GridGroup
   * @param {JsonGridGroup} jsonGridGroup
   * @returns {GridGroup}
   */
  static parseJsonGridGroup(jsonGridGroup) {
    // The reason for this spread usage is to keep the parsing extensible without too much extra work
    const {
      positionX,
      positionY,
      positionZ,
      grids,
      ...gridGroup
    } = jsonGridGroup;

    /** @type {Grid[]} */
    const tempGrids = [];

    for (let i = 0, l = grids.length; i < l; ++i) {
      tempGrids.push(ShipInfo.parseJsonGrid(grids[i]));
    }

    return {
      position: new Vector3(positionX ?? 0, positionY ?? 0, positionZ ?? 0),
      grids: tempGrids,
      ...gridGroup
    };
  }

  /**
   * @description Static method that assigns a Vector3 to offset in order to transform a JsonGrid into a Grid
   * @param {JsonGrid} jsonGrid
   * @returns {Grid}
   */
  static parseJsonGrid(jsonGrid) {
    const {
      offsetX,
      offsetY,
      offsetZ,
      ...grid
    } = jsonGrid;

    return {
      offset: new Vector3(offsetX ?? 0, offsetY ?? 0, offsetZ ?? 0),
      ...grid
    };
  }
}