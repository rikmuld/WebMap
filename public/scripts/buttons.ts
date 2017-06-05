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
    active: boolean = false
    main: boolean = false
    childs: SimpleControl[] = []

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string, main: boolean = true) {
        super(map, position, id)

        this.main = main

        if(main) { 
            map.addListener('click', e => {
                if (this.active) {
                    this.addLocation(e.latLng)
                    this.desctopClick()
                }
            })
            this.childs.push(new AddLocation(map, position, "atCurrent", false))
        }
    }

    click(div: HTMLDivElement, ev?: MouseEvent): any {
        if(!this.main) this.mobileClick()
        else this.desctopClick()
    }

    private mobileClick() {
        getPosition(pos => {
            const latlng = toLatlon(pos)

            this.addLocation(latlng)
            this.map.setCenter(latlng)
            addLocation.click(null)
        })
    }

    private desctopClick() {
        this.active = !this.active
        
        if(this.active) {
            this.div.classList.add("active") 
            this.childs.forEach(child => child.div.classList.add("active"))
        }
        else {
            this.div.classList.remove("active") 
            this.childs.forEach(child => child.div.classList.remove("active"))
        } 
    }

    private addLocation(pos: google.maps.LatLng){
        placeMarker(this.map, pos)
        Sockets.addLocation(pos.lat(), pos.lng())
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
        getPosition(position => this.map.setCenter(toLatlon(position)))
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