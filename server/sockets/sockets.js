"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tables_1 = require("../database/tables");
var SocketIDs;
(function (SocketIDs) {
    SocketIDs.ON_LOCATION_ADDED = "addLocation";
})(SocketIDs = exports.SocketIDs || (exports.SocketIDs = {}));
var Sockets;
(function (Sockets) {
    function addLocation(app, socket) {
        return (lat, lng) => {
            tables_1.Tables.Location.create(tables_1.TableData.Location.location(lat, lng));
        };
    }
    Sockets.addLocation = addLocation;
})(Sockets = exports.Sockets || (exports.Sockets = {}));
