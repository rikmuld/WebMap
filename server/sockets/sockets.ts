import * as express from "express"

import { Tables, TableData } from "../database/tables"
import { Future } from "../structures/future"

export namespace SocketIDs {
    export const LOCATION_ADDED = "addLocation"
    export const LOCATIONS_REQUESTED = "getLocations"
}

export namespace Sockets {
    export function addLocation(app: express.Express, socket: SocketIO.Socket) {
        return (lat: number, lng: number) => {
            withUser(socket, user => {
                Future.lift(Tables.Markers.create(TableData.Location.location(lat, lng))).flatMap(marker => {
                    user.locations.push(marker._id)
                    return user.save()
                })
            })
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

    function withUser(socket: SocketIO.Socket, f: (user: TableData.User.UserDocument) => void) {
        const passport = socket.request.session.passport

        if (passport && passport.user) {
            Tables.User.findOne({id: passport.user}, (err, fullUser) => { //should not be neccasary but does not seem to deserialize, at least on sockets 
                if(fullUser) f(fullUser)
            })
        }
    }
}