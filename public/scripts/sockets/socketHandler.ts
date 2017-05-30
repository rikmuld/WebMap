declare const io

namespace SocketHandler {
    export let socket

    export function init() {
        socket = io()

        socket.on(SocketIDs.LOCATIONS_REQUESTED, Sockets.locationsGot)
    }
}