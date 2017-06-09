var Subscriptions;
(function (Subscriptions) {
    Subscriptions.subscriptions = [];
    function setupSubscription(sub) {
        Subscriptions.subscriptions.push({
            user: sub,
            icon: new SubscriptionIcon(webMap, sub)
        });
    }
    Subscriptions.setupSubscription = setupSubscription;
})(Subscriptions || (Subscriptions = {}));
