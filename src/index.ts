import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import { gbfs, StationsInformation } from './velib-types';
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
    const url = await getOpenDataUrl("station_information")
    if (url) {
        const stationInfoReq = await fetch(url)
        const stationInfoData : StationsInformation = await stationInfoReq.json()
        fs.writeFileSync(stationInfoFile, JSON.stringify(stationInfoData, null, 2));
        console.log("fetched data!")
    }
} 

// Schedule a fetch to run every 24 hours
cron.schedule('0 0 * * *', () => {
    fetchAndSaveStationInfo();
});

app.get('/', (req: Request, res: Response) => {
    try {
        const data = fs.readFileSync(stationInfoFile, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).send('Error reading data file');
    }
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});