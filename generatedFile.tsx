import React from 'react';
import { Create, Edit, SimpleForm, DisabledInput, TextInput, DateInput, LongTextInput, ReferenceManyField, Datagrid, TextField, 
    DateField, EditButton } from 'admin-on-rest';
import RichTextInput from 'aor-rich-text-input';

export const CustomerList = (props) => (
    <List title="Customer list" {...props}>
        <Datagrid>
            
            <TextField source="language"/>
            
            <TextField source="name"/>
            
            <TextField source="id"/>
            
        </Datagrid>
    </List>
);

const CustomerTitle = ({ record }) => {
    return record.id ? <span>Customer {record ? `"${record.id}"` : ''}</span> : <span>Customer</span>;
};

export const CustomerEdit = (props) => (
    <Edit title={<CustomerTitle />} {...props}>
        <SimpleForm>
            
            <TextField source="language"   validate={[required ]}/>
            
            <TextField source="name"   validate={[required ]}/>
            
            <DisabledInput source="id" />
            
        </SimpleForm>
    </Edit>
);

export const CustomerCreate = (props) => (
    <Create {...props}>
        <SimpleForm>

            <TextField source="language"   validate={[required ]}/>
            
            <TextField source="name"   validate={[required ]}/>
            
            
            
        </SimpleForm>
    </Create>
);
export const HopexInstanceList = (props) => (
    <List title="HopexInstance list" {...props}>
        <Datagrid>
            
            <TextField source="databaseImage"/>
            
            <TextField source="hopexImage"/>
            
            <TextField source="domain"/>
            
            <TextField source="language"/>
            
            <ReferenceField label="Customer" source="customerId" reference="Customer">
                <TextField source="name"
            </ReferenceField>
            
            <TextField source="id"/>
            
            <TextField source="instance"/>
            
        </Datagrid>
    </List>
);

const HopexInstanceTitle = ({ record }) => {
    return record.id ? <span>HopexInstance {record ? `"${record.id}"` : ''}</span> : <span>HopexInstance</span>;
};

export const HopexInstanceEdit = (props) => (
    <Edit title={<HopexInstanceTitle />} {...props}>
        <SimpleForm>
            
            <TextField source="databaseImage"   validate={[required ]}/>
            
            <TextField source="hopexImage"   validate={[required ]}/>
            
            <TextField source="domain"   validate={[required ]}/>
            
            <TextField source="language"   validate={[required ]}/>
            
            <ReferenceField label="Customer" source="customerId" reference="Customer">
                <TextField source="name"
            </ReferenceField>
            
            <DisabledInput source="id" />
            
            <TextField source="instance"  />
            
        </SimpleForm>
    </Edit>
);

export const HopexInstanceCreate = (props) => (
    <Create {...props}>
        <SimpleForm>

            <TextField source="databaseImage"   validate={[required ]}/>
            
            <TextField source="hopexImage"   validate={[required ]}/>
            
            <TextField source="domain"   validate={[required ]}/>
            
            <TextField source="language"   validate={[required ]}/>
            
            <ReferenceField label="Customer" source="customerId" reference="Customer">
                <TextField source="name"
            </ReferenceField>
            
            
            
            <TextField source="instance"  />
            
        </SimpleForm>
    </Create>
);
