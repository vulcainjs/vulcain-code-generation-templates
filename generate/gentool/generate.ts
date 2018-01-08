const inquirer =require('inquirer');
import * as Path from 'path';
const fs = require('fs');
const ejs = require('ejs');

// Modify this for testing
let uri = 'http://localhost:8080';             // Service address
let template = "adminonrest";// "microServiceProxy"; // Template name

// Generate code from template
let templateFolder = '../' + template;

class Generator {
    private state = {};
    private ctx;

    constructor(private templateFolder: string, private outputFolder:string=".") {
        if (!templateFolder)
            throw new Error("template folder is required.");   
        if (templateFolder[0] === Path.sep)
            this.templateFolder = templateFolder.substr(1);    
    }

    public async execute(state?: any) {
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

        await Promise.all([this.getPrompts()]);

        let fn = await this.ctx.init();
        let list;
        if (typeof list === "string") {
            list = [{ outputFile: list }];
        }
        else {
            list = fn();
        }
        for (let info of list) {
            await this.generate(info.outputFile, info.ctx || state, info.template || "template.ejs");
        }

        if (this.ctx.dispose) {
            this.ctx.dispose();
        }
    } 

    private async getPrompts() {
        for (let prompt of this.ctx.prompts(this.state)) {
            if (prompt.then) {
                prompt = await prompt;
            }

            if (!this.state[prompt.name]) {
                let res = await inquirer.prompt([prompt]);
                console.log(res);
                this.state[prompt.name] = res[prompt.name];
            }  
        }
    }

    private async generate(outputFile, ctx, templateName) {
        const ofn = Path.join(this.outputFolder, outputFile);
        console.log("Generating file " + ofn + "...");
        return new Promise((resolve, reject) => {
            try {
                let template = fs.readFileSync(Path.join(this.templateFolder, templateName), "utf8");
                let txt = ejs.render(template, this.ctx);
                
                // TODO create folder
                const outputFolder = Path.basename(ofn);

                fs.writeFile( ofn, txt, (err) => {
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
    }
}
// Find template = all folders with a context.js 

let g = new Generator(".");
g.execute({first_name: "aaa"}).catch(e => console.log(e));