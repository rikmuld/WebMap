var Sockets;
(function (Sockets) {
    function addLocation(lat, lng) {
        SocketHandler.socket.emit(SocketIDs.LOCATION_ADDED, lat, lng);
    }
    Sockets.addLocation = addLocation;
    function getLocations() {
        SocketHandler.socket.emit(SocketIDs.LOCATIONS_REQUESTED, user._id);
    }
    Sockets.getLocations = getLocations;
    function locationsGot(fullUsers) {
        console.log(fullUsers);
        Subscriptions.setupSubscriptions(fullUsers);
    }
    Sockets.locationsGot = locationsGot;
    function findUsers(query, count) {
        SocketHandler.socket.emit(SocketIDs.FIND_USERS, query, count, user._id);
    }
    Sockets.findUsers = findUsers;
    function usersGot(users) {
        serachbar.updateUsers(users);
    }
    Sockets.usersGot = usersGot;
    function manageSubscription(to, subsciption) {
        const index = Subscriptions.subIndex(to);
        if (subsciption && index == -1) {
            SocketHandler.socket.emit(SocketIDs.SUBSCRIBE_MANAGE, to, subsciption);
        }
        else if (!subsciption && index >= 0) {
            SocketHandler.socket.emit(SocketIDs.SUBSCRIBE_MANAGE, to, subsciption);
        }
    }
    Sockets.manageSubscription = manageSubscription;
})(Sockets || (Sockets = {}));
