const fs = require('fs');
const path = require('path');
const os = require('os');

class Context {

    *prompts() {
        yield { name: 'template', type: 'list', message: 'Select a template [--template]', choices: this.context.getTemplates(this.context.commandFolder) };
        yield { name: 'project', type: 'input', message: "Project name", validate: (s) => !!s };
        yield { name: 'outputFolder', type: 'input', message: "Generated output folder (without project name) [--outputFolder]", default: this.context.currentFolder };

        this.outputFolder = path.join(this.state.outputFolder, this.state.project);
        this.sourceFolder = path.join(this.context.commandFolder, this.state.template);
        let manifestPath = path.join(this.sourceFolder, this.context.entryPoint);
        this.manifest = this.getManifest(manifestPath);
        let prompts = this.manifest && this.manifest.prompts && this.manifest.prompts(this.state);
        if (prompts) {
            for (let p of prompts) {
                yield p;
            }
        }
    }

    exec() {
        this.context.shell.mkdir("-p", this.outputFolder);

        this.context.shell.cp("-R", this.sourceFolder + "/template/.*", this.sourceFolder + "/template/*", this.outputFolder);   

        try {
            this.transform(this.outputFolder );
        }
        catch (e) {
            console.log(this.context.chalk.yellow("Warning: Error when updating source files - ") + e);
        }

        this.execScriptsAsync();
        
        console.log(this.context.chalk.green("Project initialized in "+ this.outputFolder));
        
        return Promise.resolve();
    }

    getManifest(manifestPath) {
        if (fs.existsSync(manifestPath)) {
            try {
                let m = require(manifestPath);
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
            for(let rule of this.manifest.replace()) {
                this.replace(outputFolder, rule.filter);
            }
        }
        if (this.manifest && this.manifest.rename) {
            for(let item of this.manifest.rename()) {
                this.rename(outputFolder, item.filter, new RegExp(item.pattern, "gi"), item.target);
            }
        }
    }

    execScriptsAsync() {
        if (this.manifest && this.manifest.scripts) {
            let platform = os.platform() === "win32" ? "win32" : "*nix";
            let scripts = this.manifest.scripts();
            let commands = scripts[platform] || scripts.all;
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

    replace(outputFolder, filter) {
        let files = this.context.glob.sync(filter, { cwd: outputFolder });
        for (let n in files) {
            let file = path.join(outputFolder, files[n]);
            let txt = fs.readFileSync(file, "utf8");

            let ctx = {
                fileName: file,
                state: this.state
            };

            let txt2 = this.context.ejs.render(txt, ctx);
            fs.writeFileSync(file, txt2);
        }
    }
}

exports.default = Context;