var SocketIDs;
(function (SocketIDs) {
    SocketIDs.ON_LOCATION_ADDED = "addLocation";
    SocketIDs.LOCATIONS_REQUESTED = "getLocations";
})(SocketIDs || (SocketIDs = {}));
var Sockets;
(function (Sockets) {
    function addLocation(lat, lng) {
        console.log("2");
        SocketHandler.socket.emit(SocketIDs.ON_LOCATION_ADDED, lat, lng);
    }
    Sockets.addLocation = addLocation;
    function getLocations() {
        SocketHandler.socket.emit(SocketIDs.LOCATIONS_REQUESTED);
    }
    Sockets.getLocations = getLocations;
    function locationsGot(locations) {
        locations.forEach(l => placeMarker(webMap, mkLatLng(l.lat, l.lng)));
    }
    Sockets.locationsGot = locationsGot;
})(Sockets || (Sockets = {}));
