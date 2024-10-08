import { BikeInfo, gpsCoord, StationStatus, VelibResParams } from "./velib-types"
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
    public mBikes: BikeInfo[]
    public eBikes: BikeInfo[]
    public capacity: number
    public walkingTime: number | undefined

    constructor(status: StationStatus) {
        this.name = status.station.name
        this.code = status.station.code
        this.pos = status.station.gps
        this.mBikes = []
        this.eBikes = []
        this.capacity = status.nbDock + status.nbEDock
    }

    private fetchBikes () {
        const bikeReqInit = {
            ...reqInit,
            method: "POST",
            body: JSON.stringify({disponibility: "yes", stationName: this.name})
        }
        fetch("https://www.velib-metropole.fr/api/secured/searchStation", bikeReqInit).then( data => {
            console.log(data.status)
            data.json().then(jsonResult => {
                
            })

        })
    }
}

class VelibRes {
    private filteredStations: Station[]
    private parameters: VelibResParams
    private perimeter: number
    public allStations: Promise<StationStatus[]>
    public suitableBikes: BikeInfo[]

    constructor(params: VelibResParams) {
        this.parameters = params
        this.perimeter = 500 // in meters
        this.filteredStations = []
        this.suitableBikes = []
        this.allStations = this.fetchAllStations()
    }

    private async fetchAllStations() {
        const velibRes = await fetch('https://www.velib-metropole.fr/api/map/details?gpsTopLatitude=49.05546&gpsTopLongitude=2.662193&gpsBotLatitude=48.572554&gpsBotLongitude=1.898879&zoomLevel=1', reqInit)
        return await velibRes.json() as any as StationStatus[]
    }

    public async filterStations() {
        const allStations = await this.allStations
        return allStations.filter(station => {
            return isPointWithinRadius(station.station.gps, this.parameters.startPos, this.perimeter)
        })
    }
}

export default VelibRes