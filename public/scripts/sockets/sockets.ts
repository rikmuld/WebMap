namespace Sockets {
    export function addLocation(lat: number, lng: number) {
        SocketHandler.socket.emit(SocketIDs.LOCATION_ADDED, lat, lng)
    }

    export function getLocations() {
        SocketHandler.socket.emit(SocketIDs.LOCATIONS_REQUESTED)
    }

    export function locationsGot(locations: Tables.Location[]) {
        locations.forEach(l => addLocations(locations))
    }

    export function findUsers(query: string, count: number) {
        SocketHandler.socket.emit(SocketIDs.FIND_USERS, query, count, user._id)
    }

    export function usersGot(users: Tables.User[]) {
        serachbar.updateUsers(users)
    }
    
    export function manageSubscription(to: string, subsciption: boolean) {
        const index = user.subsciptions.indexOf(to)

        if(subsciption && index == -1) {
            user.subsciptions.push(to)
            SocketHandler.socket.emit(SocketIDs.SUBSCRIBE_MANAGE, to, subsciption)  
        } else if(!subsciption && index >= 0) {
            user.subsciptions.splice(index, 1)
            SocketHandler.socket.emit(SocketIDs.SUBSCRIBE_MANAGE, to, subsciption)  
        }
    }
}