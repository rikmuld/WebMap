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
        const instance = this;
        if (this.active)
            this.addClass("active");
        else {
            this.addClass("closing");
            this.el.classList.remove("active");
            setTimeout(() => {
                instance.removeClass("closing");
                instance.removeClass("active");
            }, 300);
        }
    }
    addClass(cls) {
        this.childs.forEach(child => child.el.classList.add(cls));
        this.el.classList.add(cls);
    }
    removeClass(cls) {
        this.childs.forEach(child => child.el.classList.remove(cls));
        this.el.classList.remove(cls);
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
        this.isOpen = true;
        $(".subscriptions").addClass("active");
    }
    close() {
        $(".subscriptions").addClass("closing");
        setTimeout(() => {
            serachbar.userSearch.value = "";
            serachbar.cleanUsers();
            $(".subscriptions").removeClass("active");
            $(".subscriptions").removeClass("closing");
        }, 500);
        this.isOpen = false;
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
        this.markers = [];
        this.hidden = false;
        this.animate = false;
        this.user = user;
        this.refresh(color);
    }
    show() {
        this.hidden = false;
        if (this.animate) {
            shuffle(this.markers).forEach((m, i) => setTimeout(() => {
                m.setAnimation(google.maps.Animation.DROP);
                m.setMap(this.map);
            }, 50 * i)); //make sure that if remove not continue, but timeouts inside each other to improve
            this.animate = false;
        }
        else {
            this.markers.forEach(m => m.setMap(this.map));
        }
        this.el.classList.remove("hidden");
    }
    hide() {
        this.hidden = true;
        this.markers.forEach(m => m.setMap(null));
        this.el.classList.add("hidden");
    }
    remove() {
        this.hide();
        this.el.remove();
        const index = this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].getArray().findIndex(s => s.id == this.user._id);
        this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].removeAt(index);
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
    generateIcon() {
        const fade = document.createElement('div');
        fade.classList.add("hider");
        this.el.appendChild(generateUserImg(this.user, this.color));
        this.el.appendChild(fade);
        this.el.classList.add("user");
        this.el.classList.add("subscription");
    }
    refresh(color) {
        this.color = color;
        this.el.innerHTML = "";
        this.markers.forEach(m => m.setMap(null));
        this.generateIcon();
        this.markers = createMarkers(this.user.locations, color);
        this.show();
    }
}
class SearchBar extends SimpleControl {
    constructor(map, position, id) {
        super(map, position, id);
        this.markers = [];
        this.dosearch = 0;
        this.users = [];
        const input = document.createElement('input');
        if (window.innerWidth > 420) {
            input.placeholder = "Search for places, markers, users, tags...";
        }
        else {
            input.placeholder = "Search...";
        }
        this.el.appendChild(input);
        this.search = new google.maps.places.SearchBox(input);
        this.userSearch = $("#NavSearch").get()[0];
        const instance = this;
        window.addEventListener("resize", (e) => {
            if (window.innerWidth > 420) {
                input.placeholder = "Search for places, markers, users, tags...";
            }
            else {
                input.placeholder = "Search...";
            }
            instance.updateUsers(this.getUsers());
        });
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
    getUsers() {
        return this.users;
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
        else if (subscriptions) {
            //Sockets.findUsers(input.value, 3) //change to only search in subscriptions
        }
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
                this.getUserContainer().append(document.createElement("hr"));
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
            Sockets.manageSubscription(user, true);
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
        const subscribe = document.createElement("div");
        subscribe.classList.add("subscribe");
        subscribe.classList.add("yAlign");
        const subbtn = document.createElement("div");
        subbtn.classList.add("subbtn");
        const subtext = document.createElement("p");
        subtext.classList.add("buttonText");
        const sub = Subscriptions.subIndex(user._id) > -1;
        if (sub)
            subbtn.classList.add("active");
        else
            subbtn.classList.remove("active");
        subtext.innerText = this.getSubscribeText(sub);
        $(subbtn).click(() => {
            const sub2 = Subscriptions.subIndex(user._id) > -1;
            if (sub2) {
                Sockets.manageSubscription(user, false);
                subbtn.classList.remove("active");
            }
            else {
                Sockets.manageSubscription(user, true);
                subbtn.classList.add("active");
            }
            subtext.innerText = this.getSubscribeText(sub2);
            this.updateUsers(this.getUsers());
        });
        const fullUser = Subscriptions.get(user._id);
        $(img).click(() => {
            if (fullUser.icon.hidden) {
                fullUser.icon.show();
                img.classList.remove("hidden");
            }
            else {
                fullUser.icon.hide();
                img.classList.add("hidden");
            }
        });
        if (fullUser && fullUser.icon.hidden) {
            img.classList.add("hidden");
        }
        const number = document.createElement("div");
        number.innerText = Subscriptions.getLocations(user._id).length.toString();
        number.setAttribute("id", "Number");
        const hider = document.createElement("div");
        hider.classList.add("hider");
        img.appendChild(generateUserImg(user, Subscriptions.subIndex(user._id)));
        img.appendChild(hider);
        info.appendChild(usname);
        info.appendChild(number);
        subbtn.appendChild(subtext);
        subscribe.appendChild(subbtn);
        el.appendChild(img);
        el.appendChild(info);
        el.appendChild(subscribe);
        return el;
    }
    getSubscribeText(sub) {
        if (window.innerWidth < 350) {
            return "S";
        }
        else if (sub) {
            return "SUBSCRIBED";
        }
        else {
            return "SUBSCRIBE";
        }
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
