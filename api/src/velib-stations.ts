import { FeatureCollection, Feature } from "geojson"
import { BikeInfo, gpsCoord, StationBikes, StationStatus, VelibResParams } from "./velib-types"
import {getDistance, isPointWithinRadius} from 'geolib'

const reqInit: RequestInit = {
    method: "GET",
    cache: "no-store",
    mode: "cors",
    credentials: "include",
    headers: {
        "Host": "www.velib-metropole.fr",
        "accept": "*/*",
        "content-type": "application/json",
//        "authorization": `Basic ${process.env.VELIB_API_TOKEN}`,
        "user-agent": "Velib/1099 CFNetwork/1496.0.7 Darwin/23.5.0",
        "accept-language": "fr-FR,fr;q=0.9",
        "Connection": "keep-alive",
    }
}

class Station {
    public name: string
    public code: string
    public pos: gpsCoord
    public allBikes: BikeInfo[]
    public filteredBikes: BikeInfo[]
    public capacity: number
    public operative: boolean
    public walkingTime: number | undefined
    public itinerary: FeatureCollection | undefined
    public score: number
    public nbDocks: number
    private nbMBikes: number
    private nbEBikes: number

    constructor(status: StationStatus) {
        this.name = status.station.name
        this.code = status.station.code
        this.pos = status.station.gps
        this.score = 0
        this.allBikes = []
        this.filteredBikes = []
        this.capacity = status.nbDock + status.nbEDock
        this.operative = status.station.state == "Operative"
        this.nbMBikes = status.overflowActivation == "yes" ? status.nbBikeOverflow + status.nbBike : status.nbBike
        this.nbEBikes = status.overflowActivation == "yes" ? status.nbEBikeOverflow + status.nbEbike : status.nbEbike
        const freeDocks = status.nbFreeDock + status.nbFreeEDock
        this.nbDocks = status.overflowActivation == "yes" ? status.maxBikeOverflow - (status.nbBikeOverflow + status.nbEBikeOverflow) + freeDocks : freeDocks

    }

    public async getWalkingTime(startPos: gpsCoord) {
        const searchParams = new URLSearchParams({
            start: `${startPos.longitude},${startPos.latitude}`,
            end: `${this.pos.longitude},${this.pos.latitude}`
        }).toString()
        try {
            const osrRes = await fetch (`${process.env.ORS_API_URL}/ors/v2/directions/foot-walking?` + searchParams)
            const osrData = await osrRes.json() as FeatureCollection
            this.itinerary = osrData
            const walkTime = osrData.features.reduce((acc, feature) => acc + feature.properties?.summary.duration, 0)
            console.log(walkTime)
            this.walkingTime = walkTime
        } catch (err) {
            console.log(err)
        }
    }

    private async fetchBikes() {
        const bikeReqInit = {
            ...reqInit,
            method: "POST",
            body: JSON.stringify({disponibility: "yes", stationName: this.name})
        }
        const bikeReq = await fetch("https://www.velib-metropole.fr/api/secured/searchStation", bikeReqInit)
        const stationData = await bikeReq.json() as StationBikes[]
        return stationData[0].bikes ? stationData[0].bikes : []
    }

    public async filterBikes(bikeType: string, minRate = 1, maxLastRate = 720) {
        this.allBikes = await this.fetchBikes()
        this.filteredBikes = this.allBikes.filter(bike => {
            const isAvailable = bike.bikeStatus == "disponible"
            const lastRateHours = (Date.now() - Date.parse(bike.lastRateDate)) / 1000 / 60 / 60
            const lastRateWithinRange = lastRateHours < maxLastRate
            const isRateWithinRange = bike.bikeRate >= minRate
            const isType = (bikeType === "mBike") ? bike.bikeElectric === "no" :
               (bikeType === "eBike") ? bike.bikeElectric === "yes" : true
            return isAvailable && lastRateWithinRange && isRateWithinRange && isType
        })
    }

    public async fetchInfos(params: VelibResParams) {
        console.log(`Fetching infos for ${this.name}`)
        process.env.ORS_API_URL && await this.getWalkingTime(params.startPos)
        await this.filterBikes(params.bikeType, params.minRate, params.maxLastRate)
        await new Promise(resolve => setTimeout(resolve, 500))
        this.score = (params.bikeType == "docks" ? this.nbDocks : this.filteredBikes.length) 
            / Math.pow( this.walkingTime || getDistance(params.startPos, this.pos), params.weight )
    }

    public checkIfAvailable(type: string) {
        switch(type) {
            case "dock":
                return this.nbDocks > 0
                break
            case "bike":
                return (this.nbMBikes + this.nbEBikes) > 0
                break
            case "mBike":
                return this.nbMBikes > 0
                break
            case "eBike":
                return this.nbEBikes > 0
                break
            default:
                console.error("Invalid bike type given !")
                return false
        }
    }
}

class VelibRes {
    private filteredStations: Station[]
    private rejectedStations: Station[]
    private parameters: VelibResParams
    private perimeter: number

    constructor(params: VelibResParams) {
        this.parameters = params
        this.perimeter = 500 // in meters
        this.filteredStations = []
        this.rejectedStations = []
    }

    public async getStations() {
        while (this.filteredStations.length < 1) {
            await this.filterStations()
        }
        // order stations by rank
        return this.filteredStations
    }

    private async fetchAllStations() {
        const velibRes = await fetch('https://www.velib-metropole.fr/api/map/details?gpsTopLatitude=49.05546&gpsTopLongitude=2.662193&gpsBotLatitude=48.572554&gpsBotLongitude=1.898879&zoomLevel=1', reqInit)
        const allStations = await velibRes.json() as any as StationStatus[]
        console.log("fetched all stations!")
        return allStations.map((stationStatus) => new Station(stationStatus))
    }

    public async filterStations() { // set to PV in prod
        const allStations = await this.fetchAllStations()
        for (const station of allStations) {
            const isWithinDistance = isPointWithinRadius(station.pos, this.parameters.startPos, this.perimeter)
            const hasTypeAvailable = station.checkIfAvailable(this.parameters.bikeType)
            const notAlreadyFetched = this.rejectedStations.find(rejStation => rejStation.code == station.code) || this.filteredStations.find(filtStation => filtStation.code == station.code) ? false : true;
            if (isWithinDistance && station.operative && hasTypeAvailable && notAlreadyFetched) {
                await station.fetchInfos(this.parameters)
                this.filteredStations.push(station)
            } else {
                this.rejectedStations.push(station)
            }
        }
        return this.filteredStations
    }

    public async getBestStation() {
        const filteredStations = await this.filterStations()
        return filteredStations.reduce((acc: Station, station: Station) => station.score > acc.score ? station : acc)
    }
}

export {Station, VelibRes}