/**
 * @typedef JsonMaterialInterpolationParameters
 * @type {object}
 * @property {?number} size // default should be interpreted as 2
 * @property {?number} offsetX // default should be interpreted as 0
 * @property {?number} offsetY // default should be interpreted as 0
 * @property {?number} offsetZ // default should be interpreted as 0
 */

/**
 * @description An object that contains the json definition of a grid
 * @typedef JsonGrid
 * @type {object}
 * @property {?string} name
 * @property {?number} offsetX // default should be interpreted as 0
 * @property {?number} offsetY // default should be interpreted as 0
 * @property {?number} offsetZ // default should be interpreted as 0
 * @property {boolean} centerX // potentially make this nullable
 * @property {number} sizeX
 * @property {number} sizeY
 * @property {number} sizeZ
 */

/**
 * @description An object that contains the json definition of a grid group
 * @typedef JsonGridGroup
 * @type {object}
 * @property {?string} name
 * @property {?number} positionX // default should be interpreted as 0
 * @property {?number} positionY // default should be interpreted as 0
 * @property {?number} positionZ // default should be interpreted as 0
 * @property {JsonGrid[]} grids
 * @property {JsonMaterialInterpolationParameters} boxParams
 */

/**
 * @description An object containing the json definition of the ship info
 * @typedef JsonShipInfo
 * @type {object}
 * @property {string} shipName
 * @property {string} hangarSize
 * @property {number} cargoSize
 * @property {JsonGridGroup[]} gridInfo
 * @property {?boolean} canLand // default should be interpreted as true
 */
