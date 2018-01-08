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
            if (!options.name) {
                reject("You must provide a service name and version with --args name=xxx,version=1.0");
            } else if (!options.version) {
                reject("You must provide a service name and version with --args name=xxx,version=1.0");
            } else {
                resolve("service.yaml");
            }
        });
    }
}
exports.Context = Context;
