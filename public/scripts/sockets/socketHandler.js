var SocketIDs;
(function (SocketIDs) {
    SocketIDs.LOCATION_ADDED = "addLocation";
    SocketIDs.LOCATIONS_REQUESTED = "getLocations";
    SocketIDs.FIND_USERS = "findUsers";
    SocketIDs.SUBSCRIBE_MANAGE = "subscribe";
})(SocketIDs || (SocketIDs = {}));
var SocketHandler;
(function (SocketHandler) {
    function init() {
        SocketHandler.socket = io();
        SocketHandler.socket.on(SocketIDs.LOCATIONS_REQUESTED, Sockets.locationsGot);
        SocketHandler.socket.on(SocketIDs.FIND_USERS, Sockets.usersGot);
    }
    SocketHandler.init = init;
})(SocketHandler || (SocketHandler = {}));
