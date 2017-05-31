namespace SocketIDs {
    export const ON_LOCATION_ADDED = "addLocation"
    export const LOCATIONS_REQUESTED = "getLocations"
}

namespace Sockets {
    export function addLocation(lat: number, lng: number) {
        SocketHandler.socket.emit(SocketIDs.ON_LOCATION_ADDED, lat, lng)
    }

    export function getLocations() {
        SocketHandler.socket.emit(SocketIDs.LOCATIONS_REQUESTED)
    }

    export function locationsGot(locations: Tables.Location[]) {
        locations.forEach(l => placeMarker(webMap, mkLatLng(l.lat, l.lng)))
    }
}