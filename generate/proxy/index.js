const path = require('path');
const { URL } = require('url');

class Context {

    *prompts() {
        yield { name: 'address', type: 'input', message: 'Select service [--address]', default: "http://localhost:8080"};
    }

    exec() {
        let uri = new URL(this.state.address);
        if (!uri.pathname || uri.pathname === '/')
            this.state.address = new URL("/api/_servicedescription", this.state.address);
        
        let self = this;
        return new Promise((resolve, reject) => {

            try {
                let request = this.context.rest.get(this.state.address)
                    .header('Accept', 'application/json')
                    .type("json");

                this.sendRequest(request).then(function (response) {
                    if (response.ok) {
                        var info = response.body;
                        if (info.status === "Error") {
                            reject(info.error.message);
                            return;
                        }
                        self.state.schemas = info.value.schemas;
                        self.state.services = info.value.services;
                        self.state.serviceName = info.value.serviceName;
                        self.state.serviceVersion = info.value.serviceVersion;
                        self.state.domain = info.value.domain;

                        resolve(self.camelCase(self.normalizeService(self.state.serviceName + self.state.serviceVersion)) + ".ts");
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
            if (method.name === "all")
                params.push({ type: "any", name: "query", description: "Query filter" });
            return params;
        }
        let schema = this.state.schemas.find(s => s.name === schemaName);
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
        let schema = this.state.schemas.find(s => s.name === schemaName);
        let params = [];
        let args = "{";
        for (let prop of schema.properties.sort((a,b)=> (b.required?1:0) - (a.required?1:0))) {
            if (params.length > 0) {
                params.push(", ");
            }
 
            let propType = this.resolveType(prop.type);
            params.push(prop.name + this.required(prop) + ": " + propType);            
            if (args.length > 1) {
                args += ", ";
            }
            args += prop.name
        }
        args += "}";

        return { params, args };
    }

    resolveType(propType) {
        if( !this.state.schemas.find(s=>s.name===propType) && ["string", "number", "boolean"].indexOf(propType) < 0) {
            return propType === "id" ? "string|number" : "any";
        }
        return propType;
    }
}

exports.default = Context;
