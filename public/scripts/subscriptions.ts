namespace Subscriptions {
    export interface SubData {
        user: Tables.UserPopulated
        icon: SubscriptionIcon
     }

    export const subscriptions: SubData[] = []
    export const temp:string[] = []

    export function setupSubscriptions(subs: Tables.UserPopulated[]) {
        subs.forEach(sub => {
            const tempId = temp.indexOf(sub._id)
            const subId = tempId >= 0? subscriptions.findIndex(s => s.user._id == sub._id) : subscriptions.length

            const fulluser = {
                user: sub,
                icon: new SubscriptionIcon(webMap, sub, subId)
            }

            if(tempId >= 0) {
                subscriptions[subId].icon.remove()
                subscriptions[subId] = fulluser
                temp.splice(tempId, 1)
            } else subscriptions.push(fulluser)
        })
    }

    export function preSetup(sub: Tables.User) {
        setupSubscriptions([Tables.populate(sub)])
        temp.push(sub._id)
    }

    export function addLocation(sub: string, latlgn: google.maps.LatLng) {
        subscriptions.find(s => s.user._id == sub).icon.addLocation(latlgn)
    }

    export function getColor(usr: string): number[] {
        return colors[subIndex(usr)]
    }
    
    export function subIndex(urs: string): number {
        return subscriptions.findIndex(s => s.user._id == urs)
    }

    export function getLocations(user: string): Tables.Location[] {
        const fullUser = subscriptions.find(s => s.user._id == user)
        return fullUser? fullUser.user.locations : []
    }

    export function get(usr: string): SubData {
        const index = subIndex(usr)
        return index == -1? null : subscriptions[subIndex(usr)]
    }

    export function remove(usr: string) {
        const index = subIndex(usr)
        subscriptions[index].icon.remove()
        subscriptions.splice(index, 1)
    }
}