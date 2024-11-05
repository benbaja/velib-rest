import { Request, Response, NextFunction } from 'express';
import path from 'path'
import fs from 'fs'
import {mkdir} from 'fs/promises'
import { Readable } from 'stream'
import {finished} from 'stream/promises'
import { ReadableStream } from 'stream/web'

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
    const minRateWithinRange = 0 < minRate && minRate <= 3
    if (req.query.minRate && !minRateWithinRange) {
        res.status(400)
        res.json({error: "Minimum bike rate out of range (1 to 3 stars)"})
        return
    }

    const maxLastRate = parseInt(req.query.maxLastRate as string)
    const maxLastRateWithinRange = 0 < maxLastRate && maxLastRate <= 720
    if (req.query.maxLastRate && !maxLastRateWithinRange) {
        res.status(400)
        res.json({error: "Maximum last bike rating out of range (1 to 720 hours)"})
        return
    }

    const maxWalkTime = parseInt(req.query.maxWalkTime as string)
    const maxWalkTimeWithinRange = 0 < maxWalkTime && maxWalkTime <= 120
    if (req.query.maxWalkTime && !maxWalkTimeWithinRange) {
        res.status(400)
        res.json({error: "Maximum station walking time out of range (1 to 120 minutes)"})
        return
    }

    const weight = parseFloat(req.query.weight as string)
    const weightWithinRange = 0 <= weight && weight <= 1
    if (req.query.weight && !weightWithinRange) {
        res.status(400)
        res.json({error: "Priority weight has to be a value between 0 (stations with more bikes) and 1 (closer stations)"})
        return
    }

    next()
}

export {fetchPBF, checkQueryParams}