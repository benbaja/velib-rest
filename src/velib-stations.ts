import { FeatureCollection } from "geojson"
import { BikeInfo, gpsCoord, StationBikes, StationStatus, VelibResParams } from "./velib-types"
import {isPointWithinRadius} from 'geolib'

const reqInit: RequestInit = {
    method: "GET",
    cache: "no-store",
    mode: "cors",
    credentials: "include",
    headers: {
        "Host": "www.velib-metropole.fr",
        "accept": "*/*",
        "content-type": "application/json",
        "authorization": `Basic ${process.env.VELIB_API_TOKEN}`,
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
    public walkingTime: number | undefined

    constructor(status: StationStatus) {
        this.name = status.station.name
        this.code = status.station.code
        this.pos = status.station.gps
        this.allBikes = []
        this.filteredBikes = []
        this.capacity = status.nbDock + status.nbEDock
    }

    public async getWalkingTime(startPos: gpsCoord) {
        const searchParams = new URLSearchParams({
            start: `${startPos.longitude},${startPos.latitude}`,
            end: `${this.pos.longitude},${this.pos.latitude}`
        }).toString()
        const osrRes = await fetch (`${process.env.ORS_API_URL}/ors/v2/directions/foot-walking?` + searchParams)
        const osrData = await osrRes.json() as FeatureCollection
        const walkTime = osrData.features.reduce((acc, feature) => acc + feature.properties?.summary.duration, 0)
        console.log(walkTime)
        this.walkingTime = walkTime
        return walkTime
    }

    private async fetchBikes() {
        const bikeReqInit = {
            ...reqInit,
            method: "POST",
            body: JSON.stringify({disponibility: "yes", stationName: this.name})
        }
        const bikeReq = await fetch("https://www.velib-metropole.fr/api/secured/searchStation", bikeReqInit)
        const stationData = await bikeReq.json() as StationBikes[]
        return stationData[0].bikes
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

    public async fetchInfos(parameters: VelibResParams) {
        console.log(`Fetching infos for ${this.name}`)
        await new Promise(resolve => setTimeout(resolve, 500))
        await this.getWalkingTime(parameters.startPos)
        await this.filterBikes(parameters.bikeType, parameters.minRate, parameters.maxLastRate)
        return true
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
        return allStations
    }

    private checkIfAvailable(station: StationStatus) {
        switch(this.parameters.bikeType) {
            case "dock":
                const freeDocks = station.nbFreeDock + station.nbFreeEDock
                if (station.overflowActivation == "yes") {
                    const freeOverflow = station.maxBikeOverflow - (station.nbBikeOverflow + station.nbEBikeOverflow)
                    return (freeDocks + freeOverflow) > 0
                } else {
                    return freeDocks > 0
                }
                break
            case "bike":
                return (station.nbBike + station.nbEbike) > 0
                break
            case "mBike":
                return station.nbBike > 0
                break
            case "eBike":
                return station.nbEbike > 0
                break
            default:
                console.error("Invalid bike type given !")
                return false
        }
    }

    public async filterStations() { // set to PV in prod
        const allStations = await this.fetchAllStations()
        for (const stationStatus of allStations) {
            const isWithinDistance = isPointWithinRadius(stationStatus.station.gps, this.parameters.startPos, this.perimeter)
            const isOperative = stationStatus.station.state == "Operative"
            const hasTypeAvailable = this.checkIfAvailable(stationStatus)
            const notAlreadyFetched = this.rejectedStations.find(rejStation => rejStation.code == stationStatus.station.code) || this.filteredStations.find(filtStation => filtStation.code == stationStatus.station.code) ? false : true;
            if (isWithinDistance && isOperative && hasTypeAvailable && notAlreadyFetched) {
                const station = new Station(stationStatus)
                await station.fetchInfos(this.parameters)
                this.filteredStations.push(station)
            }
        }
        return this.filteredStations
    }
}

export {Station, VelibRes}