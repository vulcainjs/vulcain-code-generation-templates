import { Model, Property, Validator } from "vulcain-corejs";

// -----------------------------------------------------------
// Customer model
// -----------------------------------------------------------
@Model()
export class Customer {
    @Property({ type: 'string', required: true })
    @Validator("length", { min: 5 })
    firstName: string;
    @Property({ type: "string", required: true, unique: true, isKey: true })
    lastName: string;
}
