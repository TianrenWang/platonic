// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/account/register.e2e-spec.ts',
    './src/usecases/*.e2e-spec.ts',
    './src/account/unregister.e2e-spec.ts'
  ],
  params: {
    waitTimeout: 4000
  },
  capabilities: {
    browserName: 'chrome'
  },
  directConnect: true,
  SELENIUM_PROMISE_MANAGER: false,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: StacktraceOption.PRETTY
      }
    }));
    if (require('../config/index').env === "testing"){
      console.log("Running 'node server.js' command");
      const { spawn } = require('child_process');
      const child = spawn('node', ['server.js']);

      // use child.stdout.setEncoding('utf8'); if you want text chunks
      child.stdout.setEncoding('utf8').on('data', (chunk) => {
        console.log(chunk);
      });

      // since these are streams, you can pipe them elsewhere
      // child.stderr.pipe(dest);

      child.on('close', (code) => {
        console.log(`'node server.js' process exited with code ${code}`);
      });
    }
  },
  onCleanUp(){
    if (require('../config/index').env === "testing"){
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
    }
  }
};