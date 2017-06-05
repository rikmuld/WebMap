"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sockets_1 = require("./sockets");
var SocketIDs;
(function (SocketIDs) {
    SocketIDs.LOCATION_ADDED = "addLocation";
    SocketIDs.LOCATIONS_REQUESTED = "getLocations";
    SocketIDs.FIND_USERS = "findUsers";
    SocketIDs.SUBSCRIBE_MANAGE = "subscribe";
})(SocketIDs = exports.SocketIDs || (exports.SocketIDs = {}));
var SocketHandler;
(function (SocketHandler) {
    function bindHandlers(app, io) {
        io.on("connection", connection(app));
    }
    SocketHandler.bindHandlers = bindHandlers;
    function connection(app) {
        return socket => {
            socket.on(SocketIDs.LOCATION_ADDED, sockets_1.Sockets.addLocation(app, socket));
            socket.on(SocketIDs.LOCATIONS_REQUESTED, sockets_1.Sockets.getLocations(app, socket));
            socket.on(SocketIDs.FIND_USERS, sockets_1.Sockets.getUsers(app, socket));
            socket.on(SocketIDs.SUBSCRIBE_MANAGE, sockets_1.Sockets.subscribeManage(app, socket));
        };
    }
    SocketHandler.connection = connection;
})(SocketHandler = exports.SocketHandler || (exports.SocketHandler = {}));
