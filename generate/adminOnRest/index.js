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
        if (prop.definition.aor && prop.definition.aor.ignore)
            return "";
        
        if (prop.reference) {
            return `<aor.ReferenceField label="${prop.reference}" source="${prop.name}" reference="${prop.reference}">
                <aor.TextField source="${prop.definition.referenceField}" />
            </aor.ReferenceField>`;
        }
        if (prop.definition.type === "enum") {
            return `<aor.ChipField source="${prop.name}" />`;            
        }
        if (prop.definition.type === "date") {
            return `<aor.DateField source="${prop.name}" />`;            
        }
        if(prop.type === "boolean")
            return `<aor.BooleanField source="${prop.name}" />`;
        
        if(prop.type === "number")
            return `<aor.NumberField source="${prop.name}" />`;
        
        return `<aor.TextField source="${prop.name}"/>`;
    }

    getInputComponent(schema, prop, editMode) {
        if (prop.definition.aor && prop.definition.aor.ignore)
            return "";
        
        var opts = prop.required ? " validate={[required ]}" : "";
        if(opts.description)
            opts.label += " " + prop.description;   
        if(opts.defaultValue)
            opts.defaultValue += " " + prop.defaultValue;
        
        if (prop.name === schema.idProperty) {        
            if (prop.definition.type === "uid" && !editMode)
                return "";
            
            if(editMode) return `<aor.DisabledInput source="${prop.name}" ${opts}/>`;
        } 

        if (prop.reference) {
            var html = `<aor.ReferenceInput label="${prop.reference}" source="${prop.name}" 
                    reference="${prop.reference}" allowEmpty `;
            if (prop.definition.aor && prop.definition.aor.filter) {
                html += `filter={${JSON.stringify(prop.definition.aor.filter)}}`
            }
            html += `>
                <aor.SelectInput source="${prop.definition.referenceField}" />
            </aor.ReferenceInput>`;
            return html;
        }
        if (prop.definition.type === "enum" && prop.definition.values) {
            let choices = prop.definition.values.map(c => { return { id: c, name: c }; });
            return `<${prop.definition.values.length > 5 ? "aor.SelectInput" : "aor.RadioButtonGroupInput"} source="${prop.name}" choices={${JSON.stringify(choices)}} />`;            
        }

        if (prop.definition.type === "date-iso8601") {
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
        return (result + ".Components").replace(/-/g, '');
    }
}

exports.default = Context;
