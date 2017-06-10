"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tables_1 = require("../database/tables");
const future_1 = require("../structures/future");
const socketHandler_1 = require("./socketHandler");
const list_1 = require("../structures/list");
//TODO make more flat
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
        return (user) => {
            const userLoc = getLocation(user);
            const users = userLoc.flatMap(fullUser => list_1.List.toIOMap(fullUser.subscriptions).run(getLocation));
            userLoc.then(usr => socket.emit(socketHandler_1.SocketIDs.LOCATIONS_REQUESTED, [usr]), err => console.log(err));
            users.then(urs => socket.emit(socketHandler_1.SocketIDs.LOCATIONS_REQUESTED, urs.toArray()), err => console.log(err));
        };
    }
    Sockets.getLocations = getLocations;
    function getLocation(user) {
        return future_1.Future.lift(tables_1.Tables.User.findOne({ _id: user }).populate('locations').exec());
    }
    function getUsers(app, socket) {
        return (query, count, not) => {
            const users = tables_1.Tables.User.find({ "_id": { "$ne": not }, "$or": [
                    { "name": { "$regex": query, "$options": "i" } },
                    { "id": { "$regex": query, "$options": "i" } },
                ] }).limit(count).select("name id icon").exec();
            users.then(usrs => socket.emit(socketHandler_1.SocketIDs.FIND_USERS, usrs), err => console.log(err));
        };
    }
    Sockets.getUsers = getUsers;
    function subscribeManage(app, socket) {
        return (to, subscribe) => {
            withUser(socket, user => {
                if (!subscribe) {
                    const index = user.subscriptions.indexOf(to);
                    if (index >= 0) {
                        user.subscriptions.splice(index, 1);
                        user.save();
                    }
                }
                else {
                    const index = user.subscriptions.indexOf(to);
                    if (index == -1) {
                        tables_1.Tables.User.findOne({ _id: to }).populate('locations').exec((err, newUser) => {
                            if (err)
                                console.log(err);
                            else {
                                user.subscriptions.push(newUser._id);
                                user.save();
                                socket.emit(socketHandler_1.SocketIDs.LOCATIONS_REQUESTED, newUser);
                            }
                        });
                    }
                }
            });
        };
    }
    Sockets.subscribeManage = subscribeManage;
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
