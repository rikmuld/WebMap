namespace Tables {
    export interface Location {
        lat: number,
        lng: number
    }

    export interface User {
        id: string,
        name: string,
        icon: string,
        subsciptions: string[],
    }
}