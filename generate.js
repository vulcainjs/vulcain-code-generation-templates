const fs = require('fs');
const ejs = require('ejs');
const Path = require('path');
const unirest = require('unirest');
const shell = require('shelljs');

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

// Modify this for testing
let uri = 'http://localhost:8080';             // Service address

// Generate code from template
let templateFolder = 'generate';
let template = "proxy";

let base = new ContextBase(templateFolder);

try {
    let state = { outputFolder: Path.join(shell.pwd().toString(), "generated"), address: uri + "/api/_servicedescription", template };
    let ctx = base.createContextAsync("", state);

    ctx.exec()
        .then((outputFile) => {
            let template = fs.readFileSync(templateFolder + "/template.ejs", "utf8");
            let txt = ejs.render(template, ctx);
            outputFile = 'generatedFile.ts';

            fs.writeFile(outputFile, txt, (err) => {
                if (err) {
                    console.log("Code generation error : " + err);
                    return;
                }
                console.log("Code generated successfully in " + outputFile);
            });
        })
        .catch(err => {
            console.log("Code generation error : " + err);
        });
} catch (e) {
    console.log("Code generation error : " + e);
}
