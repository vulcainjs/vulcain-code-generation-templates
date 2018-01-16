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
                        if (info.error && info.error.message) {
                            reject(info.error.message);
                            return;
                        }
                        
                        self.state.schemas = self.prepareSchemas(info.value.services, info.value.schemas);
                        resolve(self.camelCase(self.normalizeService(info.value.serviceName)) + ".js");
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

    getFieldComponent(prop) {
        if (prop.custom && prop.custom.ignore)
            return "";
        
        if (prop.custom && prop.custom.reference) {
            return `<aor.ReferenceField label="${prop.custom.reference}" source="${prop.name}" reference="${prop.custom.reference}">
                <aor.TextField source="${prop.custom.referenceField}" />
            </aor.ReferenceField>`;
        }
        if (prop.metadata.type === "enum") {
            return `<aor.ChipField source="${prop.name}" />`;            
        }
        if (prop.metadata.type === "date") {
            return `<aor.DateField source="${prop.name}" />`;            
        }
        if(prop.type === "boolean")
            return `<aor.BooleanField source="${prop.name}" />`;
        
        if(prop.type === "number")
            return `<aor.NumberField source="${prop.name}" />`;
        
        return `<aor.TextField source="${prop.name}"/>`;
    }

    getInputComponent(schema, prop, editMode) {
        if (prop.custom && prop.custom.ignore)
            return "";
        
        var opts = prop.required ? " validate={[required ]} " : "";
        if(opts.description)
            opts.label += prop.description;   
        opts.defaultValue = prop.defaultValue;
        if (prop.name === schema.idProperty) {        
            if (prop.metadata.type === "uid" && !editMode)
                return "";
            
            if(editMode) return `<aor.DisabledInput source="${prop.name}" ${opts}/>`;
        } 

        if (prop.custom && prop.custom.reference) {
            var html = `<aor.ReferenceInput label="${prop.custom.reference}" source="${prop.name}" 
                    reference="${prop.custom.reference}" allowEmpty `;
            if (prop.custom.referenceFilter) {
                html += `filter={${JSON.stringify(prop.custom.referenceFilter)}}`
            }
            html += `>
                <aor.SelectInput source="${prop.custom.referenceField}" />
            </aor.ReferenceInput>`;
            return html;
        }
        if (prop.metadata.type === "enum" && prop.metadata.values) {
            let choices = prop.metadata.values.map(c => { return { id: c, name: c }; });
            return `<${prop.metadata.values.length > 5 ? "aor.SelectInput" : "aor.RadioButtonGroupInput"} source="${prop.name}" choices={${JSON.stringify(choices)}} />`;            
        }

        if (prop.metadata.type === "date-iso8601") {
            return `<aor.DateInput source="${prop.name}" />`;            
        }

        if(prop.type === "number")
            return `<aor.NumberInput source="${prop.name}"  ${opts}/>`;
        
        if(prop.type === "boolean")
            return `<aor.BooleanInput source="${prop.name}"  ${opts}/>`;
        
        return `<aor.TextInput source="${prop.name}"  ${opts}/>`;
    }

    sendRequest(request) {
        return new Promise((resolve) => {
            request.end(resolve);
        })
    }
    
    prepareSchemas(services, schemas) {
        let result = {};

        for (let srv of services) {
            let schemaName = srv.schema;
            if (!schemaName || result[schemaName])
                continue;
            let schema = schemas.find(s => s.name === schemaName);
            result[schemaName] = schema;
        }
        return result;
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
}

exports.default = Context;
