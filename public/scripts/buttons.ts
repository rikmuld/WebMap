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
        Subscriptions.addLocation(user._id, pos)
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

class SideNav extends SimpleControl {
    isOpen: boolean = false

    constructor(map: google.maps.Map, position: google.maps.ControlPosition) {
        super(map, position, 'hamburger', 'div')

        const hamburger = document.createElement("span")
        hamburger.innerText = "\u2630"
        this.el.appendChild(hamburger)
    }

    click(div: HTMLDivElement, ev: MouseEvent) { 
        if (this.isOpen) this.close()
        else this.open() 
    }

    open() {
        document.getElementById("mySubscriptions").style.width = "500px";
        this.isOpen = true
    }

    close() {
        document.getElementById("mySubscriptions").style.width = "0";
        this.isOpen = false
        serachbar.userSearch.value = ""
    }
}

class Logout extends SimpleControl {
    constructor(map: google.maps.Map, position: google.maps.ControlPosition) {
        super(map, position, 'userLogout', 'a')

        this.el.setAttribute("href", "/logout")
        this.el.appendChild(generateUserImg(user, 0))
        this.el.classList.add("user")
    }
}

class SubscriptionIcon extends SimpleControl {
    user: Tables.UserPopulated
    markers: google.maps.Marker[]
    hidden: boolean = false
    color: number

    constructor(map: google.maps.Map, user: Tables.UserPopulated, color: number) {
        super(map, google.maps.ControlPosition.LEFT_BOTTOM, user._id)

        this.user = user
        this.color = color

        const fade = document.createElement('div')
        fade.classList.add("hider")

        this.el.appendChild(generateUserImg(user, color))
        this.el.appendChild(fade)
        this.el.classList.add("user")
        this.el.classList.add("subscription")

        this.markers = createMarkers(user.locations, color)
        this.show()
    }

    show() {
        this.hidden = false
        this.markers.forEach(m => m.setMap(this.map))
        this.el.classList.remove("hidden")
    }

    hide() {
        this.hidden = true
        this.markers.forEach(m => m.setMap(null))
        this.el.classList.add("hidden")
    }

    addLocation(latlng: google.maps.LatLng) {
        const marker = createMarker(latlng, this.color)
        this.markers.push(marker)
        marker.setMap(this.map)
        Sockets.addLocation(latlng.lat(), latlng.lng())
    }

    click() {
        if(this.hidden) this.show()
        else this.hide()
    }
}

class SearchBar extends SimpleControl {
    search: google.maps.places.SearchBox
    markers: google.maps.Marker[] = []
    dosearch: number = 0 
    users: Tables.User[] = []
    userSearch: HTMLInputElement

    constructor(map: google.maps.Map, position: google.maps.ControlPosition, id: string) {
        super(map, position, id)

        const input = document.createElement('input')
        input.placeholder = "Search for places, markers, users, tags..."

        this.el.appendChild(input)
        this.search = new google.maps.places.SearchBox(input)

        this.userSearch = $("#NavSearch").get()[0]

        const instance: SearchBar = this

        this.userSearch.addEventListener('input', (e) => instance.userSearchChanged(e))
        input.addEventListener('input', (e) => instance.searchChanged(e))
        input.addEventListener('focus', e => {
            if(instance.users.length > 0) instance.getPacContainer().addClass("show")
        })
        input.addEventListener('blur', e => {
            setTimeout(() => instance.getPacContainer().removeClass("show"), 100)
        })

        map.addListener('bounds_changed', () => instance.search.setBounds(map.getBounds()))
        this.search.addListener('places_changed', () => instance.locationChanged())

        google.maps.event.addDomListener(this.search, 'keydown', (e:KeyboardEvent) => {
            if(e.keyCode != 65) e.preventDefault()
        })
    }

    searchChanged(e: Event) {
        this.dosearch += 1

        setTimeout(() => {
            this.dosearch -= 1
            if(this.dosearch == 0) this.findUsers(this.el.firstChild as HTMLInputElement, !sideNav.isOpen)
        }, 120)
    }

    userSearchChanged(e: Event) {
        this.findUsers(this.userSearch, !sideNav.isOpen)
    }


    findUsers(input: HTMLInputElement, subscriptions: boolean) {
        if(input.value.length == 0) this.updateUsers([])
        else if(subscriptions) Sockets.findUsers(input.value, 3) //change to only search in subscriptions
        else Sockets.findUsers(input.value, 10)
    }

    updateUsers(users: Tables.User[]) {
        this.cleanUsers()
        this.users = users
        this.users.forEach(user => {
            if(sideNav.isOpen){
                const pac = this.generateSubscriptionElements(user)
                this.getUserContainer().append(pac)
            } else {
                const pac = this.generatePacUserItem(user)
                this.getPacContainer().prepend(pac) 
            }
        })
        if(this.users.length > 0) this.getPacContainer().addClass("show")
        else this.getPacContainer().removeClass("show")
    }

    cleanUsers() {
        this.users = []
        $(".pac-user-item").remove()
        this.getUserContainer().html("")
    }

    getPacContainer():any {
        return $(".pac-container")
    }

    getUserContainer():any {
        return $(".people")
    }

    generatePacUserItem(user: Tables.User): HTMLDivElement {
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

        $(el).click(() => {
            const input = this.el.firstElementChild as HTMLInputElement

            input.value = user.id
            $(input).focus()
            $(input).blur()

            this.updateUsers([])

            //set subscription user to state active
            //however for now:
            Sockets.manageSubscription(user._id, true)
        })

        el.appendChild(icon)
        el.appendChild(name)
        el.appendChild(email)   

        return el
    }

      generateSubscriptionElements(user: Tables.User): HTMLDivElement {
        const el = document.createElement("div")
        el.classList.add("person")
        
        const img = document.createElement("div")
        img.classList.add("user")
        img.classList.add("yAlign")

        const info = document.createElement("div")
        info.classList.add("text")
        info.classList.add("yAlign")

        const usname = document.createElement("div")
        usname.innerText = user.name
        usname.setAttribute("id", "Name")

        const subscribe = document.createElement("div")
        subscribe.classList.add("subscribe")

        const subbtn = document.createElement("div")
        subbtn.classList.add("subbtn")

        const subtext = document.createElement("p")
        subtext.classList.add("buttonText")
        subtext.classList.add("yAlign")
        subtext.innerText = "SUBSCRIBE"
        //add subscription text handling 
        //if user is already subscribed - show subscribed
        //else show subscribe

        const visibility = document.createElement("div")
        visibility.classList.add("visibility")

        const visibilityimg = document.createElement("img")
        visibilityimg.setAttribute("id", "visibilityimg")
        visibilityimg.setAttribute("src", "icons/OpenEye@2x.png")

    
        const number = document.createElement("div")
        number.innerText = Subscriptions.getLocations(user._id).length.toString()
        number.setAttribute("id", "Number")

        img.appendChild(generateUserImg(user, Subscriptions.subIndex(user._id)))

        info.appendChild(usname)
        info.appendChild(number)

        subbtn.appendChild(subtext)
        subscribe.appendChild(subbtn)


        visibility.appendChild(visibilityimg)

        el.appendChild(img)
        el.appendChild(info)
        el.appendChild(subscribe)
        el.appendChild(visibility)

        return el
    }

    locationChanged() {
        const instance = this
        const places = this.search.getPlaces();

        this.searchChanged(null)

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