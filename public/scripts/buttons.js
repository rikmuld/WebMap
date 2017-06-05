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
    constructor(map, position, id) {
        super(map, position, id);
        this.active = false;
        map.addListener('click', e => {
            if (this.active) {
                this.addLocation(e.latLng);
                this.mobileClick();
            }
        });
    }
    click(div, ev) {
        if (isMobile())
            this.mobileClick();
        else
            this.desctopClick();
    }
    desctopClick() {
        getPosition(pos => {
            const latlng = toLatlon(pos);
            this.addLocation(latlng);
            this.map.setCenter(latlng);
        });
    }
    mobileClick() {
        this.active = !this.active;
        if (this.active)
            this.div.classList.add("active");
        else
            this.div.classList.remove("active");
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
        const input = document.createElement('input');
        input.placeholder = "Search for places, markers, users, tags...";
        this.div.appendChild(input);
        this.search = new google.maps.places.SearchBox(input);
        const instance = this;
        map.addListener('bounds_changed', () => instance.search.setBounds(map.getBounds()));
        this.search.addListener('places_changed', () => instance.searchChanged());
    }
    searchChanged() {
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
