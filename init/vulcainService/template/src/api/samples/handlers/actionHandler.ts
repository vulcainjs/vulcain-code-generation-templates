import { ActionHandler, CommandFactory, Action, DefaultActionHandler, Inject } from "vulcain-corejs";
import { CustomerQueryHandler } from './queryHandler';
import { MyCommand } from '../commands/mycommand';

// -----------------------------------------------------------
// Default crud action handlers
// -----------------------------------------------------------
@ActionHandler({ async: false, scope: "?", schema: "Customer" })
export class CustomerActionHandler extends DefaultActionHandler {

    @Inject()
    customers: CustomerQueryHandler;

    @Action({ description: "Custom action", outputSchema: "string" }) // action = method name
    async myAction() {
        // The following line shows how to make an in-process handler method call
        // tslint:disable-next-line:no-unused-variable
        let customerList = await this.customers.getAll();

        // Using a command
        const cmd = CommandFactory.createCommand<MyCommand>(this.context, "MyCommand");
        return cmd.exec(1);
    }
}

