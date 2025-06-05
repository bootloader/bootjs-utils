const path = require("path");

module.exports = {
  getCallerScript(_err, stackIndex = 2) {
    let err = _err;
    if (!err) {
      err = new Error();
      stackIndex++;
    }
    //console.error(err);
    const stack = err.stack.split("\n");

    // The 3rd line in the stack trace usually contains the caller
    const callerLine = stack[stackIndex];

    const match = callerLine.match(/\((.*):\d+:\d+\)/);
    return match ? match[1] : "Unknown caller";
  },
  getCallerDir(_err) {
    return path.dirname(this.getCallerScript(_err, 3));
  },
};
