const consts = require('./consts')

class Logger {
    constructor(log_lvl) { 
        this.log_lvl = log_lvl;
    }

    logStr(module_name, message) {
        return 'Noda / ' + module_name + ' / ' + message;
    }

    log(log_lvl, module_name, message) {
        if(this.log_lvl >= log_lvl) {
            console.log(this.logStr(module_name, message));
        }
    }

    time(log_lvl, module_name, message) {
        if(this.log_lvl >= log_lvl) {
            console.time(this.logStr(module_name, message))
        }
    }

    timeEnd(log_lvl, module_name, message) {
        if(this.log_lvl >= log_lvl) {
            console.timeEnd(this.logStr(module_name, message))
        }
    }
}

let logger = new Logger(consts.log_lvl);

module.exports = logger;