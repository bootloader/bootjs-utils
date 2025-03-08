const os = require("os");

module.exports = {
  isMac() {
    return os.platform() === "darwin";
  },
  isWindows() {
    return os.platform() === "win32";
  },
};
