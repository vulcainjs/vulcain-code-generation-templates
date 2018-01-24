const Path = require('path');
const Pastaga = require('pastaga').default;

// Use this code to test your command
// Output folder is set to '.generated'

// Initial state
let state = {
    template: "vulcainService",
    domain: 'vulcain',
    project: "Service1",
    service: "Service1"
}

const apo = new Pastaga();
apo.test("init", state); // command name, state