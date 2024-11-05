import express, { Request, Response , Application, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path'
import {VelibRes, Station} from './velib-stations'
import {fetchPBF, checkQueryParams} from './utils'
import tls from 'tls'
import cron from 'node-cron'
import cors from 'cors'

tls.DEFAULT_MIN_VERSION = 'TLSv1.3'

//For env File 
dotenv.config();

const app: Application = express();

app.use(cors())

app.use(express.static(path.resolve(__dirname, '../../client/dist')));

const port = 8000;

cron.schedule('0 0 * * *', () => {
    fetchPBF();
});

app.get('/api', checkQueryParams, (req: Request, res: Response) => {
    console.log(req.body)
    const params = {
        startPos: {latitude: parseFloat(req.query.startLat as string), longitude: parseFloat(req.query.startLon as string)},
        minRate: parseInt(req.query.minRate as string)  || 1,
        maxLastRate: parseInt(req.query.maxLastRate as string) || 720,
        bikeType: req.query.reqType as string,
        maxWalkTime: parseInt(req.query.maxWalkTime as string) || 120,
        weight: parseInt(req.query.weight as string) || 0.5
    }
    const velibs = new VelibRes(params)

    velibs.getBestStation().then((bestStation: Station) => {
        const formattedDistance = bestStation.walkingTime && `${Math.floor(bestStation.walkingTime / 60)}m${Math.ceil(bestStation.walkingTime % 60)}s`
        const otherStations = velibs.filteredStations.filter(otherStation => otherStation.name != bestStation.name).map((otherStation) => {
            return {
                name: otherStation.name,
                latitude: otherStation.pos.latitude,
                longitude: otherStation.pos.longitude,
                ...(req.query.reqType != "dock" && {suitableBikes: otherStation.filteredBikes.length}),
                ...(req.query.reqType == "dock" && {numberOfDocks: otherStation.nbDocks})
            }
        })

        const resp = {
            name: bestStation.name,
            latitude: bestStation.pos.latitude,
            longitude: bestStation.pos.longitude,
            walkingDistance: formattedDistance,
            ...(req.query.client && {itinerary: bestStation.itinerary}),
            ...(req.query.reqType != "dock" && {suitableBikes: bestStation.filteredBikes.length}),
            ...(req.query.reqType == "dock" && {numberOfDocks: bestStation.nbDocks}),
            ...(req.query.reqType != "dock" && {docks: bestStation.filteredBikes.map(bike => bike.dockPosition)}),
            ...(req.query.client && {otherStations: otherStations}),
        }
        res.json(resp)
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});