import { Button } from "@mantine/core"
import { useState } from "react"
import { ApiData } from "../APIRes"

interface requestSenderProps {
    geoLoc: undefined | {lat: number, lon: number}
    typeChoice: string
    minRate: number
    maxLastRate: number
    maxWalkTime: number
    decisionWeight: number
    setError: React.Dispatch<React.SetStateAction<undefined | {message: string, details: string}>>
    setResults: React.Dispatch<React.SetStateAction<ApiData | undefined>>
}

const RequestSender: React.FC<requestSenderProps> = ({geoLoc, typeChoice, minRate, maxLastRate, maxWalkTime, decisionWeight, setError, setResults}) => {
    const [ loading, setLoading ] = useState(false)
    
    const fetchRes = async () => {
        setError(undefined)
        setResults(undefined)
        if (geoLoc) {
            const reqParams = new URLSearchParams({
                startLat: geoLoc.lat.toString(),
                startLon: geoLoc.lon.toString(),
                minRate: minRate.toString(),
                maxLastRate: maxLastRate.toString(),
                reqType: typeChoice,
                maxWalkTime: maxWalkTime.toString(),
                weight: decisionWeight.toString(),
                client: "true"
            }).toString()

            setLoading(true)
            try {
                const req = await fetch('http://localhost:8000/api?' + reqParams)
                const data = await req.json()
                if (!req.ok) {
                    setError({message: "Erreur de l'API", details: data.error})
                }
                setResults({
                    name: data.name,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    walkingDistance: data.walkingDistance,
                    suitableBikes: data.suitableBikes,
                    numberOfDocks: data.numberOfDocks,
                    docks: data.docks,
                    itinerary: data.itinerary
                })
            } catch (error) {
                setLoading(false)
                if (error instanceof Error) {
                    setError({message: "Impossible de commiquer avec l'API", details: error.message})
                }
            }
            setLoading(false)
        }
    }

    return (
        <>
            <Button onClick={fetchRes} 
                loading={loading} 
                loaderProps={{ type: 'dots', color: "rgba(255, 255, 255, 1)" }}
                disabled={geoLoc ? false : true}
            >
                Trouver
            </Button>
        </>
    )
}
  
export default RequestSender