interface ApiData {
    name: string
    latitude: number
    longitude: number
    walkingDistance?: string
    suitableBikes?: number
    numberOfDocks?: number
    docks: string[] 
}

export type {ApiData}