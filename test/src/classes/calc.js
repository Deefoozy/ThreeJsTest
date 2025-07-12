export class Calc {
  /**
   * @param {number} min
   * @param {number} max
   */
  static getDelta(min, max) {
    return max - min;
  }

  /**
   * @param {number} min
   * @param {number} max
   * @return number
   */
  static getMidpoint(min, max) {
    return (Calc.getDelta(min, max) / 2) + min
  }
}