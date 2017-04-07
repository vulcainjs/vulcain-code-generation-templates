const path = require('path');
const rest = require('unirest');
const fs = require('fs');
const ejs = require('ejs');

class Context {

    prompts() {
        return [{ name: 'discoveryAddress', type: 'list', message: 'Select service', lookup: 'service.all' }];
    }

    init(options) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                let request = rest.get(options.discoveryAddress)
                    .header('Accept', 'application/json')
                    .type("json");

                this.sendRequest(request).then(function (response) {
                    if (response.ok) {
                        var info = response.body;
                        if (info.status === "Error") {
                            reject(info.error.message);
                            return;
                        }
                        self.schemas = info.value.schemas;
                        self.services = info.value.services;
                        self.serviceName = info.value.serviceName;
                        self.serviceVersion = info.value.serviceVersion;
                        self.domain = info.value.domain;

                        self.generateCrudTemplates();
                        resolve(self.camelCase(self.normalizeService(self.serviceName + self.serviceVersion)) + ".ts");
                    }
                    else {
                        reject("Invalid service address : " + response.error.message);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    sendRequest(request) {
        return new Promise((resolve) => {
            request.end(resolve);
        })
    }

    required(obj) {
        return !obj.required ? "?" : "";
    }

    camelCase(name) {
        return name[0].toLowerCase() + name.substr(1);
    }

    pascalCase(name) {
        return name[0].toUpperCase() + name.substr(1);
    }

    normalize(name) {
        return name && name.toLowerCase();
    }

    normalizeService(name) {
        let parts = name.split(/[\._-]/);
        let result = this.pascalCase(parts[0]);
        for (let i = 1; i < parts.length; i++) {
            result += this.pascalCase(parts[i]);
        }
        return (result + "Service").replace(/-/g, '');
    }

    getInputProperties(method) {
        let schemaName = method.inputSchema;
        if (!schemaName) {
            let params = [];
            if (method.action === "all")
                params.push({ type: "any", name: "query", description: "Query filter" });
            return params;
        }
        let schema = this.schemas.find(s => s.name === schemaName);
        if (!schema) { // get
            return [];
        }
        return schema.properties;
    }

    normalizeMethod(name, prefix) {
        let parts = name.split('.');
        parts[0] = prefix ? prefix + this.pascalCase(parts[0]) : this.camelCase(parts[0])
        if (parts.length === 1 || (parts[1].toLowerCase() === "all" || parts[1].toLowerCase() === "get"))
            return parts[0];

        parts[1] = this.pascalCase(parts[1]);
        return parts[0] + parts[1];
    }

    properties(method) {
        let schemaName = method.schema;
        let schema = this.schemas.find(s => s.name === schemaName);

        return ((schema && schema.properties) || []);
    }

    arguments(method) {
        let schemaName = method.inputSchema;
        if (!schemaName) {
            return { params: [], args: "null" };
        }
        let schema = this.schemas.find(s => s.name === schemaName);
        if (!schema) { // get
            return { params: ["id: string"], args: "null" };
        }

        let params = [];
        let args = "{";
        for (let prop of schema.properties) {
            if (params.length > 0) {
                params.push(", ");
            }
 
            params.push(prop.name + this.required(prop) + ": " + prop.type);
            if (prop.name === "id" && method.kind === "get")
                continue;
            
            if (args.length > 1) {
                args += ", ";
            }
            args += prop.name
        }
        args += "}";

        if (params.length > 0) {
            params.push(", ");
        }
        return { params, args };
    }

    generateCustomTemplate(service, templateSource, outputFile) {
        let template = fs.readFileSync(templateSource, 'utf8');
        let txt = ejs.render(template, { context: this, data: service });

        // ensure folder exists
        outputFile.split('/').slice(0, -1).reduce((prev, curr, i) => {
            let p = `${prev}/${curr}`;
            if (fs.existsSync(p) === false) {
                fs.mkdirSync(p);
            }

            return p;
        });
        console.log(`generating: ${outputFile}`);
        fs.writeFile(outputFile, txt, (err) => {
            if (err) {
                console.log("Code generation error : " + err);
                return;
            }
            console.log("Code generated sucessfully in " + outputFile);
        });

    }

    toPath(service) {
        switch(service.action) {
            case 'create':
                return `${this.normalize(service.schema)}/create`
            case 'update':
                return `${this.normalize(service.schema)}/:id`
            case 'delete':
                return `${this.normalize(service.schema)}/delete/:id`
            case 'all':
                return `${this.normalize(service.schema)}`
            default:
                throw new Error(service.action + ' is not crud');
        }
    }

    isCrud(s) {
        return (s.kind === 'action' && (s.action === 'create' || s.action === 'update' || s.action === 'delete' )) ||
               (s.kind === 'query' && s.action === 'all');
    }

    generateCrudTemplates() {
        const crudServices = this.services.filter(s => this.isCrud(s));
        for(let service of crudServices) {
            this.generateCustomTemplate(service, `./ng2CrudComponents/${service.action}/template.ts.ejs`, `./out/${this.normalize(service.schema)}/${this.normalize(service.schema)}-${service.action}.component.ts`);
            this.generateCustomTemplate(service, `./ng2CrudComponents/${service.action}/template.html.ejs`, `./out/${this.normalize(service.schema)}/${this.normalize(service.schema)}-${service.action}.component.html`);
            this.generateCustomTemplate(service, `./ng2CrudComponents/${service.action}/template.scss.ejs`, `./out/${this.normalize(service.schema)}/${this.normalize(service.schema)}-${service.action}.component.scss`);
        }

        // generate route module
        this.generateCustomTemplate(crudServices, `./ng2CrudComponents/route.template.ts.ejs`, `./out/crud.routes.ts`);
    }

}

exports.Context = Context;
