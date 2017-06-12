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
        return colors[subIndex(usr)];
    }
    Subscriptions.getColor = getColor;
    function subIndex(urs) {
        return Subscriptions.subscriptions.findIndex(s => s.user._id == urs);
    }
    Subscriptions.subIndex = subIndex;
    function getLocations(user) {
        const fullUser = Subscriptions.subscriptions.find(s => s.user._id == user);
        return fullUser ? fullUser.user.locations : [];
    }
    Subscriptions.getLocations = getLocations;
    function get(usr) {
        const index = subIndex(usr);
        return index == -1 ? null : Subscriptions.subscriptions[subIndex(usr)];
    }
    Subscriptions.get = get;
    function remove(usr) {
        const index = subIndex(usr);
        Subscriptions.subscriptions[index].icon.remove();
        Subscriptions.subscriptions.splice(index, 1);
    }
    Subscriptions.remove = remove;
})(Subscriptions || (Subscriptions = {}));
