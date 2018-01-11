import { expect } from 'chai';
import { TestContext } from 'vulcain-corejs';
import { CustomerQueryHandler } from '../src/api/samples/handlers/queryHandler';
import { CustomerActionHandler } from '../src/api/samples/handlers/actionHandler';
import { Customer } from "../src/api/samples/models/models";

// Create a test context with an in-memory provider
// and a test authorization policy (ignore authorization).
// You can add a test user with .setUser()
let context = new TestContext(Customer); // Initialize context with required model and service

describe("Default action handler", function () {

    it("should register query handler as a service", () => {
        // Test global registered services
        expect(context.rootContainer.get("CustomerQueryHandler")).to.be.not.null;
    });

    it("should create an entity", async function () {
        // Create an handler in a scoped (request) context
        let actionHandler = context.createHandler<CustomerActionHandler>(CustomerActionHandler);
        let entity = { firstName: "elvis", lastName: "Presley" };
        await actionHandler.create(entity);

        let query = context.getService<CustomerQueryHandler>(CustomerQueryHandler.name); // Get a service within the scoped context
        entity = await query.get("Presley");

        expect(entity).to.be.not.null;
    });
});
