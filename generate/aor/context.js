const Path = require('path');

class Context {

    *prompts() {
        yield { name: 'template2', type: 'input', message: 'Select template [--template]', choices: this.context.getDirectories(this.context.commandFolder) };
    }

    exec() {
        const cmd = Path.join(this.state.template, this.state.template2);
        delete this.state.template2;
        return cmd;
    }
}

exports.Context = Context;
