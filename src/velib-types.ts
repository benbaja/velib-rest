interface gbfs {
    lastUpdatedOther: number
    ttl: number
    data: {
        en: {
            feeds: {name: string, url: string}[]
        }
    }
}

interface SingleStationStatus {
        station_id: number,
        num_bikes_available: number,
        numBikesAvailable: number,
        num_bikes_available_types: [{mechanical: number}, {ebike: number}],
        num_docks_available: number,
        numDocksAvailable: number,
        is_installed: number,
        is_returning: number,
        is_renting: number,
        last_reported: number,
        stationCode: string
}

interface StationsStatus {
    lastUpdatedOther: number
    ttl: number
    data: {
        stations: SingleStationStatus[]
    }
}

interface SingleStationInfo {
    station_id: number,
    stationCode: string,
    name: string,
    lat: number,
    lon: number,
    capacity: number,
    rental_methods?: string[]
}

interface StationsInformation {
    lastUpdatedOther: number
    ttl: number
    data: {
        stations: SingleStationInfo[]
    }
}

interface StationBikes {
    station: {
        gps: gpsCoord
        stationType: string
        state: string
        name: string
        code: string
        type: string
        dueDate: number
    }
    nbBike: number
    nbEbike: number
    nbFreeDock: number
    nbFreeEDock: number
    creditCard: "yes" | "no"
    nbDock: number
    nbEDock: number
    nbBikeOverflow: number
    kioskState: "yes" | "no"
    overflow: "yes" | "no"
    overflowActivation: "yes" | "no"
    maxBikeOverflow: number
    densityLevel: number
    bikes: {
        bikeBlockCause: string
        bikeElectric: "yes" | "no"
        bikeName: string
        bikeRate: 3
        bikeStatus: string
        dockPosition: string
        lastRateDate: string
        numberOfRates: number
        stationId: number
    }[]
    nbBikeBlockedToCollect: number
    nbBikeBlockedToFixInStation: number
    isAltitude: number
}

[{"maxBikeOverflow":27,"densityLevel":1,"bikes":[{"bikeBlockCause":"","bikeElectric":"yes","bikeName":"68903","bikeRate":3,"bikeStatus":"disponible","dockPosition":"6","lastRateDate":"2024-09-04T06:35:31Z","numberOfRates":2,"stationId":54000623}],"nbBikeBlockedToCollect":0,"nbBikeBlockedToFixInStation":0,"isAltitude":1}]

type gpsCoord = {latitude: number, longitude: number}

export type {SingleStationStatus, StationsStatus, SingleStationInfo, StationsInformation, StationBikes, gbfs, gpsCoord}