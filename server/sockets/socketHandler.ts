import * as express from "express"

import { Sockets } from "./sockets"

export namespace SocketIDs {
    export const LOCATION_ADDED = "addLocation"
    export const LOCATIONS_REQUESTED = "getLocations"
    export const FIND_USERS = "findUsers"
    export const SUBSCRIBE_MANAGE = "subscribe"
}

export namespace SocketHandler {
    type Handler = (socket: SocketIO.Socket) => void

    export function bindHandlers(app: express.Express, io: SocketIO.Server) {
        io.on("connection", connection(app))
    }

    export function connection(app: express.Express): Handler {
        return socket => {
            socket.on(SocketIDs.LOCATION_ADDED, Sockets.addLocation(app, socket))
            socket.on(SocketIDs.LOCATIONS_REQUESTED, Sockets.getLocations(app, socket))
            socket.on(SocketIDs.FIND_USERS, Sockets.getUsers(app, socket))
            socket.on(SocketIDs.SUBSCRIBE_MANAGE, Sockets.subscribeManage(app, socket))
        }
    }
}