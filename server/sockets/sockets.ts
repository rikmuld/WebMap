import * as express from "express"

import { Tables, TableData } from "../database/tables"

export namespace SocketIDs {
    export const ON_LOCATION_ADDED = "addLocation"
}

export namespace Sockets {
    export function addLocation(app: express.Express, socket: SocketIO.Socket) {
        return (lat: number, lng: number) => {
            Tables.Location.create(TableData.Location.location(lat, lng))
        }
    }
}