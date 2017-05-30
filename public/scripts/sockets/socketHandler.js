var SocketHandler;
(function (SocketHandler) {
    function init() {
        SocketHandler.socket = io();
        SocketHandler.socket.on(SocketIDs.LOCATIONS_REQUESTED, Sockets.locationsGot);
    }
    SocketHandler.init = init;
})(SocketHandler || (SocketHandler = {}));
