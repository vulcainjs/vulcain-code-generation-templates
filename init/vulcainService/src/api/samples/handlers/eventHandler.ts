import { EventHandler, Consume, AbstractEventHandler, EventData, System } from "vulcain-corejs";
import { Customer } from "../models/models";
import { MyCommand } from "../commands/mycommand";

@EventHandler({ schema: "Customer", subscribeToDomain: System.domainName })
export class CustomerEventHandler extends AbstractEventHandler {

    // Event handler on domain customer, schema customer and action create
    // with a custom filter to take only action completed successfully
    @Consume({ description: "Simple event handler", subscribeToAction: "create" })
    async onCreateCustomer(customer: Customer) {
        console.log(`${customer.lastName} ${customer.firstName} created`);
       // this.requestContext.sendCustomEvent("x", {}, "Customer");
        return true;
    }
}
