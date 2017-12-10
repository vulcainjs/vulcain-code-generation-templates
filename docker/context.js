class Context {

    prompts() {
        return [];
    }

    init(options) {
        this.options = options;
        let self = this;
        return new Promise((resolve, reject) => {
            if (!options.name) {
                reject("You must provide a service name and version with --args name=xxx,version=1.0");
            } else if (!options.version) {
                reject("You must provide a service name and version with --args name=xxx,version=1.0");
            } else {
                resolve("Dockerfile");
            }    
        });
    }
}
exports.Context = Context;
