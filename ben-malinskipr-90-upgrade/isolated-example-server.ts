import {buildExampleServer} from "../examples/server/server.ts";
const server=buildExampleServer();
console.log(await server.listen({host:"127.0.0.1",port:55193}));
