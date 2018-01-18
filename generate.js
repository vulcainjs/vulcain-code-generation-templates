const Path = require('path');
const Apotek = require('apotek').default;

// Specific state
// let state = {
//     outputFolder: Path.join(shell.pwd().toString(), "generated"),
//     address: 'http://localhost:8080',
//     template: "adminOnRest"
// };
let state = {
    template: "proxy",
    address: 'http://localhost:8080'
}

const apo = new Apotek();
apo.test("generate", state);