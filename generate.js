const fs = require('fs');
const ejs = require('ejs');
const Path = require('path');
const unirest = require('unirest');
const shell = require('shelljs');

// Command to test
let commandName = 'generate';

// Initialize initial state
let uri = 'http://localhost:8080';
let state = {
    outputFolder: Path.join(shell.pwd().toString(), "generated"),
    address: uri,
    template: "adminOnRest"
};

class ContextBase {
    constructor(base) {
        this.baseFolder = base;
    }
    get ejs() {
        return ejs;
    }

    get shell() {
        return shell;
    }

    get rest() {
        return unirest;
    }

    get currentFolder() {
        return this.baseFolder;
    }

    get commandFolder() {
        return this.baseFolder;
    }

    createContextAsync(folder, state) {
        let Context = require("./"+ Path.join(this.baseFolder, folder, 'context')).Context;                
        let ctx = new Context();
        ctx.state = Object.assign({}, state);
        ctx.context = this;
        return ctx;
    }    
}

try {
    let base = new ContextBase(commandName);
    let ctx = base.createContextAsync("", state);

    ctx.exec()
        .then(() => {
            console.log("Execution completed.");
        })
        .catch(err => {
            console.log("Error : " + err);
        });
} catch (e) {
    console.log("Code generation error : " + e);
}
