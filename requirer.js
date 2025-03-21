const path = require('path');
const fs = require('fs');
const stringy = require('./stringy');

function requireGlobal(pkgName) {
  try {
    // 1️⃣ Try requiring locally (in node_modules)
    try {
      return require(pkgName);
    } catch (localErr) {}

    // 2️⃣ Try resolving at project level
    try {
      const resolvedPath = require.resolve(pkgName, { paths: [process.cwd()] });
      return require(resolvedPath);
    } catch (projectErr) {}

    // 3️⃣ Try loading from global npm root
    const globalPaths = [
      require('child_process').execSync('npm root -g').toString().trim(),
      process.env.NODE_PATH, // Additional fallback
    ].filter(Boolean);

    for (const globalPath of globalPaths) {
      const modulePath = path.join(globalPath, pkgName);
      if (fs.existsSync(modulePath) || fs.existsSync(modulePath + '.js')) {
        return require(modulePath);
      }
    }

    // Final fallback using require.resolve in global paths
    const resolvedGlobalPath = require.resolve(pkgName, { paths: globalPaths });
    return require(resolvedGlobalPath);
  } catch (err) {
    console.warn(`⚠️ Package "${pkgName}" is not installed locally, in the project, or globally. Please install it.`);
    return null;
  }
}

function requireOptional(packageNames, defaultModule = {}) {
  let e;
  for (let packageName of packageNames.split('|')) {
    try {
      const resolvedPath = require.resolve(packageName, { paths: [require.main.path] });
      return require(resolvedPath);
    } catch (error) {
      e = error;
      // NoPrint
    }
  }
  console.warn(`⚠️ Optional module [${packageNames}] not found, continuing without it.`);
  console.error(stringy.indent(e.message, 4));
  return defaultModule;
}

module.exports = {
  requireGlobal,
  requireOptional,
};
