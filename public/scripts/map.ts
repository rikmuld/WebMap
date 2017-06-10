//todo next: for small devices check length of screen and if less than search bar width plus 100px or so, than adapt search bar to go to the end - 10px

const MAP = "map"
const SEARCH_BOX = "searchbar"
const LOCATION_BOX = "myLocation"
const ADD_ICON = "addIcon"
const STYLE = [
    {
        featureType: "road.highway",
        stylers: [
            { color: "#ffd082" },
            { visibility: "simplified" }
        ]
    }, {
        featureType: "water",
        stylers: [
            { color: "#8fe5fb" }
        ]
    },
    
     {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [
            { color: "#8fe5fb" }
        ]
    }, {
        featureType: "road.highway",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    }
]

const marker = `M11.591,32.564c0,0 11.14,-14.605 11.14,-19.657c0,-6.148 -4.992,-11.139 -11.14,-11.139c-6.148,0 -11.14,4.991 -11.14,11.139c0,5.052 11.14,19.657
 11.14,19.657Zm0,-26.802c3.147,0 5.702,2.555 5.702,5.702c0,3.147 -2.555,5.702 -5.702,5.702c-3.147,0 -5.702,-2.555 -5.702,-5.702c0,-3.147 2.555,-5.702 5.702,-5.702Z`

const colors = [
  [231, 76, 60], 
  [26, 188, 156], 
  [241, 196, 15], 
  [46, 204, 113], 
  [230, 126, 34], 
  [52, 152, 219], 
  [155, 89, 182], 
  [236, 240, 241], 
  [52, 73, 94], 
  [149, 165, 166]
]

let webMap: google.maps.Map
let locationControl: LocationControl
let serachbar: SearchBar
let addLocation: AddLocation

function initMap() {
    const UTWENTE = new google.maps.LatLng(52.241033, 6.852413)
    const TOKYO = new google.maps.LatLng(35.652832, 139.839478)
    const NEWYORK = new google.maps.LatLng(40.730610, -73.935242)

    webMap = new google.maps.Map(document.getElementById(MAP), {
        center: TOKYO,
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        styles: STYLE,
        panControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        mapTypeControl: false,
        overviewMapControl: false
    })

    locationControl = new LocationControl(webMap, google.maps.ControlPosition.LEFT_TOP, LOCATION_BOX)
    serachbar = new SearchBar(webMap, google.maps.ControlPosition.TOP_LEFT, SEARCH_BOX)
    addLocation = new AddLocation(webMap, google.maps.ControlPosition.RIGHT_BOTTOM, ADD_ICON)
    
    const logout = new Logout(webMap, google.maps.ControlPosition.RIGHT_TOP)

    locationControl.act()
    
    Sockets.getLocations()
}

function toLatlon(pos: Position): google.maps.LatLng {
    return new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
}

function mkLatLng(lat: number, lng: number): google.maps.LatLng {
    return new google.maps.LatLng(lat, lng)
}

function createMarker(latlng: google.maps.LatLng, color: number): google.maps.Marker {
    return new google.maps.Marker({
        position: latlng,
        icon: {
          path: marker,
          fillColor: colorRGB(color),
          fillOpacity: 1,
          strokeWeight: 1,
          scale: 1.3,
          anchor: new google.maps.Point(11.4,33),
        }    
    })
}

function createMarkers(locs: Tables.Location[], color: number): google.maps.Marker[] {
    return locs.map(l => createMarker(mkLatLng(l.lat, l.lng), color))
}

function geoError() {
    locationControl.error(true)
    console.log("Geolocation is not available!")
}

function getPosition(callback: (pos: Position) => void, error?: () => void) {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            locationControl.error(false)
            callback(pos)
        }, geoError)
    } else geoError()
}

function colorRGB(color: number): string {
  return "rgb(" + colors[color][0] + "," + colors[color][1] + "," + colors[color][2] + ")"
}

function generateUserImg(user: Tables.User | Tables.UserPopulated, color: number = -1): HTMLElement {
  if(user.icon) {
      const img = document.createElement('img')
      img.src = user.icon

      if(color >= 0) img.setAttribute("style", "border: 4px solid " + colorRGB(color))
      return img
  } else {
      const img = document.createElement('div')
      const name = user.name.split(" ")

      img.classList.add("profileImageID")
      img.innerText = name[0][0] + name[name.length - 1][0]
      if(color >= 0) img.setAttribute("style", "background-color: " + colorRGB(color))
      return img
  }
}