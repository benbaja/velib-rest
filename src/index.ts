import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import * as geolib from 'geolib'
import { StationStatus, StationInfo } from './velib-types';
import tls from 'tls'

tls.DEFAULT_MIN_VERSION = 'TLSv1.3'

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

const mapReqInit: RequestInit = {
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
        //"Accept-Encoding": "gzip"
    }
}

app.get('/', (req: Request, res: Response) => {
    fetch('https://www.velib-metropole.fr/api/map/details?gpsTopLatitude=49.05546&gpsTopLongitude=2.662193&gpsBotLatitude=48.572554&gpsBotLongitude=1.898879&zoomLevel=1', mapReqInit)
    .then(resp => resp.json())
    .then((velibData: StationStatus[]) => {
        const filtByCoord = velibData.filter(station => {
            return geolib.isPointWithinRadius(station.station.gps, {latitude: 48.82413881129852, longitude: 2.376952760541059}, 500)
        })
        res.json(filtByCoord)
    })
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});