import * as mongoose from 'mongoose'

export namespace Tables {
    export let Markers: mongoose.Model<TableData.Location.LocationDocument>
    export let User: mongoose.Model<TableData.User.UserDocument>

    export function initTables() {
        Markers = mongoose.model<TableData.Location.LocationDocument>(TableData.Location.ID, TableData.Location.locationSchema)
        User = mongoose.model<TableData.User.UserDocument>(TableData.User.ID, TableData.User.userSchema)
    }
}

export namespace TableData {
    function refrence(to: string): {} {
        return { type: String, ref: to }
    }

    export namespace Location {
        export const ID = "Location"

        export const locationSchema = new mongoose.Schema({
            lat: Number,
            lng: Number
        })

        export interface Location {
            lat: number,
            lng: number
        }

        export interface LocationDocument extends Location, mongoose.Document { }

        export function location(lat: number, lng: number): Location {
            return {
                lat: lat,
                lng: lng
            }
        }
    }

    export namespace User {
        export const ID = "User"

        export const userSchema = new mongoose.Schema({
            id: String,
            name: String,
            icon: String,
            locations: [refrence(Location.ID)],
            subscriptions: [refrence(ID)]
        })

        export interface User {
            id: string,
            name: string,
            icon: string,
            locations?: Location.Location[],
            subscriptions?: User[]
        }

        export interface UserDocument extends User, mongoose.Document { }

        export function user(id: string, name: string, icon: string): User {
            return {
                id: id,
                name: name,
                icon: icon
            }
        }
    }
}