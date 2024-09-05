import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get('/', (req: Request, res: Response) => {
    const reqInit: RequestInit = {
        method: "POST",
        body: JSON.stringify({disponibility: "yes", stationName: "Mairie du 20ème"}),
        cache: "no-store",
        mode: "cors",
        credentials: "include",
        headers: {
            "Host": "www.velib-metropole.fr",
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": "Basic bW9iaTokMnkkMTAkdzNVN3RaS29XVWJsZW1nUHBoQU9JZXdzejVGeWRralNHekdscFpId3drM1pSZUtKVTRDVy4=",
            "user-agent": "Velib/949 CFNetwork/1496.0.7 Darwin/23.5.0",
            "accept-language": "fr-FR,fr;q=0.9"
        }
    }
    fetch("https://www.velib-metropole.fr/api/secured/searchStation", reqInit).then( data => {
        console.log(data.status)
        res.send(data.blob());
    })
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});