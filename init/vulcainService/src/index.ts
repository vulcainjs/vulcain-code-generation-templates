import { Application, System } from "vulcain-corejs";

// The domain is mandatory
const domain = "<%=project.namespace %>";

// Default configuration
let port = 8080;

let builder = new Application(domain);
builder.start(port);
