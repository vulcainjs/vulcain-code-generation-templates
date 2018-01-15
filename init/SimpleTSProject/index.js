class Manifest {
  *replace() {
    yield { "filter": "package.json" }
  }
  
  scripts() {
    return { all: ["npm install"] };
  }
}
exports.default = Manifest;