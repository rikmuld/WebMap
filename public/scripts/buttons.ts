class SimpleControl {
    div: HTMLDivElement
    map: google.maps.Map

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string) {
        const instance = this

        this.map = map

        this.div = document.createElement('div')
        this.div.id = id

        this.div.addEventListener<"click">("click", function (this: HTMLDivElement, event: MouseEvent) {
            instance.click(this, event)
        })

        this.map.controls[position].push(this.div)
    }

    click(div: HTMLDivElement, ev: MouseEvent) { }
}

class AddLocation extends SimpleControl {
    location: LocationControl

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string, loc: LocationControl) {
        super(map, position, id)
        this.location = loc
    }

    click(div: HTMLDivElement, ev?: MouseEvent): any {
        getPosition(pos => {
            const latlng = toLatlon(pos)

            placeMarker(this.map, latlng)
            Sockets.addLocation(pos.coords.latitude, pos.coords.longitude)
        })

        this.location.act()
    }
}

class LocationControl extends SimpleControl {
    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string) {
        super(map, position, id)

        const img = document.createElement('img')
        img.src = "/icons/location.png"

        this.div.appendChild(img)
    }

    act() {
        this.div.firstElementChild.classList.remove("error")
        getPosition(position => this.map.setCenter(toLatlon(position)), () => {
            this.div.firstElementChild.classList.add("error")
        })
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

        const instance: SearchBar = this

        map.addListener('bounds_changed', () => instance.search.setBounds(map.getBounds()))
        this.search.addListener('places_changed', () => instance.searchChanged())
    }

    searchChanged() {
        const instance = this
        const places = this.search.getPlaces();

        this.markers.forEach(marker => marker.setMap(null))
        this.markers = []

        const bounds = new google.maps.LatLngBounds();

        places.forEach(place => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return
            }

            this.markers.push(new google.maps.Marker({
                map: this.map,
                position: place.geometry.location
            }))

            if (place.geometry.viewport) bounds.union(place.geometry.viewport)
            else bounds.extend(place.geometry.location)
        })

        this.map.fitBounds(bounds)
    }
}