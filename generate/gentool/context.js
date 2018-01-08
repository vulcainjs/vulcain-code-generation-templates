const fs = require('fs');

class Context {
    
    *prompts() {
        yield new Promise(resolve => resolve({
            type: 'input',
            name: 'first_name',
            message: "What's your first name"
        }));
        yield {
            type: 'input',
            name: 'last_name',
            message: "What's your last name " + this.state.first_name,
            default: function () {
                return 'Doe';
            }
        };
        if( this.state.last_name !== "quit")
        yield {
            type: 'input',
            name: 'phone',
            message: "What's your phone number",
            validate: function (value) {
                var pass = value.match(
                    /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
                );
                if (pass) {
                    return true;
                }

                return 'Please enter a valid phone number';
            }
        };
    }

    *generate(options) {
        yield { outputFile: "toto.js", context: options, template: "template.ejs" };
    }

    exec() {
        return Promise.resolve(this.generate);
    }

    getFieldComponent(prop) {
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

        if(prop.type === "number")
            return `<aor.NumberField source="${prop.name}" />`;
        
        return `<aor.TextField source="${prop.name}"/>`;
    }

    getInputComponent(schema, prop, editMode) {
        var opts = prop.required ? " validate={[required ]}" : "";
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

exports.Context = Context;
