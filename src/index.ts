import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import {VelibRes, Station} from './velib-stations'
import tls from 'tls'
import cron from 'node-cron'
import path from 'path'
import fs from 'fs'
import {mkdir} from 'fs/promises'
import { Readable } from 'stream'
import {finished} from 'stream/promises'
import { ReadableStream } from 'stream/web'
import { BikeInfo } from './velib-types';

tls.DEFAULT_MIN_VERSION = 'TLSv1.3'

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

interface tempResults {
    name: string
    walkDist: number | undefined
    bikes: BikeInfo[]
}

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

app.get('/', (req: Request, res: Response) => {
    const params = {
        startPos: {latitude: 48.82413881129852, longitude: 2.376952760541059},
        minRate: 3,
        maxLastRate: 72,
        bikeType: "eBike",
        maxWalkTime: 15
    }
    const velibs = new VelibRes(params)
    velibs.filterStations().then((stations: Station[]) => {
        const result: tempResults[] = []
        stations.forEach(station => {
            result.push({name: station.name, walkDist: station.walkingTime ,bikes: station.filteredBikes})
        })
        res.json(result)
    })
    
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});