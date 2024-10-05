import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import * as geolib from 'geolib'
import { StationStatus, StationInfo, gpsCoord } from './velib-types';
import tls from 'tls'
import cron from 'node-cron'
import path from 'path'
import fs from 'fs'
import {mkdir} from 'fs/promises'
import { Readable } from 'stream'
import {finished} from 'stream/promises'
import { ReadableStream } from 'stream/web'

tls.DEFAULT_MIN_VERSION = 'TLSv1.3'

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

const fetchPBF = async () => {
    const geofabrikRes = await fetch("https://download.geofabrik.de/europe/france/ile-de-france-latest.osm.pbf")
    if (geofabrikRes.body) {
        if (!fs.existsSync("./osmfiles")) await mkdir("./osmfiles")
        const tempDest = path.resolve("./osmfiles", "ile-de-france-latest.osm.pbf.temp")
        const dest = tempDest.slice(0, -5)
        const fileStream = fs.createWriteStream(tempDest, { flags: 'wx' })
        await finished(Readable.fromWeb(geofabrikRes.body as ReadableStream<any>).pipe(fileStream))
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
        fs.renameSync(tempDest, dest)
    }
}

cron.schedule('0 0 * * *', () => {
    fetchPBF();
});

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

const fetchStationStatus = async (gpsCoord: gpsCoord, distance=500) => {
    const velibRes = await fetch('https://www.velib-metropole.fr/api/map/details?gpsTopLatitude=49.05546&gpsTopLongitude=2.662193&gpsBotLatitude=48.572554&gpsBotLongitude=1.898879&zoomLevel=1', mapReqInit)
    const velibData = await velibRes.json() as any as StationStatus[]
    return velibData.filter(station => {
        return geolib.isPointWithinRadius(station.station.gps, gpsCoord, distance)
    })

}

app.get('/', (req: Request, res: Response) => {
    fetchStationStatus({latitude: 48.82413881129852, longitude: 2.376952760541059}, 500).then((filtDic) => {
        res.json(filtDic)
    })
    
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});