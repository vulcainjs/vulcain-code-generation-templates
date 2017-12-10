class Context {

    prompts() {
        return [];
    }

    init(options) {
        this.options = options;
        let self = this;
        return new Promise((resolve, reject) => {
            resolve("Dockerfile");
        });
    }
}
exports.Context = Context;
