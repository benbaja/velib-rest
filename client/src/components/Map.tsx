import { AspectRatio } from '@mantine/core'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

interface mapProps {
}

const Map: React.FC<mapProps> = ({}) => {

    return (
        <>
            <AspectRatio ratio={16 / 9}>
                <MapContainer center={[48.86040280350408, 2.3364582290119023]} zoom={10} minZoom={10} maxZoom={16} scrollWheelZoom={true}>
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  />
                </MapContainer>
            </AspectRatio>
        </>
    )
}
  
export default Map