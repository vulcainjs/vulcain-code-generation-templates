import { Model, Property, Validator } from "vulcain-corejs";

// -----------------------------------------------------------
// Customer model
// -----------------------------------------------------------
@Model()
export class Customer {
    @Property({ type: "uid", isKey: true })
    id: string;
    @Property({ type: 'string', required: true })
    @Validator("length", { min: 4 })
    firstName: string;
    @Property({ type: "string", required: true })
    lastName: string;
}
