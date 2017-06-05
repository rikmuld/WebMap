//todo next: for small devices check length of screen and if less than search bar width plus 100px or so, than adapt search bar to go to the end - 10px
const MAP = "map";
const SEARCH_BOX = "searchbar";
const LOCATION_BOX = "myLocation";
const ADD_ICON = "addIcon";
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
    Sockets.getLocations();
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
function mkLatLng(lat, lng) {
    return new google.maps.LatLng(lat, lng);
}
function placeMarker(map, latlng) {
    return new google.maps.Marker({
        position: latlng,
        map: map
    });
}
function addLocations(locs) {
    locs.forEach(l => placeMarker(webMap, mkLatLng(l.lat, l.lng)));
}
function getPosition(callback, error) {
    navigator.geolocation.getCurrentPosition(callback, () => {
        console.log("Geolocation is not available!");
        locationControl.error(true);
    });
}
