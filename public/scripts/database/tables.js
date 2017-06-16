var Tables;
(function (Tables) {
    function populate(user) {
        const poped = user;
        poped.subscriptions = [];
        poped.locations = [];
        return poped;
    }
    Tables.populate = populate;
})(Tables || (Tables = {}));
