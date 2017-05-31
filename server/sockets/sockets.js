"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tables_1 = require("../database/tables");
const future_1 = require("../structures/future");
var SocketIDs;
(function (SocketIDs) {
    SocketIDs.LOCATION_ADDED = "addLocation";
    SocketIDs.LOCATIONS_REQUESTED = "getLocations";
})(SocketIDs = exports.SocketIDs || (exports.SocketIDs = {}));
var Sockets;
(function (Sockets) {
    function addLocation(app, socket) {
        return (lat, lng) => {
            withUser(socket, user => {
                future_1.Future.lift(tables_1.Tables.Markers.create(tables_1.TableData.Location.location(lat, lng))).flatMap(marker => {
                    user.locations.push(marker._id);
                    return user.save();
                });
            });
        };
    }
    Sockets.addLocation = addLocation;
    function getLocations(app, socket) {
        return () => {
            withUser(socket, user => {
                tables_1.Tables.Markers.find({ _id: user.locations }, (err, locations) => {
                    if (err)
                        console.log(err);
                    else
                        socket.emit(SocketIDs.LOCATIONS_REQUESTED, locations.map(l => tables_1.TableData.Location.location(l.lat, l.lng)));
                });
            });
        };
    }
    Sockets.getLocations = getLocations;
    function withUser(socket, f) {
        const passport = socket.request.session.passport;
        if (passport && passport.user) {
            tables_1.Tables.User.findOne({ id: passport.user }, (err, fullUser) => {
                if (fullUser)
                    f(fullUser);
            });
        }
    }
})(Sockets = exports.Sockets || (exports.Sockets = {}));
