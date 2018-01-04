const path = require('path');
const rest = require('unirest');

class Context {

    prompts() {
        return [{ name: 'address', type: 'list', message: 'Select service', lookup: 'service.all' }];
    }

    init(options) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (!options.address) {
                reject("You must provide a service address with --args address=xxx");
                return;
            }
            try {
                let request = rest.get(options.address)
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

    createSpecificCommandName(serviceName, verb, verbPrefix) {
        const prefix = this.normalizeService(serviceName);

        let suffix = '';
        let parts = verb.split('.');
        parts[0] = verbPrefix ? verbPrefix + this.pascalCase(parts[0]) : this.camelCase(parts[0])
        if (parts.length === 1 || (parts[1].toLowerCase() === "all" || parts[1].toLowerCase() === "get"))
            suffix = parts[0];
        else 
            suffix = this.pascalCase(parts[1]);
        return prefix + suffix;
    }   
    
    // name = schema.action or action
    normalizeMethod(name, prefix) {
        let [schema, action] = name.split('.');
        
        schema = prefix ? prefix + this.pascalCase(schema) : this.camelCase(schema);

        if (!action || (action.toLowerCase() === "all" || action.toLowerCase() === "get"))
            return schema;

        return this.camelCase(action) + this.pascalCase(schema);
    }
    
    normalizeService(name) {
        let parts = name.split(/[\._-]/);
        let result = this.pascalCase(parts[0]);
        for (let i = 1; i < parts.length; i++) {
            result += this.pascalCase(parts[i]);
        }
        return result.replace(/-/g, '');
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
}

exports.Context = Context;