import express, { Express, Request, Response , Application, NextFunction } from 'express';
import dotenv from 'dotenv';
import {VelibRes, Station} from './velib-stations'
import tls from 'tls'
import cron from 'node-cron'
import cors from 'cors'
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
app.use(cors())
const port = 8000;


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
    res.json("")
});

const checkQueryParams = (req: Request, res: Response, next: NextFunction) => {
    if (!(req.query.startLat && req.query.startLon)) {
        res.status(400)
        res.json({error: "Missing GPS coordinates"})
        return
    }
    const startLat = parseFloat(req.query.startLat as string)
    const startLon = parseFloat(req.query.startLon as string)
    const latWithinBoundaries = 48.572554 < startLat && startLat < 49.05546
    const lonWithinBoundaries = 1.898879 < startLon && startLon < 2.662193
    if (!(latWithinBoundaries && lonWithinBoundaries)) {
        res.status(400)
        res.json({error: "GPS coordinates out of boundary"})
        return
    }

    const validReqType = ['bike', 'eBike', 'mBike', 'dock'].includes(req.query.reqType as string)
    if (!(req.query.reqType && validReqType)) {
        console.log(req.query.reqType)
        res.status(400)
        res.json({error: "Invalid request type ('bike' | 'eBike' | 'mBike' | 'dock')"})
        return
    }
    const minRate = parseInt(req.query.minRate as string)
    const minRateWithinRange = 0 < minRate && minRate < 4
    if (req.query.minRate && !minRateWithinRange) {
        res.status(400)
        res.json({error: "Minimum bike rate out of range (1 to 3 stars)"})
        return
    }

    const maxLastRate = parseInt(req.query.maxLastRate as string)
    const maxLastRateWithinRange = 0 < maxLastRate && maxLastRate < 720
    if (req.query.maxLastRate && !maxLastRateWithinRange) {
        res.status(400)
        res.json({error: "Maximum last bike rating out of range (1 to 720 hours)"})
        return
    }

    const maxWalkTime = parseInt(req.query.maxWalkTime as string)
    const maxWalkTimeWithinRange = 0 < maxWalkTime && maxWalkTime < 120
    if (req.query.maxWalkTime && !maxWalkTimeWithinRange) {
        res.status(400)
        res.json({error: "Maximum station walking time out of range (1 to 120 minutes)"})
        return
    }

    const weight = parseFloat(req.query.weight as string)
    const weightWithinRange = 0 < weight && weight < 1
    if (req.query.weight && !weightWithinRange) {
        res.status(400)
        res.json({error: "Priority weight has to be a value between 0 (stations with more bikes) and 1 (closer stations)"})
        return
    }

    next()
}

app.get('/api', checkQueryParams, (req: Request, res: Response) => {
    const params = {
        startPos: {latitude: parseFloat(req.query.startLat as string), longitude: parseFloat(req.query.startLon as string)},
        minRate: parseInt(req.query.minRate as string)  || 1,
        maxLastRate: parseInt(req.query.maxLastRate as string) || 720,
        bikeType: req.query.reqType as string,
        maxWalkTime: parseInt(req.query.maxWalkTime as string) || 120,
        weight: parseInt(req.query.weight as string) || 0.5
    }
    const velibs = new VelibRes(params)

    velibs.getBestStation().then((station: Station) => {
        const formattedDistance = station.walkingTime && `${Math.floor(station.walkingTime / 60)}m${Math.ceil(station.walkingTime % 60)}s`
        const resp = {
            name: station.name,
            latitude: station.pos.latitude,
            longitude: station.pos.longitude,
            walkingDistance: formattedDistance,
            ...(req.query.reqType != "dock" && {suitableBikes: station.filteredBikes.length}),
            ...(req.query.reqType == "dock" && {numberOfDocks: station.nbDocks}),
            ...(req.query.reqType != "dock" && {docks: station.filteredBikes.map(bike => bike.dockPosition)})
        }
        res.json(resp)
    })
})

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});