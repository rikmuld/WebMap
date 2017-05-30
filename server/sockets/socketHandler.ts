import * as express from "express"

import { SocketIDs, Sockets } from "./sockets"

export namespace SocketHandler {
    type Handler = (socket: SocketIO.Socket) => void

    export function bindHandlers(app: express.Express, io: SocketIO.Server) {
        io.on("connection", connection(app))
    }

    export function connection(app: express.Express): Handler {
        return socket => {
            socket.on(SocketIDs.LOCATION_ADDED, Sockets.addLocation(app, socket))
            socket.on(SocketIDs.LOCATIONS_REQUESTED, Sockets.getLocations(app, socket))
        }
    }
}