namespace Subscriptions {
    export const subscriptions: {
        user: Tables.UserPopulated
        icon: SubscriptionIcon
     }[] = []

    export function setupSubscriptions(subs: Tables.UserPopulated[]) {
        subs.forEach(sub => {
            subscriptions.push({
                user: sub,
                icon: new SubscriptionIcon(webMap, sub, subscriptions.length)
            })
        })
    }

    export function addLocation(sub: string, latlgn: google.maps.LatLng) {
        subscriptions.find(s => s.user._id == sub).icon.addLocation(latlgn)
    }

    export function getColor(usr: string): number[] {
        return colors[subscriptions.findIndex(s => s.user._id == usr)]
    }
}