export class Utilities {
  public static CreateGuid() {
    function helper(s: boolean = false) {
      var p = (Math.random().toString(16) + "000000000").substring(2, 6);
      return s ? "-" + p.substring(0, 4) + "-" + p.substring(4, 0) : p;
    }
    return helper() + helper(true) + helper(true) + helper();
  }
}
