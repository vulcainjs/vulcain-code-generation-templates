const Path = require('path');
const Pastaga = require('pastaga').default;

// Use this code to test your command
// Output folder is set to '.generated'

// Initial state
let state = {
    template: "proxy",
    domain: 'vulcain',
    address: "http://localhost:8080"
}

const apo = new Pastaga();
apo.test("generate", state); // command name, state