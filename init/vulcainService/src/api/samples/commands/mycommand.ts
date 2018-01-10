import { System, IDynamicProperty, DynamicConfiguration, Command, HttpDependency, AbstractHttpCommand, Inject, IContainer, DefaultServiceNames, ConfigurationProperty } from "vulcain-corejs";

@Command({ executionTimeoutInMilliseconds: 1500 })
@HttpDependency("http://jsonplaceholder.typicode.com/posts/1")
export class MyCommand extends AbstractHttpCommand  {
    @ConfigurationProperty("test", "string")
    private myvalue: IDynamicProperty<string>;

    constructor( @Inject(DefaultServiceNames.Container) container: IContainer) {
        super(container);
        // Create a custom service dynamic property
        this.myvalue = DynamicConfiguration.getChainedConfigurationProperty<string>("test", "<nothing>");
    }

    // Execute command
    async exec(a: number) {
        let response = await this.get("http://jsonplaceholder.typicode.com/posts/" + a);
        return response.body.title;
    }

    // Fallback method if error on run
    // ** This is optional : Only if you want to provide a compensation for this command **
    async fallback(a: number) {
        let x = this.myvalue.value;
        return "Default value is " + x;
    }
}
