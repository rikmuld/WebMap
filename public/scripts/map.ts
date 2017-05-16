const MAP = "map"
const SEARCH_BOX = "searchbar"
const LOCATION_BOX = "myLocation"
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
]

let webMap: google.maps.Map

function initMap() {
    const UTWENTE = new google.maps.LatLng(52.241033, 6.852413)

    webMap = new google.maps.Map(document.getElementById(MAP), {
        center: UTWENTE,
        zoom: 16,
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
    })

    const locationControl = new LocationControl(webMap, google.maps.ControlPosition.LEFT_TOP, LOCATION_BOX)
    locationControl.act()

    const serachbar = new SearchBar(webMap, google.maps.ControlPosition.TOP_LEFT, SEARCH_BOX)
}

function toLatlon(pos: Position): google.maps.LatLng {
    return new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
}

class SimpleControl {
    div: HTMLDivElement
    map: google.maps.Map

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string) {
        const instance = this

        this.map = map

        this.div = document.createElement('div')
        this.div.addEventListener<"click">("click", function (this: HTMLDivElement, event: MouseEvent) {
            instance.click(this, event)
        })
        this.div.id = id

        webMap.controls[position].push(this.div)
    }

    click(div: HTMLDivElement, ev: MouseEvent) { }
}

class LocationControl extends SimpleControl {
    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string) {
        super(map, position, id)

        const img = document.createElement('img')
        img.src = "http://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png"

        this.div.appendChild(img)
    }

    act() {
        if (navigator.geolocation) {
            this.div.firstElementChild.classList.remove("error")
            navigator.geolocation.getCurrentPosition(position => webMap.setCenter(toLatlon(position)))
        } else {
            this.div.firstElementChild.classList.add("error")
        }
    }

    click(div: HTMLDivElement, ev?: MouseEvent): any {
        this.act()
    }

    error(error: boolean) {
        if (error) this.div.firstElementChild.classList.add("error")
        else this.div.firstElementChild.classList.remove("error")
    }
}

class SearchBar extends SimpleControl {
    search: google.maps.places.SearchBox
    markers: google.maps.Marker[] = []

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string) {
        super(map, position, id)

        const input = document.createElement('input')
        input.placeholder = "Search for places, markers, users, tags..."

        this.div.appendChild(input)
        this.search = new google.maps.places.SearchBox(input)

        const instance:SearchBar = this

        map.addListener('bounds_changed', () => instance.search.setBounds(map.getBounds()))
        this.search.addListener('places_changed', () => instance.searchChanged())
    }

    searchChanged() {
        const instance = this
        const places = this.search.getPlaces();

        if (places.length == 0) {
            return;
        }

        this.markers.forEach(marker => marker.setMap(null))
        this.markers = []

        const bounds = new google.maps.LatLngBounds();
        
        places.forEach(place => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return
            }

            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            }

            this.markers.push(new google.maps.Marker({
                map: this.map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }))

            if (place.geometry.viewport) bounds.union(place.geometry.viewport)
            else bounds.extend(place.geometry.location)
        })
        
        this.map.fitBounds(bounds)
    }
}