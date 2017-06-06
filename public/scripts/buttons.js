class SimpleControl {
    constructor(map, position, id) {
        const instance = this;
        this.map = map;
        this.div = document.createElement('div');
        this.div.id = id;
        this.div.addEventListener("click", function (event) {
            instance.click(this, event);
        });
        this.map.controls[position].push(this.div);
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
            this.div.classList.add("active");
            this.childs.forEach(child => child.div.classList.add("active"));
        }
        else {
            this.div.classList.remove("active");
            this.childs.forEach(child => child.div.classList.remove("active"));
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
        this.div.appendChild(img);
    }
    act() {
        getPosition(position => this.map.setCenter(toLatlon(position)));
    }
    click(div, ev) {
        this.act();
    }
    error(error) {
        if (error)
            this.div.firstElementChild.classList.add("error");
        else
            this.div.firstElementChild.classList.remove("error");
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
        this.div.appendChild(input);
        this.search = new google.maps.places.SearchBox(input);
        const instance = this;
        input.addEventListener('input', (e) => instance.searchChanged(e));
        map.addListener('bounds_changed', () => instance.search.setBounds(map.getBounds()));
        this.search.addListener('places_changed', () => instance.locationChanged());
        SearchBar.getPacContainer().addClass("hidden");
    }
    searchChanged(e) {
        this.dosearch += 1;
        this.checkOpenClose();
        setTimeout(() => {
            this.dosearch -= 1;
            if (this.dosearch == 0)
                this.findUsers(this.div.firstChild);
        }, 120);
    }
    checkOpenClose(tries = 4) {
        const container = SearchBar.getPacContainer();
        const instance = this;
        if (container.children().length == 0)
            container.addClass("hidden");
        else
            container.removeClass("hidden");
        if (tries > 0) {
            setTimeout(() => instance.checkOpenClose(tries - 1), 25);
        }
    }
    findUsers(input) {
        if (input.value.length == 0)
            this.updateUsers([]);
        else
            Sockets.findUsers(input.value, 3);
    }
    updateUsers(users) {
        this.cleanUsers();
        this.users = users;
        this.users.forEach(user => {
            const pac = SearchBar.generatePacUserItem(user);
            SearchBar.getPacContainer().prepend(pac);
        });
        this.checkOpenClose();
    }
    cleanUsers() {
        this.users = [];
        $(".pac-user-item").remove();
    }
    static getPacContainer() {
        return $(".pac-container");
    }
    static generatePacUserItem(user) {
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
        el.addEventListener("click", () => {
            //if no subscription
            Sockets.manageSubscription(user._id, true);
            console.log(user);
            //also color user icon and request locations for it etc...
            //hide search thingy
            //if subscription
            //only show nodes of the user
        });
        el.appendChild(icon);
        el.appendChild(name);
        el.appendChild(email);
        return el;
    }
    locationChanged() {
        const instance = this;
        const places = this.search.getPlaces();
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
