import * as express from "express"

import { Tables, TableData } from "../database/tables"

export namespace SocketIDs {
    export const LOCATION_ADDED = "addLocation"
    export const LOCATIONS_REQUESTED = "addLocation"
}

export namespace Sockets {
    export function addLocation(app: express.Express, socket: SocketIO.Socket) {
        return (lat: number, lng: number) => {
            Tables.Location.create(TableData.Location.location(lat, lng))
        }
    }

    export function getLocations(app: express.Express, socket: SocketIO.Socket) {
        return () => {
            Tables.Location.find({}, (err, locations) => {
                if (err) console.log(err)
                else socket.emit(SocketIDs.LOCATIONS_REQUESTED, locations.map(l => TableData.Location.location(l.lat, l.lng)))
            })
        }
    }
}