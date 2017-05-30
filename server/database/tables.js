"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var Tables;
(function (Tables) {
    function initTables() {
        Tables.Location = mongoose.model('Location', TableData.Location.locationSchema);
    }
    Tables.initTables = initTables;
})(Tables = exports.Tables || (exports.Tables = {}));
var TableData;
(function (TableData) {
    var Location;
    (function (Location) {
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
})(TableData = exports.TableData || (exports.TableData = {}));
