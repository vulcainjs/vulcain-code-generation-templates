class Context {

    prompts() {
        return [];
    }

    init(options) {
        this.options = options;
        options.fullName =  (options.serviceName + options.serviceVersion).replace(/[\.-]/g, '').toLowerCase();

        if (!options.image) {
            options.image = options.fullName;
        }
        let self = this;
        return new Promise((resolve, reject) => {
            resolve("Dockerfile");
        });
    }
}
exports.Context = Context;
