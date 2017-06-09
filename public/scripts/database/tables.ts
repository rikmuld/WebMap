namespace Tables {
    export interface Location {
        _id: string,
        lat: number,
        lng: number
    }

    interface UserGeneric {
        _id: string,
        id: string,
        name: string,
        icon: string,
    }

    export interface User extends UserGeneric {
        subscriptions: string[],
        locations: string[],
    }

    export interface UserPopulated extends UserGeneric {
        subscriptions: UserGeneric[]
        locations: Location[]
    }
}