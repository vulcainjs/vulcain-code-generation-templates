// Manifest class specific to current generator
class Manifest {
  *prompts(state) {
    yield { name: 'service', type: 'input', message: "Service name", default: state.project }
    yield { name: 'domain', type: "input", message: "Domain name", validate: (s) => !!s}
  }

  // Process string replace in the following files
  // Replace uses current state
  *replace() {
      yield { "filter": "package.json" },
      yield { "filter": "Dockerfile" },
      yield { "filter": ".vscode/launch.json" },
      yield { "filter": "src/index.ts" }
  }
  
  // Provides a list of files to be renamed 
  //*rename() { }

  // Script to execute
  // fields can be :
  //   - win32 
  //   - *nix
  //   - all (fallback for non defined os)
  scripts() {
    return { all: ["npm install"] };
  }
}
exports.default = Manifest;