var Subscriptions;
(function (Subscriptions) {
    Subscriptions.subscriptions = [];
    function setupSubscriptions(subs) {
        subs.forEach(sub => {
            Subscriptions.subscriptions.push({
                user: sub,
                icon: new SubscriptionIcon(webMap, sub, Subscriptions.subscriptions.length)
            });
        });
    }
    Subscriptions.setupSubscriptions = setupSubscriptions;
    function addLocation(sub, latlgn) {
        Subscriptions.subscriptions.find(s => s.user._id == sub).icon.addLocation(latlgn);
    }
    Subscriptions.addLocation = addLocation;
    function getColor(usr) {
        return colors[Subscriptions.subscriptions.findIndex(s => s.user._id == usr)];
    }
    Subscriptions.getColor = getColor;
})(Subscriptions || (Subscriptions = {}));
