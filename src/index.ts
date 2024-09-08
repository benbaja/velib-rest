import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import { gbfs, StationsInformation, StationsStatus, SingleStationInfo } from './velib-types';
import fs from 'fs'
import tls from 'tls'
import path from 'path'
import cron from 'node-cron'

tls.DEFAULT_MIN_VERSION = 'TLSv1.3'

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

const stationInfoFile = path.join(__dirname, 'station_info.json');

const getOpenDataUrl = async (type: string) => {
    const gbfsReq = await fetch("https://velib-metropole-opendata.smovengo.cloud/opendata/Velib_Metropole/gbfs.json")
    const gbfsData : gbfs = await gbfsReq.json()
    const gbfsFeeds = gbfsData.data.en.feeds
    return gbfsFeeds.find(feed => feed.name == type)?.url
}

const fetchAndSaveStationInfo = async () => {
    const url = await getOpenDataUrl("station_information") || "https://velib-metropole-opendata.smovengo.cloud/opendata/Velib_Metropole/station_information.json"
    const stationInfoReq = await fetch(url)
    const stationInfoData : StationsInformation = await stationInfoReq.json()

    const stationInfoMap: Record<SingleStationInfo["stationCode"], SingleStationInfo> = {}
    stationInfoData.data.stations.forEach((station) => {
        stationInfoMap[station.stationCode] = station
    })
    fs.writeFileSync(stationInfoFile, JSON.stringify(stationInfoMap, null, 2));
    console.log("fetched data!")

} 

const fetchAndMergeStationStatus = async () => {
    const url = await getOpenDataUrl("station_status") || "https://velib-metropole-opendata.smovengo.cloud/opendata/Velib_Metropole/station_status.json"
    const stationStatusReq = await fetch(url)
    const stationStatusData : StationsStatus = await stationStatusReq.json()
    
    const stationInfoMapFile = fs.readFileSync(stationInfoFile, 'utf-8')
    const stationInfoMap: Record<SingleStationInfo["stationCode"], SingleStationInfo> = JSON.parse(stationInfoMapFile)
    const mergedStationsList = stationStatusData.data.stations.map(station => {
        const match = stationInfoMap[station.stationCode as string]
        return match && {...station, ...match}
    })
    return mergedStationsList
}

// Schedule a fetch to run every 24 hours
cron.schedule('0 0 * * *', () => {
    fetchAndSaveStationInfo();
});

app.get('/', (req: Request, res: Response) => {
    fetchAndMergeStationStatus().then(mergedStationsList => {
        res.json(mergedStationsList)
    })
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});