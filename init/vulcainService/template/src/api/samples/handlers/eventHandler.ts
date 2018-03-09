import { EventHandler, Consume, AbstractEventHandler, EventData, Service } from "vulcain-corejs";
import { Customer } from "../models/models";

@EventHandler({ schema: "Customer", subscribeToDomain: Service.domainName })
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
