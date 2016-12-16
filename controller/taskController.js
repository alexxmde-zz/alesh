const spawn = require('child_process').spawn;
const readline = require('readline');
const process = require('process');


module.exports = function taskController() {
    this.isWaiting = 0;

    this.executeTask = function(command, params) {

        if (command == 'cd') {
          let goto = params[0] + '/';

          process.chdir(goto);
          this.waitForInput();
        } else {

        this.isWaiting = 0;
        const childProcess = spawn(command, params);

        childProcess.stdout.on('data', (data) => {
            console.log(data.toString());
            this.waitForInput();
        });

        childProcess.stderr.on('data', (err) => {
            console.log(err.toString());
            if (!this.isWaiting) {
                this.waitForInput();
                this.isWaiting = 1;
            }
        })
      }
    }
    this.buildCommand = function(cmd) {
        let command = cmd.split(' ').shift();
        return command;
    }

    this.buildParams = function(cmd) {
        let argsArr = cmd.split(' ');
        argsArr.shift();
        let params = argsArr;
        debugger;
        return params;
    }
    this.waitForInput = function() {

            let header = this.buildHeader();
            header.then(h => {

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                })
                this.isWaiting = 1;
                rl.question(h, (answer) => {
                    let command = this.buildCommand(answer);
                    let params = this.buildParams(answer);

                    this.executeTask(command, params);
                    rl.close();
                })
            })

    }

    this.buildHeader = function() {
        return new Promise((resolve, reject) => {
            const whoami = spawn('whoami');
            whoami.stdout.on('data', user => {
                const pwd = spawn('pwd');
                pwd.stdout.on('data', pwd => {
                    //clear line breaks.
                    user = user.toString().replace('\n', '');
                    pwd = pwd.toString().replace('\n', '');
                    //Get the top working directory.
                    let dirs = pwd.toString().split('/');
                    let dir = dirs[dirs.length - 1];
                    let separator = '@';

                    let header = '[' + user + separator + dir + ']'
                    resolve(header);

                })
            })
        })
    }
}
