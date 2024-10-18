type gpsCoord = {latitude: number, longitude: number}

interface StationInfo {
    gps: gpsCoord
    stationType: string
    state: string
    name: string
    code: string
    type: string
    dueDate: number
}

interface BikeInfo {
    bikeBlockCause: string
    bikeElectric: "yes" | "no"
    bikeName: string
    bikeRate: number
    bikeStatus: string
    dockPosition: string
    lastRateDate: string
    numberOfRates: number
    stationId: number
}

interface StationStatus {
    station: StationInfo
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
    nbEBikeOverflow: number
    densityLevel: number
    nbBikeBlockedToCollect: number
    nbBikeBlockedToFixInStation: number
    isAltitude: number
}

interface StationBikes extends StationStatus {
    bikes: BikeInfo[]
}

interface VelibResParams {
    startPos: gpsCoord
    minRate?: number
    maxLastRate?: number 
    bikeType: string
    maxWalkTime?: number
    weight?: number
}

export type {StationInfo, BikeInfo, StationStatus, StationBikes, gpsCoord, VelibResParams}