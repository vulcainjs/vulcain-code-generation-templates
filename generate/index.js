const fs = require('fs');
const Path = require('path');

class Context {

    *prompts() {
        yield { name: 'template', type: 'list', message: 'Select a template [--template]', validate: (v) => typeof v === "string" || "Template name is required", choices: this.context.getDirectories(this.context.commandFolder, 2) };
        yield { name: 'outputFolder', type: 'input', message: "Generated output folder [--outputFolder]", default: this.context.currentFolder}
    }

    async exec() {
        let ctx = await this.context.createContextAsync(this.state.template, this.state);
        let fn = await ctx.exec();
        if (fn) {
            let list;
            if (typeof fn === "string") {
                list = [{ outputFile: fn }];
            }
            else {
                list = fn();
            }

            for (let info of list) {
                await this.generate(info.outputFile, info.ctx || ctx, info.template || "template.ejs");
            }
        }
    }
    
    async generate(outputFile, ctx, templateName) {
        const ofn = Path.join(this.state.outputFolder, outputFile);
        process.stdout.write("Generating file " + ofn + "...");
        return new Promise((resolve, reject) => {
            try {
                let template = fs.readFileSync(Path.join(this.context.commandFolder, this.state.template, templateName), "utf8");
                let txt = this.context.ejs.render(template, ctx);
                
                const outputFolder = Path.dirname(ofn);
                this.context.shell.mkdir("-p", outputFolder);

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

exports.Context = Context;
