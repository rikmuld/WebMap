class SimpleControl {
    el: HTMLElement
    map: google.maps.Map

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string, mainElement: string = "div") {
        const instance = this

        this.map = map

        this.el = document.createElement(mainElement)
        this.el.id = id

        this.el.addEventListener<"click">("click", function (this: HTMLDivElement, event: MouseEvent) {
            instance.click(this, event)
        })

        this.map.controls[position].push(this.el)
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
            this.el.classList.add("active") 
            this.childs.forEach(child => child.el.classList.add("active"))
        }
        else {
            this.el.classList.remove("active") 
            this.childs.forEach(child => child.el.classList.remove("active"))
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

        this.el.appendChild(img)
    }

    act() {
        getPosition(position => this.map.setCenter(toLatlon(position)))
    }

    click(div: HTMLDivElement, ev?: MouseEvent): any {
        this.act()
    }

    error(error: boolean) {
        if (error) this.el.firstElementChild.classList.add("error")
        else this.el.firstElementChild.classList.remove("error")
    }
}

class Logout extends SimpleControl {
    constructor(map: google.maps.Map, position: google.maps.ControlPosition) {
        super(map, position, 'userLogout', 'a')

        const img = document.createElement('img')
        img.src = user.icon

        this.el.setAttribute("href", "/logout")
        this.el.appendChild(img)
    }
}

class SearchBar extends SimpleControl {
    search: google.maps.places.SearchBox
    markers: google.maps.Marker[] = []
    dosearch: number = 0 
    users: Tables.User[] = []

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string) {
        super(map, position, id)

        const input = document.createElement('input')
        input.placeholder = "Search for places, markers, users, tags..."

        this.el.appendChild(input)
        this.search = new google.maps.places.SearchBox(input)

        const instance: SearchBar = this

        input.addEventListener('input', (e) => instance.searchChanged(e))

        map.addListener('bounds_changed', () => instance.search.setBounds(map.getBounds()))
        this.search.addListener('places_changed', () => instance.locationChanged())
    }

    searchChanged(e: Event) {
        this.dosearch += 1

        this.checkOpenClose()
        setTimeout(() => {
            this.dosearch -= 1
            if(this.dosearch == 0) this.findUsers(this.el.firstChild as HTMLInputElement)
        }, 120)
    }

    checkOpenClose(tries: number = 4){
        const container = SearchBar.getPacContainer()
        const instance = this

        if(container.children().length == 0) container.addClass("hidden")
        else container.removeClass("hidden")
        
        if(tries > 0) {
            setTimeout(() => instance.checkOpenClose(tries - 1), 25)
        }
    }

    findUsers(input: HTMLInputElement) {
        if(input.value.length == 0) this.updateUsers([])
        else Sockets.findUsers(input.value, 3)
    }

    updateUsers(users: Tables.User[]) {
        this.cleanUsers()
        this.users = users
        this.users.forEach(user => {
            const pac = SearchBar.generatePacUserItem(user)
            SearchBar.getPacContainer().prepend(pac)
        })
        this.checkOpenClose()
    }

    cleanUsers() {
        this.users = []
        $(".pac-user-item").remove()
    }

    static getPacContainer():any {
        return $(".pac-container")
    }

    static generatePacUserItem(user: Tables.User): HTMLDivElement {
        const el = document.createElement("div")
        el.classList.add("pac-item")
        el.classList.add("pac-user-item")

        const email = document.createElement("span")
        email.innerText = user.id

        const name = document.createElement("span")
        name.innerText = user.name
        name.classList.add("pac-item-query")

        const icon = document.createElement("span")
        icon.classList.add("pac-icon")
        icon.classList.add("pac-icon-user")     

        el.addEventListener("click", () => {
            //if no subscription
            Sockets.manageSubscription(user._id, true)
            console.log(user)
            //also color user icon and request locations for it etc...
            //hide search thingy

            //if subscription
            //only show nodes of the user
        })

        el.appendChild(icon)
        el.appendChild(name)
        el.appendChild(email)   

        return el
    }

    locationChanged() {
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