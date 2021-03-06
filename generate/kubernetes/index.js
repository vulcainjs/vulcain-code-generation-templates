class Context {

    *prompts() {
        yield { name: 'service', type: 'input', message: 'Service name [--service]', validate: (s) => !!s };
        yield { name: 'version', type: 'input', message: 'Service version [--version]', default: "1.0"};
    }

    exec() {
        this.state.fullServiceName =  (this.state.service + this.state.version).replace(/[\.-]/g, '').toLowerCase();

        if (!this.state.image) {
            this.state.image = this.state.fullServiceName;
        }
        return "service.yaml";
    }
}
exports.default = Context;
