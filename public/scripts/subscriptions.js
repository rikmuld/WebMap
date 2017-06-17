var Subscriptions;
(function (Subscriptions) {
    Subscriptions.subscriptions = [];
    Subscriptions.temp = [];
    function setupSubscriptions(subs) {
        subs.forEach(sub => {
            const tempId = Subscriptions.temp.indexOf(sub._id);
            const subId = tempId >= 0 ? Subscriptions.subscriptions.findIndex(s => s.user._id == sub._id) : Subscriptions.subscriptions.length;
            const fulluser = {
                user: sub,
                icon: new SubscriptionIcon(webMap, sub, subId)
            };
            if (tempId >= 0) {
                Subscriptions.subscriptions[subId].icon.remove();
                Subscriptions.subscriptions[subId] = fulluser;
                Subscriptions.temp.splice(tempId, 1);
            }
            else
                Subscriptions.subscriptions.push(fulluser);
        });
    }
    Subscriptions.setupSubscriptions = setupSubscriptions;
    function preSetup(sub) {
        setupSubscriptions([Tables.populate(sub)]);
        Subscriptions.temp.push(sub._id);
    }
    Subscriptions.preSetup = preSetup;
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
        for (let i = 1; i < this.subscriptions.length; i++) {
            Subscriptions.subscriptions[i].icon.refresh(i);
        }
    }
    Subscriptions.remove = remove;
})(Subscriptions || (Subscriptions = {}));
