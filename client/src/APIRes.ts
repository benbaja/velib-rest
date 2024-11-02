import { FeatureCollection } from "geojson"

interface ApiData {
    name: string
    latitude: number
    longitude: number
    itinerary?: FeatureCollection
    walkingDistance?: string
    suitableBikes?: number
    numberOfDocks?: number
    docks: string[] 
}

export type {ApiData}