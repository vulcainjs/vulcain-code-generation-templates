import { Application, System } from "vulcain-corejs";

// The domain is mandatory
const domain = "<%=state.domain %>";

// Default configuration
let port = 8080;

let builder = new Application(domain);
builder.start(port);
