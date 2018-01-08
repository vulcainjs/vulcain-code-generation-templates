const fs = require('fs');

class Context {

    *prompts() {
        yield { name: 'template', type: 'list', message: 'Select a template', choices: this.this.context.getDirectories(this.context.commandFolder) };
        yield { name: 'outputFolder', type: 'input', default: '.'}
    }

    async exec() {
        let ctx = this.context.createContext(this.state.template, this.state);
        let fn = await ctx.exec();
        if (fn) {
            let list;
            if (typeof list === "string") {
                list = [{ outputFile: list }];
            }
            else {
                list = fn();
            }

            for (let info of list) {
                if (this.command.name.toLowerCase() === "generate") {
                    await this.generate(info.outputFile, info.ctx || state, info.template || "template.ejs");
                }
            }
        }
    }
    
    async generate(outputFile, ctx, templateName) {
        const ofn = Path.join(this.outputFolder, outputFile);
        console.log("Generating file " + ofn + "...");
        return new Promise((resolve, reject) => {
            try {
                let template = fs.readFileSync(templateName, "utf8");
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

exports.Context = Context;
