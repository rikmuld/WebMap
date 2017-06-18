namespace Sockets {
    export function addLocation(lat: number, lng: number) {
        SocketHandler.socket.emit(SocketIDs.LOCATION_ADDED, lat, lng)
    }

    export function getLocations() {
        SocketHandler.socket.emit(SocketIDs.LOCATIONS_REQUESTED, user._id)
    }

    export function locationsGot(fullUsers: Tables.UserPopulated[]) {
        Subscriptions.setupSubscriptions(fullUsers)
    }

    export function findUsers(query: string, count: number) {
        SocketHandler.socket.emit(SocketIDs.FIND_USERS, query, count, user._id)
    }

    export function usersGot(users: Tables.User[]) {
        serachbar.updateUsers(users)
    }
    
    export function manageSubscription(to: Tables.User, subsciption: boolean) {
        const index = Subscriptions.subIndex(to._id)

        if(subsciption && index == -1) {
            SocketHandler.socket.emit(SocketIDs.SUBSCRIBE_MANAGE, to._id, subsciption)  
            Subscriptions.preSetup(to)
        } else if(!subsciption && index >= 0) {
            SocketHandler.socket.emit(SocketIDs.SUBSCRIBE_MANAGE, to._id, subsciption)  
            Subscriptions.remove(to._id)
        }
    }
}