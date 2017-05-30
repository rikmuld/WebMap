//todo next: for small devices check length of screen and if less than search bar width plus 100px or so, than adapt search bar to go to the end - 10px

const MAP = "map";
const SEARCH_BOX = "searchbar";
const LOCATION_BOX = "myLocation";
const ADD_ICON = "addIcon";
const STYLE = [
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "color": "#ffc023"
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "color": "#98d8ee"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a1e3f8"
            }
        ]
    }
];
let webMap;
let marker;
function initMap() {
    const UTWENTE = new google.maps.LatLng(52.241033, 6.852413);
    const TOKYO = new google.maps.LatLng(35.652832, 139.839478);
    webMap = new google.maps.Map(document.getElementById(MAP), {
        center: TOKYO,
        zoom: 12,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        styles: STYLE,
        panControl: false,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        mapTypeControl: false,
        overviewMapControl: false
    });
    const locationControl = new LocationControl(webMap, google.maps.ControlPosition.LEFT_TOP, LOCATION_BOX);
    const serachbar = new SearchBar(webMap, google.maps.ControlPosition.TOP_LEFT, SEARCH_BOX);

    const addLocation = new AddLocation(webMap, google.maps.ControlPosition.RIGHT_BOTTOM, ADD_ICON, locationControl);
    locationControl.act();
    // var mouseLatLng = webMap.addListener('click', function (e) {
    //     if (toggleButton.checked) {
    //         markerData.push(placeMarker(e.latLng, webMap)),
    //             console.log(markerData)
    //     }
    // })
}
function toLatlon(pos) {
    return new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
}

function placeMarker(map, latlng) {
    return new google.maps.Marker({
        position: latlng,
        map: map
    });
}
class SimpleControl {
    constructor(map, position, id) {
        const instance = this;
        this.map = map;
        this.div = document.createElement('div');
        this.div.id = id;
        this.div.addEventListener("click", function (event) {
            instance.click(this, event);
        });
        this.div.addEventListener('gesturestart', function (event) {
            event.preventDefault();
        }, false);
        webMap.controls[position].push(this.div);
    }
    click(div, ev) { }
}
class AddLocation extends SimpleControl {
    constructor(map, position, id, loc) {
        super(map, position, id);
        this.location = loc;
    }
    click(div, ev) {
        navigator.geolocation.getCurrentPosition(pos => placeMarker(this.map, toLatlon(pos)));
        this.location.act();
    }
}
class LocationControl extends SimpleControl {
    constructor(map, position, id) {
        super(map, position, id);
        const img = document.createElement('img');
        img.src = "http://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png";
        this.div.appendChild(img);
    }
    act() {
        if (navigator.geolocation) {
            this.div.firstElementChild.classList.remove("error");
            navigator.geolocation.getCurrentPosition(position => webMap.setCenter(toLatlon(position)));
        }
        else {
            this.div.firstElementChild.classList.add("error");
        }
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
