const fs = require('fs');
const rest = require('unirest');
const TEST = 0;

class Context {

    prompts() {
        return [{ name: 'address', type: 'list', message: 'Select service', lookup: 'service.all' }];
    }

    init(options) {
        let self = this;
        if (TEST) {
            var info = JSON.parse(fs.readFileSync("admin-on-rest/test.json"));
            self.schemas = self.prepareSchemas(info.value.services, info.value.schemas);
            return Promise.resolve();
        }    

        return new Promise((resolve, reject) => {
            try {
                let request = rest.get(options.address)
                    .header('Accept', 'application/json')
                    .type("json");

                this.sendRequest(request).then(function (response) {
                    if (response.ok) {
                        var info = response.body;
                        if (info.error && info.error.message) {
                            reject(info.error.message);
                            return;
                        }
                        self.schemas = self.prepareSchemas(info.value.services, info.value.schemas);

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
        if (prop.custom && prop.custom.reference) {
            return `<ReferenceField label="${prop.custom.reference}" source="${prop.name}" reference="${prop.custom.reference}">
                <TextField source="${prop.custom.referenceField}" />
            </ReferenceField>`;
        }
        if (prop.metadata.type === "enum") {
            return `<ChipField source="${prop.name}" />`;            
        }
        if (prop.metadata.type === "date") {
            return `<DateField source="${prop.name}" />`;            
        }

        if(prop.type === "number")
            return `<NumberField source="${prop.name}" />`;
        
        return `<TextField source="${prop.name}"/>`;
    }

    getInputComponent(schema, prop, editMode) {
        var opts = prop.required ? " validate={[required ]}" : "";
        if (prop.name === schema.idProperty) {        
            if (prop.metadata.type === "uid" && !editMode)
                return "";
            
            if(editMode) return `<DisabledInput source="${prop.name}" ${opts}/>`;
        } 

        if (prop.custom && prop.custom.reference) {
            var html = `<ReferenceInput label="${prop.custom.reference}" source="${prop.name}" 
                    reference="${prop.custom.reference}" ${prop.required && !editMode ? "" : "allowEmpty"} `;
            if (prop.custom.referenceFilter) {
                html += `{${JSON.stringify(prop.custom.referenceFilter)}}`
            }
            html += `>
                <SelectInput source="${prop.custom.referenceField}" />
            </ReferenceInput>`;
            return html;
        }
        if (prop.metadata.type === "enum") {
            return `<SelectInput source="${prop.name}" choices={${JSON.stringify(prop.metadata.values)}} />`;            
        }

        if (prop.metadata.type === "date") {
            return `<DateInput source="${prop.name}" />`;            
        }

        if(prop.type === "number")
            return `<NumberInput source="${prop.name}"  ${opts}/>`;
        
        return `<TextInput source="${prop.name}"  ${opts}/>`;
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

exports.Context = Context;
