var SocketIDs;
(function (SocketIDs) {
    SocketIDs.ON_LOCATION_ADDED = "addLocation";
})(SocketIDs || (SocketIDs = {}));
var Sockets;
(function (Sockets) {
    function addLocation(lat, lng) {
        SocketHandler.socket.emit(SocketIDs.ON_LOCATION_ADDED, lat, lng);
    }
    Sockets.addLocation = addLocation;
})(Sockets || (Sockets = {}));
