namespace Tables {
    export interface Location {
        _id: string,
        lat: number,
        lng: number
    }

    export interface User {
        _id: string,
        id: string,
        name: string,
        icon: string,
        subsciptions: string[],
    }
}