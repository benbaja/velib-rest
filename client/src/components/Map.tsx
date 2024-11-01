import { AspectRatio } from '@mantine/core'
import { ApiData } from "../APIRes"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { LatLngExpression } from 'leaflet'

interface mapProps {
    geoLoc: undefined | {lat: number, lon: number}
    results: undefined | ApiData
}

const Map: React.FC<mapProps> = ({geoLoc, results}) => {
    const [ mapCenter, setMapCenter ] = useState<LatLngExpression>(
        geoLoc ? [geoLoc.lat, geoLoc.lon] : [48.86040280350408, 2.3364582290119023]
    )
    const [ mapZoom, setMapZoom ] = useState(geoLoc ? 15 : 10)
    useEffect(() => {
        if (geoLoc) {
            setMapCenter([geoLoc.lat, geoLoc.lon])
            setMapZoom(15)
        }
    }, [results])
    return (
        <>
            <AspectRatio ratio={16 / 9}>
                <MapContainer center={mapCenter} zoom={mapZoom} minZoom={10} maxZoom={16} scrollWheelZoom={true}>
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  />
                  {geoLoc && <Marker position={[geoLoc.lat, geoLoc.lon]}></Marker>}
                  {results && <Marker position={[results.latitude, results.longitude]}></Marker>}
                </MapContainer>
            </AspectRatio>
        </>
    )
}
  
export default Map