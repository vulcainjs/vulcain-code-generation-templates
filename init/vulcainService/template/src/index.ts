import { Application, Service } from "vulcain-corejs";

// The domain is mandatory
const domain = "<%=state.domain %>";

// Default configuration
let port = 8080;

let app = new Application(domain);
app.start(port);
