const fs = require('fs');
const ejs = require('ejs');

// Modify this for testing
let uri = 'http://localhost:8080';             // Service address
let template = "adminonrest";// "microServiceProxy"; // Template name

// Generate code from template
let templateFolder = './' + template;
try {
    let Context = require(templateFolder + '/context').Context;
    let ctx = new Context();
    ctx.address = uri + "/api/_servicedescription";

    ctx.init({ address: ctx.address })
        .then((outputFile) => {
            let template = fs.readFileSync(templateFolder + "/template.ejs", "utf8");
            let txt = ejs.render(template, ctx);
            outputFile = 'generatedFile.ts';

            fs.writeFile(outputFile, txt, (err) => {
                if (err) {
                    console.log("Code generation error : " + err);
                    return;
                }
                console.log("Code generated successfully in " + outputFile);
            });
        })
        .catch(err => {
            console.log("Code generation error : " + err);
        });
} catch (e) {
    console.log("Code generation error : " + e);
}

