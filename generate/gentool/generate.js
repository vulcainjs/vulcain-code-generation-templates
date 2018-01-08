"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require('inquirer');
const Path = require("path");
const fs = require('fs');
const ejs = require('ejs');
// Modify this for testing
let uri = 'http://localhost:8080'; // Service address
let template = "adminonrest"; // "microServiceProxy"; // Template name
// Generate code from template
let templateFolder = '../' + template;
class Generator {
    constructor(templateFolder, outputFolder = ".") {
        this.templateFolder = templateFolder;
        this.outputFolder = outputFolder;
        this.state = {};
        if (!templateFolder)
            throw new Error("template folder is required.");
        if (templateFolder[0] === Path.sep)
            this.templateFolder = templateFolder.substr(1);
    }
    execute(state) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Loading context " + Path.join(this.templateFolder, 'context'));
            let Context = require("./" + Path.join(this.templateFolder, 'context')).Context;
            this.ctx = new Context();
            if (!state) {
                this.state = {};
            }
            else {
                // Display state
                this.state = state;
            }
            yield Promise.all([this.getPrompts()]);
            let fn = yield this.ctx.init();
            let list;
            if (typeof list === "string") {
                list = [{ outputFile: list }];
            }
            else {
                list = fn();
            }
            for (let info of list) {
                yield this.generate(info.outputFile, info.ctx || state, info.template || "template.ejs");
            }
            if (this.ctx.dispose) {
                this.ctx.dispose();
            }
        });
    }
    getPrompts() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let prompt of this.ctx.prompts(this.state)) {
                if (prompt.then) {
                    prompt = yield prompt;
                }
                if (!this.state[prompt.name]) {
                    let res = yield inquirer.prompt([prompt]);
                    console.log(res);
                    this.state[prompt.name] = res[prompt.name];
                }
            }
        });
    }
    generate(outputFile, ctx, templateName) {
        return __awaiter(this, void 0, void 0, function* () {
            const ofn = Path.join(this.outputFolder, outputFile);
            console.log("Generating file " + ofn + "...");
            return new Promise((resolve, reject) => {
                try {
                    let template = fs.readFileSync(Path.join(this.templateFolder, templateName), "utf8");
                    let txt = ejs.render(template, this.ctx);
                    // TODO create folder
                    const outputFolder = Path.basename(ofn);
                    fs.writeFile(ofn, txt, (err) => {
                        if (err) {
                            console.log("Failed : " + err);
                            reject();
                        }
                        console.log("OK");
                        resolve();
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
}
// Find template = all folders with a context.js 
let g = new Generator(".");
g.execute({ first_name: "aaa" }).catch(e => console.log(e));
//# sourceMappingURL=generate.js.map