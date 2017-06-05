import * as express from "express"

import { Tables, TableData } from "../database/tables"
import { Future } from "../structures/future"
import { SocketIDs } from "./socketHandler"

//TODO make more flat
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

    export function getUsers(app: express.Express, socket: SocketIO.Socket) {
        return (query: string, count: number, not: string) => {
            const users = Tables.User.find({ "_id": { "$ne": not }, "$or": [
                { "name": {"$regex": query, "$options": "i"} },
                { "id": {"$regex": query, "$options": "i"} },
            ]}).limit(count).select("name id icon").exec()
            users.then(usrs => socket.emit(SocketIDs.FIND_USERS, usrs), err => console.log(err))
        }
    }

    export function subscribeManage(app: express.Express, socket: SocketIO.Socket) {
        return (to: string, subscribe: boolean) => {
            withUser(socket, user => {
                if(!subscribe) {
                    const index = user.subscriptions.indexOf(to)
                    if(index >= 0) {
                        user.subscriptions.splice(index, 1)
                        user.save()
                    }
                } else {
                    const index = user.subscriptions.indexOf(to)
                    if(index == -1) {
                        Tables.User.findOne({_id: to}, (err, newUser) => {
                            if(err) console.log(err)
                            else {
                                user.subscriptions.push(newUser._id)
                                user.save()
                            }
                        })
                    }
                }
            })
        }
    }

    function withUser(socket: SocketIO.Socket, f: (user: TableData.User.UserDocument) => void) {
        const passport = socket.request.session.passport

        if (passport && passport.user) {
            Tables.User.findOne({id: passport.user}, (err, fullUser) => { //should not be neccasary but does not seem to deserialize on sockets 
                if(fullUser) f(fullUser)
            })
        }
    }
}