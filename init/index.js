const fs = require('fs');
const Path = require('path');

class Context {

    *prompts() {
        yield { name: 'projectName', type: 'input', message: "Project name" }
        yield { name: 'template', type: 'list', message: 'Select a template [--template]', validate: (v) => typeof v === "string" || "Template name is required", choices: this.context.getDirectories(this.context.commandFolder, 2) };
        yield { name: 'outputFolder', type: 'input', message: "Generated output folder (without project name) [--outputFolder]", default: this.context.currentFolder }
    }

    exec() {
        const outputFolder = Path.join(this.state.outputFolder, this.state.name);
        this.context.shell.mkdir("-p", outputFolder);

        const sourceFolder = Path.join(this.context.commandFolder, this.state.template);
        this.context.shell.cp("-R", sourceFolder, outputFolder);   

        let manifestPath = Path.join(outputFolder, "template.json");
        const manifest = this.readManifest(manifestPath);
        try {
            this.transform(outputFolder, manifest);
        }
        catch (e) {
            console.log(this.context.chalk.yellow("Warning: Error when updating source files - ") + e);
        }
        templateEngine.execScriptsAsync(manifest);
    }

    readManifest(manifestPath) {
        if (fs.existsSync(manifestPath)) {
            try {
                return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
            }
            catch (e) {
                console.log(this.context.chalk.red("Error when reading template manifest"));
                throw e;
            }
        }
    }

    transform(outputFolder, manifest) {
        // find manifest
        if (manifest && manifest.transform && manifest.transform.replace) {
            manifest.transform.replace.forEach(rule => {
                this.replace(outputFolder, rule.filter, rule.context);
            });
        }
        if (manifest && manifest.transform && manifest.transform.rename) {
            manifest.transform.rename.forEach(item => {
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

    execScriptsAsync(manifest) {
        if (manifest && manifest.scripts) {
            let platform = os.platform() === "win32" ? "win32" : "*nix";
            let commands = manifest.scripts[platform] || manifest.scripts;
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

exports = Context;