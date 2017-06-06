"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var Tables;
(function (Tables) {
    function initTables() {
        Tables.Markers = mongoose.model(TableData.Location.ID, TableData.Location.locationSchema);
        Tables.User = mongoose.model(TableData.User.ID, TableData.User.userSchema);
    }
    Tables.initTables = initTables;
})(Tables = exports.Tables || (exports.Tables = {}));
var TableData;
(function (TableData) {
    function refrence(to) {
        return { type: String, ref: to };
    }
    var Location;
    (function (Location) {
        Location.ID = "Location";
        Location.locationSchema = new mongoose.Schema({
            lat: Number,
            lng: Number
        });
        function location(lat, lng) {
            return {
                lat: lat,
                lng: lng
            };
        }
        Location.location = location;
    })(Location = TableData.Location || (TableData.Location = {}));
    var User;
    (function (User) {
        User.ID = "User";
        User.userSchema = new mongoose.Schema({
            id: String,
            name: String,
            icon: String,
            locations: [refrence(Location.ID)],
            subscriptions: [refrence(User.ID)]
        });
        function user(id, name, icon) {
            return {
                id: id,
                name: name,
                icon: icon
            };
        }
        User.user = user;
    })(User = TableData.User || (TableData.User = {}));
})(TableData = exports.TableData || (exports.TableData = {}));
