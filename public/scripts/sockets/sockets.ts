namespace SocketIDs {
    export const ON_LOCATION_ADDED = "addLocation"
}

namespace Sockets {
    export function addLocation(lat: number, lng: number) {
        SocketHandler.socket.emit(SocketIDs.ON_LOCATION_ADDED, lat, lng)
    }
}