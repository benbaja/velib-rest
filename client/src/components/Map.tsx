import { ApiData } from "../APIRes"
import { TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'
import { useMap } from 'react-leaflet/hooks'
import { useEffect, useState } from 'react'
import './Map.css'
import { divIcon } from 'leaflet'
import ReactDOMServer from 'react-dom/server';
import { FaWalking } from "react-icons/fa"
import { MdElectricBike, MdLocalParking, MdPedalBike } from 'react-icons/md';

interface mapProps {
    geoLoc: undefined | {lat: number, lon: number}
    results: undefined | ApiData
    typeChoice: string
}

interface markerParams {
    iconHtml?: string
    color: string
    position: [number, number]
    name?: string
    number?: number 
}

const Map: React.FC<mapProps> = ({geoLoc, results, typeChoice}) => {
    const map = useMap()
    const origIcon = ReactDOMServer.renderToString(<FaWalking size={16}/>)
    const [ destIcon, setDestIcon ] = useState(ReactDOMServer.renderToString(<MdPedalBike size={16}/>))

    useEffect(() => {
        if (typeChoice == "dock") {
            setDestIcon(ReactDOMServer.renderToString(<MdLocalParking size={16}/>))
        } else if (typeChoice == "eBike") {
            setDestIcon(ReactDOMServer.renderToString(<MdElectricBike size={16}/>))
        } else {
            setDestIcon(ReactDOMServer.renderToString(<MdPedalBike size={16}/>))
        }
    }, [results])

    useEffect(() => {
        geoLoc && map.setView([geoLoc.lat, geoLoc.lon], 15)
        
    }, [geoLoc])

    const renderMarker = (params: markerParams) => {
        const icon = divIcon({
            className: 'custom-div-icon',
            html: `<div style='background-color:${params.color};' class='marker-pin'></div><b>${params.iconHtml || params.number}</b>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -40]
        })
        if (params.position[0] && params.position[0]) {
            return (
                <Marker key={`${params.name}-marker`} position={params.position} icon={icon}>
                    <Popup key={`${params.name}-popup`}>{params.name}</Popup>
                </Marker>
            )
        }
    }

    return (
        <>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
            {geoLoc && renderMarker({position: [geoLoc.lat, geoLoc.lon], name: "Départ", color: "#2BDD66", iconHtml: origIcon})}
            {results && renderMarker({position:[results?.latitude, results?.longitude], name: results?.name, color: "#C91A25", iconHtml: destIcon})}
            {results && results?.itinerary && <GeoJSON key={results?.name} data={results?.itinerary} style={{ weight: 1 }}></GeoJSON>}

            {results && results?.otherStations?.map((station) => renderMarker({
                position: [station.latitude, station.longitude], 
                name: station.name, 
                color:"#09B8FF", 
                iconHtml: station.suitableBikes?.toString() || station.numberOfDocks?.toString() || ""})
            )}
        </>
    )
}
  
export default Map