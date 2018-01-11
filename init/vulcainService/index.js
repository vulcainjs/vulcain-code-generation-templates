class Manifest {
  *prompts(state) {
    yield { name: 'service', type: 'input', message: "Service name", default: state.project }
    yield { name: 'domain', type: "input", message: "Domain name", validate: (s) => !!s}
  }

  *replace() {
      yield { "filter": "package.json" },
      yield { "filter": "Dockerfile" },
      yield { "filter": ".vscode/launch.json" },
      yield { "filter": "src/index.ts" }
  }
  
  *rename() { }

  scripts() {
    return { all: ["npm install"] };
  }
}
exports.default = Manifest;