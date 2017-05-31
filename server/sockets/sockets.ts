import * as express from "express"

import { Tables, TableData } from "../database/tables"

export namespace SocketIDs {
    export const LOCATION_ADDED = "addLocation"
    export const LOCATIONS_REQUESTED = "addLocation"
}

export namespace Sockets {
    export function addLocation(app: express.Express, socket: SocketIO.Socket) {
        return (lat: number, lng: number) => {
            Tables.Markers.create(TableData.Location.location(lat, lng))
        }
    }

    export function getLocations(app: express.Express, socket: SocketIO.Socket) {
        return () => {
            withUser(socket, user => {
                Tables.Markers.find({ _id: user.locations }, (err, locations) => {
                    if (err) console.log(err)
                    else socket.emit(SocketIDs.LOCATIONS_REQUESTED, locations.map(l => TableData.Location.location(l.lat, l.lng)))
                })
            })
        }
    }

    function withUser(socket: SocketIO.Socket, f: (user: TableData.User.User) => void) {
        const passport = socket.request.session.passport

        if (passport && passport.user) f(passport.user)
    }
}