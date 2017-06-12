class SimpleControl {
    constructor(map, position, id, mainElement = "div") {
        const instance = this;
        this.map = map;
        this.el = document.createElement(mainElement);
        this.el.id = id;
        this.el.addEventListener("click", function (event) {
            instance.click(this, event);
        });
        this.map.controls[position].push(this.el);
    }
    click(div, ev) { }
}
class AddLocation extends SimpleControl {
    constructor(map, position, id, main = true) {
        super(map, position, id);
        this.active = false;
        this.main = false;
        this.childs = [];
        this.main = main;
        if (main) {
            map.addListener('click', e => {
                if (this.active) {
                    this.addLocation(e.latLng);
                    this.desctopClick();
                }
            });
            this.childs.push(new AddLocation(map, position, "atCurrent", false));
        }
    }
    click(div, ev) {
        if (!this.main)
            this.mobileClick();
        else
            this.desctopClick();
    }
    mobileClick() {
        getPosition(pos => {
            const latlng = toLatlon(pos);
            this.addLocation(latlng);
            this.map.setCenter(latlng);
            addLocation.click(null);
        });
    }
    desctopClick() {
        this.active = !this.active;
        if (this.active) {
            this.el.classList.add("active");
            this.childs.forEach(child => child.el.classList.add("active"));
        }
        else {
            this.el.classList.remove("active");
            this.childs.forEach(child => child.el.classList.remove("active"));
        }
    }
    addLocation(pos) {
        Subscriptions.addLocation(user._id, pos);
    }
}
class LocationControl extends SimpleControl {
    constructor(map, position, id) {
        super(map, position, id);
        const img = document.createElement('img');
        img.src = "/icons/location.png";
        this.el.appendChild(img);
    }
    act() {
        getPosition(position => this.map.setCenter(toLatlon(position)));
    }
    click(div, ev) {
        this.act();
    }
    error(error) {
        if (error)
            this.el.firstElementChild.classList.add("error");
        else
            this.el.firstElementChild.classList.remove("error");
    }
}
class SideNav extends SimpleControl {
    constructor(map, position) {
        super(map, position, 'hamburger', 'div');
        this.isOpen = false;
        const hamburger = document.createElement("span");
        hamburger.innerText = "\u2630";
        this.el.appendChild(hamburger);
    }
    click(div, ev) {
        if (this.isOpen)
            this.close();
        else
            this.open();
    }
    open() {
        document.getElementById("mySubscriptions").style.width = "500px";
        this.isOpen = true;
    }
    close() {
        document.getElementById("mySubscriptions").style.width = "0";
        this.isOpen = false;
        serachbar.userSearch.value = "";
    }
}
class Logout extends SimpleControl {
    constructor(map, position) {
        super(map, position, 'userLogout', 'a');
        this.el.setAttribute("href", "/logout");
        this.el.appendChild(generateUserImg(user, 0));
        this.el.classList.add("user");
    }
}
class SubscriptionIcon extends SimpleControl {
    constructor(map, user, color) {
        super(map, google.maps.ControlPosition.LEFT_BOTTOM, user._id);
        this.hidden = false;
        this.user = user;
        this.color = color;
        const fade = document.createElement('div');
        fade.classList.add("hider");
        this.el.appendChild(generateUserImg(user, color));
        this.el.appendChild(fade);
        this.el.classList.add("user");
        this.el.classList.add("subscription");
        this.markers = createMarkers(user.locations, color);
        this.show();
    }
    show() {
        this.hidden = false;
        this.markers.forEach(m => m.setMap(this.map));
        this.el.classList.remove("hidden");
    }
    hide() {
        this.hidden = true;
        this.markers.forEach(m => m.setMap(null));
        this.el.classList.add("hidden");
    }
    addLocation(latlng) {
        const marker = createMarker(latlng, this.color);
        this.markers.push(marker);
        marker.setMap(this.map);
        Sockets.addLocation(latlng.lat(), latlng.lng());
    }
    click() {
        if (this.hidden)
            this.show();
        else
            this.hide();
    }
}
class SearchBar extends SimpleControl {
    constructor(map, position, id) {
        super(map, position, id);
        this.markers = [];
        this.dosearch = 0;
        this.users = [];
        const input = document.createElement('input');
        input.placeholder = "Search for places, markers, users, tags...";
        this.el.appendChild(input);
        this.search = new google.maps.places.SearchBox(input);
        this.userSearch = $("#NavSearch").get()[0];
        const instance = this;
        this.userSearch.addEventListener('input', (e) => instance.userSearchChanged(e));
        input.addEventListener('input', (e) => instance.searchChanged(e));
        input.addEventListener('focus', e => {
            if (instance.users.length > 0)
                instance.getPacContainer().addClass("show");
        });
        input.addEventListener('blur', e => {
            setTimeout(() => instance.getPacContainer().removeClass("show"), 100);
        });
        map.addListener('bounds_changed', () => instance.search.setBounds(map.getBounds()));
        this.search.addListener('places_changed', () => instance.locationChanged());
        google.maps.event.addDomListener(this.search, 'keydown', (e) => {
            if (e.keyCode != 65)
                e.preventDefault();
        });
    }
    searchChanged(e) {
        this.dosearch += 1;
        setTimeout(() => {
            this.dosearch -= 1;
            if (this.dosearch == 0)
                this.findUsers(this.el.firstChild, !sideNav.isOpen);
        }, 120);
    }
    userSearchChanged(e) {
        this.findUsers(this.userSearch, !sideNav.isOpen);
    }
    findUsers(input, subscriptions) {
        if (input.value.length == 0)
            this.updateUsers([]);
        else if (subscriptions)
            Sockets.findUsers(input.value, 3); //change to only search in subscriptions
        else
            Sockets.findUsers(input.value, 10);
    }
    updateUsers(users) {
        this.cleanUsers();
        this.users = users;
        this.users.forEach(user => {
            if (sideNav.isOpen) {
                const pac = this.generateSubscriptionElements(user);
                this.getUserContainer().append(pac);
            }
            else {
                const pac = this.generatePacUserItem(user);
                this.getPacContainer().prepend(pac);
            }
        });
        if (!sideNav.open) {
            if (this.users.length > 0)
                this.getPacContainer().addClass("show");
            else
                this.getPacContainer().removeClass("show");
        }
    }
    cleanUsers() {
        this.users = [];
        $(".pac-user-item").remove();
        this.getUserContainer().html("");
    }
    getPacContainer() {
        return $(".pac-container");
    }
    getUserContainer() {
        return $(".people");
    }
    generatePacUserItem(user) {
        const el = document.createElement("div");
        el.classList.add("pac-item");
        el.classList.add("pac-user-item");
        const email = document.createElement("span");
        email.innerText = user.id;
        const name = document.createElement("span");
        name.innerText = user.name;
        name.classList.add("pac-item-query");
        const icon = document.createElement("span");
        icon.classList.add("pac-icon");
        icon.classList.add("pac-icon-user");
        $(el).click(() => {
            const input = this.el.firstElementChild;
            input.value = user.id;
            $(input).focus();
            $(input).blur();
            this.updateUsers([]);
            //set subscription user to state active
            //however for now:
            Sockets.manageSubscription(user._id, true);
        });
        el.appendChild(icon);
        el.appendChild(name);
        el.appendChild(email);
        return el;
    }
    generateSubscriptionElements(user) {
        const el = document.createElement("div");
        el.classList.add("person");
        const img = document.createElement("div");
        img.classList.add("user");
        img.classList.add("yAlign");
        const info = document.createElement("div");
        info.classList.add("text");
        info.classList.add("yAlign");
        const usname = document.createElement("div");
        usname.innerText = user.name;
        usname.setAttribute("id", "Name");
        const number = document.createElement("div");
        number.innerText = Subscriptions.getLocations(user._id).length.toString();
        number.setAttribute("id", "Number");
        img.appendChild(generateUserImg(user, Subscriptions.subIndex(user._id)));
        info.appendChild(usname);
        info.appendChild(number);
        el.appendChild(img);
        el.appendChild(info);
        return el;
    }
    locationChanged() {
        const instance = this;
        const places = this.search.getPlaces();
        this.searchChanged(null);
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            this.markers.push(new google.maps.Marker({
                map: this.map,
                position: place.geometry.location
            }));
            if (place.geometry.viewport)
                bounds.union(place.geometry.viewport);
            else
                bounds.extend(place.geometry.location);
        });
        this.map.fitBounds(bounds);
    }
}
