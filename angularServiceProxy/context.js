const path = require('path');
const rest = require('unirest');

class Context {

    prompts() {
      return [ { name: 'discoveryAddress', type: 'list', message: 'Select service', lookup: 'service.all'}];
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

                        resolve(path.join("src", "generatedCode", self.camelCase(self.normalizeService(self.serviceName + self.serviceVersion)) + ".ts"));
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
            if( method.action === "all")
                params.push({type:"any", name:"query", description: "Query filter"});
            return params;
        }
        let schema = this.schemas.find(s => s.name === schemaName);
        if (!schema) { // get
            return [];
        }
        return schema.properties;
    }

    normalizeMethod(name) {
        let parts = name.split('.');
        if (parts.length === 1)
            return this.camelCase(parts[0]);
        return this.camelCase(parts[1]) + this.pascalCase(parts[0]);
    }

    arguments(method) {
        let schemaName = method.inputSchema;
        if (!schemaName) {
            if (method.action === "all")
                return { params: ["query?: any"], args: "query" };
            return { params: [], args: "null" };
        }
        let schema = this.schemas.find(s => s.name === schemaName);
        if (!schema) { // get
            return { params: ["id: string"], args: "id" };
        }
        let params = [];
        let args = "{";
        for (let prop of schema.properties) {
            if (params.length > 0) {
                params.push(", ");
                args += ", ";
            }
            params.push(prop.name + this.required(prop) + ": " + prop.type);
            args += prop.name
        }
        args += "}";
        return { params, args };
    }
}

exports.Context = Context;
