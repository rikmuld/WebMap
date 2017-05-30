"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sockets_1 = require("./sockets");
var SocketHandler;
(function (SocketHandler) {
    function bindHandlers(app, io) {
        io.on("connection", connection(app));
    }
    SocketHandler.bindHandlers = bindHandlers;
    function connection(app) {
        return socket => {
            socket.on(sockets_1.SocketIDs.ON_LOCATION_ADDED, sockets_1.Sockets.addLocation(app, socket));
        };
    }
    SocketHandler.connection = connection;
})(SocketHandler = exports.SocketHandler || (exports.SocketHandler = {}));
