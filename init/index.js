const fs = require('fs');
const path = require('path');

class Context {

    *prompts() {
        yield { name: 'project', type: 'input', message: "Project name" }
        yield { name: 'template', type: 'list', message: 'Select a template [--template]', validate: (v) => typeof v === "string" || "Template name is required", choices: this.context.getDirectories(this.context.commandFolder, 2) };
        yield { name: 'outputFolder', type: 'input', message: "Generated output folder (without project name) [--outputFolder]", default: this.context.currentFolder };

        this.sourceFolder = path.join(this.context.commandFolder, this.state.template);
        let manifestPath = path.join(outputFolder, "template.json");
        this.manifest = this.getManifest(manifestPath);
        let prompts = this.manifest && this.manifest.prompts && this.manifest.prompts(this.state);
        if (prompts) {
            for (let p of prompts) {
                yield p;
            }
        }
    }

    exec() {
        const outputFolder = path.join(this.state.outputFolder, this.state.project);
        this.context.shell.mkdir("-p", outputFolder);

        this.context.shell.cp("-R", this.sourceFolder + path.sep + "*", outputFolder);   

        try {
            this.transform(outputFolder );
        }
        catch (e) {
            console.log(this.context.chalk.yellow("Warning: Error when updating source files - ") + e);
        }
        templateEngine.execScriptsAsync();
        return Promise.resolve();
    }

    getManifest(manifestPath) {
        if (fs.existsSync(manifestPath)) {
            try {
                let m = require(Path.join(this._executionContext.commandFolder, folder, '$template.js'));
                return new m.default();
            }
            catch (e) {
                console.log(this.context.chalk.red("Error when reading template manifest"));
                throw e;
            }
        }
    }

    transform(outputFolder) {
        // find manifest
        if (this.manifest && this.manifest.replace) {
            this.manifest.replace.forEach(rule => {
                this.replace(outputFolder, rule.filter, rule.context);
            });
        }
        if (this.manifest && this.manifest.rename) {
            this.manifest.rename.forEach(item => {
                this.rename(outputFolder, item.filter, new RegExp(item.pattern, "gi"), item.target);
            });
        }
    }

    // displayMessage(step: string) {
    //     let manifest = this.readManifest();
    //     if (manifest && manifest.messages) {
    //         let messages: Array<string> = manifest.messages[step];
    //         if (messages) {
    //             console.log("");
    //             messages.forEach((msg: string) => console.log("INFO : " + msg));
    //             console.log("");
    //         }
    //     }
    // }

    execScriptsAsync() {
        if (this.manifest && this.manifest.scripts) {
            let platform = os.platform() === "win32" ? "win32" : "*nix";
            let commands = this.manifest.scripts[platform] || this.manifest.scripts.all;
            if (commands) {
                for (let cmd of commands) {
                    if (typeof cmd === "string") {
                        console.log(this.context.chalk.green("Running command: " + cmd));
                        this.context.shell.exec(cmd);
                    }
                }
            }
        }
    }

    resolveProperty(name) {
        name = name.substr(1, name.length - 2); // remove {..}

        let parts = name.split(".");
        let root = this.context.meta;
        parts.forEach(p => {
            if (root) {
                root = root[p];
            }
        });
        return root;
    }

    rename(outputFolder, filter, pattern, target) {
        // Prepare target
        let rg = /{([^}]*)}/g;
        let properties = target.match(rg);
        // Replace substitution variables with theirs values 
        properties.forEach(p => {
            target = target.replace(p, this.resolveProperty(p));
        });

        // Find file to rename
        let files = this.context.glob.sync(filter, { cwd: outputFolder });
        for (let n in files) {
            let file = path.join(outputFolder, files[n]);
            let fileName = path.basename(file);

            fileName = fileName.replace(pattern, target);
            fs.rename(file, path.join(outputFolder, fileName), ()=> {});
        }
    }

    replace(outputFolder, filter, state) {
        let files = this.context.glob.sync(filter, { cwd: outputFolder });
        for (let n in files) {
            let file = path.join(outputFolder, files[n]);
            let txt = fs.readFileSync(file, "utf8");

            let ctx = {
                fileName: file,
                state
            };

            let txt2 = this.context.ejs.render(txt, state);
            fs.writeFileSync(file, txt2);
        }
    }
}

exports.default = Context;