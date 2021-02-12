console.log("Running 'node server.js' command");
const { spawn } = require('child_process');
const child = spawn('node', ['server.js']);

child.stdout.setEncoding('utf8').on('data', (chunk) => {
    console.log(chunk);
});

child.on('close', (code) => {
    console.log(`'node server.js' process exited with code ${code}`);
});