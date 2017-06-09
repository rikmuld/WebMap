namespace Subscriptions {
    export const subscriptions: {
        user: Tables.UserPopulated
        icon: SubscriptionIcon
     }[] = []

    export function setupSubscription(sub: Tables.UserPopulated) {
        subscriptions.push({
            user: sub,
            icon: new SubscriptionIcon(webMap, sub)
        })
    }
}