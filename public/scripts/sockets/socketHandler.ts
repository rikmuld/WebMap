declare const io

namespace SocketIDs {
    export const LOCATION_ADDED = "addLocation"
    export const LOCATIONS_REQUESTED = "getLocations"
    export const FIND_USERS = "findUsers"
    export const SUBSCRIBE_MANAGE = "subscribe"
}

namespace SocketHandler {
    export let socket

    export function init() {
        socket = io()

        socket.on(SocketIDs.LOCATIONS_REQUESTED, Sockets.locationsGot)
        socket.on(SocketIDs.FIND_USERS, Sockets.usersGot)
    }
}