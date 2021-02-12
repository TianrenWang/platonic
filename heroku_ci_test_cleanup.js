console.log("Killing 'node server.js' process");
const { exec } = require('child_process');
exec("pkill -f 'node server.js'", (err, stdout, stderr) => {
    if (err) {
        console.log("Could not kill node server.js process");
        return;
    }

    console.log("'pkill -f node server.js' started successfully");
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});