import { ApiData } from "../APIRes"
import { TileLayer, Marker, Tooltip } from 'react-leaflet'
import { useMap } from 'react-leaflet/hooks'
import { useEffect, useState } from 'react'

interface mapProps {
    geoLoc: undefined | {lat: number, lon: number}
    results: undefined | ApiData
}

interface markerParams {
    class: "origin" | "destination" | "station"
    position: [number, number]
    name?: string
    number?: number 
    type?: "bike" | "eBike" | "mBike" | "park"
}

const Map: React.FC<mapProps> = ({geoLoc, results}) => {
    const map = useMap()
    useEffect(() => {
        geoLoc && map.setView([geoLoc.lat, geoLoc.lon], 15)
        
    }, [geoLoc])

    const renderMarker = (params: markerParams) => {

        return (
            <Marker position={params.position}>
                <Tooltip>{params.class}</Tooltip>
            </Marker>
        )
    }

    return (
        <>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
            {geoLoc && renderMarker({position:[geoLoc.lat, geoLoc.lon], class:"origin"})}
            {results && renderMarker({position:[results.latitude, results.longitude], class:"destination"})}
        </>
    )
}
  
export default Map