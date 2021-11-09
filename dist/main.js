"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
Promise.all([
    child_process_1.exec("pm2 start -f dist/be-user/main.js --name 'test-user'"),
]).then(() => {
    console.log('Server is starting. Please wait for pm2 response!');
});
//# sourceMappingURL=main.js.map