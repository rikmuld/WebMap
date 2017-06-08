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
        placeMarker(this.map, pos);
        Sockets.addLocation(pos.lat(), pos.lng());
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
class Logout extends SimpleControl {
    constructor(map, position) {
        super(map, position, 'userLogout', 'a');
        const img = document.createElement('img');
        img.src = user.icon;
        this.el.setAttribute("href", "/logout");
        this.el.appendChild(img);
        this.el.classList.add("user");
    }
}
class SubscriptionIcon extends SimpleControl {
    constructor(map, user) {
        super(map, google.maps.ControlPosition.LEFT_CENTER, user._id);
        this.hidden = false;
        this.user = user;
        const img = document.createElement('img');
        img.src = user.icon;
        const fade = document.createElement('div');
        fade.classList.add("fade");
        this.el.appendChild(img);
        this.el.appendChild(fade);
        this.el.classList.add("user");
        this.el.classList.add("subscription");
        this.markers = createMarkers(user.locations);
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
        const instance = this;
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
                this.findUsers(this.el.firstChild, true);
        }, 120);
    }
    findUsers(input, subscriptions) {
        if (input.value.length == 0)
            this.updateUsers([]);
        else if (subscriptions)
            Sockets.findUsers(input.value, 3); //change to only search in subscriptions
        else
            Sockets.findUsers(input.value, 3);
    }
    updateUsers(users) {
        this.cleanUsers();
        this.users = users;
        this.users.forEach(user => {
            const pac = this.generatePacUserItem(user);
            this.getPacContainer().prepend(pac);
        });
        if (this.users.length > 0)
            this.getPacContainer().addClass("show");
        else
            this.getPacContainer().removeClass("show");
    }
    cleanUsers() {
        this.users = [];
        $(".pac-user-item").remove();
    }
    getPacContainer() {
        return $(".pac-container");
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
        });
        el.appendChild(icon);
        el.appendChild(name);
        el.appendChild(email);
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
