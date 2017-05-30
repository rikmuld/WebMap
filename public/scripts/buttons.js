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
    constructor(map, position, id, loc) {
        super(map, position, id);
        this.location = loc;
    }
    click(div, ev) {
        getPosition(pos => placeMarker(this.map, toLatlon(pos)));
        this.location.act();
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
        this.div.firstElementChild.classList.remove("error");
        getPosition(position => this.map.setCenter(toLatlon(position)), () => {
            this.div.firstElementChild.classList.add("error");
        });
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
        if (places.length == 0) {
            return;
        }
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            this.markers.push(new google.maps.Marker({
                map: this.map,
                icon: icon,
                title: place.name,
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
