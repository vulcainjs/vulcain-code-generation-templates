class Context {
    *prompts() {
        yield { name: 'service', type: 'input', message: 'Service name [--service]', validate: (s) => !!s };
        yield { name: 'version', type: 'input', message: 'Service version [--version]', default: "1.0"};
    }
    exec() {
        return 'Dockerfile';
    }
}
exports.default = Context;
