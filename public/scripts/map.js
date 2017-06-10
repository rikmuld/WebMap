//todo next: for small devices check length of screen and if less than search bar width plus 100px or so, than adapt search bar to go to the end - 10px
const MAP = "map";
const SEARCH_BOX = "searchbar";
const LOCATION_BOX = "myLocation";
const ADD_ICON = "addIcon";
//needs fix....
const LOGINSTYLE = [
    {
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "stylers": [
            {
                "color": "#fdbd54"
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "color": "#8fdabd"
            }
        ]
    },
    {
        "featureType": "road",
        "stylers": [
            {
                "color": "#ffd082"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#8fe5fb"
            }
        ]
    }
];
const STYLE = [
    {
        featureType: "road.highway",
        stylers: [
            { color: "#ffc023" },
            { visibility: "simplified" }
        ]
    }, {
        featureType: "water",
        stylers: [
            { color: "#98d8ee" }
        ]
    }, {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [
            { color: "#a1e3f8" }
        ]
    }, {
        featureType: "road.highway",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    }
];
let webMap;
let locationControl;
let serachbar;
let addLocation;
function initMap() {
    const UTWENTE = new google.maps.LatLng(52.241033, 6.852413);
    const TOKYO = new google.maps.LatLng(35.652832, 139.839478);
    const NEWYORK = new google.maps.LatLng(40.730610, -73.935242);
    webMap = new google.maps.Map(document.getElementById(MAP), {
        center: TOKYO,
        zoom: 14,
        zoomControl: user != null,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        styles: user == null ? LOGINSTYLE : STYLE,
        panControl: false,
        streetViewControl: user != null,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        mapTypeControl: false,
        overviewMapControl: false
    });
    if (user != null) {
        locationControl = new LocationControl(webMap, google.maps.ControlPosition.LEFT_TOP, LOCATION_BOX);
        serachbar = new SearchBar(webMap, google.maps.ControlPosition.TOP_LEFT, SEARCH_BOX);
        addLocation = new AddLocation(webMap, google.maps.ControlPosition.RIGHT_BOTTOM, ADD_ICON);
        const logout = new Logout(webMap, google.maps.ControlPosition.RIGHT_TOP);
        locationControl.act();
        Sockets.getLocations();
        user.subscriptions.forEach(s => Sockets.getLocationsFor(s));
    }
    else {
        placeMarker(webMap, mkLatLng(35.64864814406143, 139.80308532714844));
        placeMarker(webMap, mkLatLng(35.6907639509368, 139.8284912109375));
        placeMarker(webMap, mkLatLng(35.641115161539176, 139.8727798461914));
        placeMarker(webMap, mkLatLng(35.677796881563715, 139.9980926513672));
    }
}
function toLatlon(pos) {
    return new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
}
function mkLatLng(lat, lng) {
    return new google.maps.LatLng(lat, lng);
}
function placeMarker(map, latlng) {
    return new google.maps.Marker({
        position: latlng,
        map: map
    });
}
function createMarker(latlng) {
    console.log(latlng.lat() + ", " + latlng.lng());
    return new google.maps.Marker({
        position: latlng
    });
}
function createMarkers(locs) {
    return locs.map(l => createMarker(mkLatLng(l.lat, l.lng)));
}
function addLocations(locs) {
    locs.forEach(l => placeMarker(webMap, mkLatLng(l.lat, l.lng)));
}
function geoError() {
    locationControl.error(true);
    console.log("Geolocation is not available!");
}
function getPosition(callback, error) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            locationControl.error(false);
            callback(pos);
        }, geoError);
    }
    else
        geoError();
}
