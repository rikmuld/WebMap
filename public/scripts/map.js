const MAP = "map";
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
function initMap() {
    const UTWENTE = new google.maps.LatLng(52.241033, 6.852413);
    webMap = new google.maps.Map(document.getElementById(MAP), {
        center: UTWENTE,
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        styles: STYLE,
        panControl: false,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        mapTypeControl: false,
        overviewMapControl: false
    });
    const locationControl = new LocationControl(webMap, google.maps.ControlPosition.LEFT_TOP);
    locationControl.act();
}
function toLatlon(pos) {
    return new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
}
class SimpleControl {
    constructor(map, position) {
        const instance = this;
        this.div = document.createElement('div');
        this.div.addEventListener("click", function (event) {
            instance.click(this, event);
        });
        webMap.controls[position].push(this.div);
    }
}
class LocationControl extends SimpleControl {
    constructor(map, position) {
        super(map, position);
        const controlUI = document.createElement('div');
        controlUI.setAttribute("id", "myLocation");
        this.div.appendChild(controlUI);
        const img = document.createElement('img');
        img.src = "http://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png";
        controlUI.appendChild(img);
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
