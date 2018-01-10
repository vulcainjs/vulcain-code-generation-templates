const fs = require('fs');
const ejs = require('ejs');
const Path = require('path');
const unirest = require('unirest');
const shell = require('shelljs');
const glob = require('glob');

// Command to test
let commandName = "init";

// Specific state
// let state = {
//     outputFolder: Path.join(shell.pwd().toString(), "generated"),
//     address: 'http://localhost:8080',
//     template: "adminOnRest"
// };
let state = {
    outputFolder: Path.join(shell.pwd().toString(), "generated"),
    template: "vulcainService",
    project: "test"
}

class ContextBase {
    constructor(base) {
        this.baseFolder = base;
    }
    get ejs() {
        return ejs;
    }

    get glob() {
        return glob;
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
        let Context = require("./" + Path.join(this.baseFolder, folder, 'index'));                
        let ctx = new Context.default();
        ctx.state = Object.assign({}, state);        
        ctx.context = this;
        // Force prompts call
        ctx.prompts && Array.from(ctx.prompts(ctx.state));
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
