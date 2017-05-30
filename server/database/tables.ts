import * as mongoose from 'mongoose'

export namespace Tables {
    export let Location: mongoose.Model<TableData.Location.LocationDocument>

    export function initTables() {
        Location = mongoose.model<TableData.Location.LocationDocument>('Location', TableData.Location.locationSchema)
    }
}

export namespace TableData {
    export namespace Location {
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
}