import { Button, Loader } from "@mantine/core"
import { useState } from "react"

interface requestSendertProps {
    geoLoc: undefined | {lat: number, lon: number}
    typeChoice: string
    minRate: number
    maxLastRate: number
    maxWalkTime: number
    decisionWeight: number
    setError: React.Dispatch<React.SetStateAction<undefined | {message: string, details: string}>>
    setResults: React.Dispatch<React.SetStateAction<string>>
}

const RequestSender: React.FC<requestSendertProps> = ({geoLoc, typeChoice, minRate, maxLastRate, maxWalkTime, decisionWeight, setError, setResults}) => {
    const [ loading, setLoading ] = useState(false)
    
    const fetchRes = async () => {
        if (geoLoc) {
            const reqParams = new URLSearchParams({
                startLat: geoLoc.lat.toString(),
                startLon: geoLoc.lon.toString(),
                minRate: minRate.toString(),
                maxLastRate: maxLastRate.toString(),
                reqType: typeChoice,
                maxWalkTime: maxWalkTime.toString(),
                weight: decisionWeight.toString()

            }).toString()

            setLoading(true)
            try {
                const req = await fetch('http://localhost:8000/api?' + reqParams)
                const data = await req.json()
                setResults(data.toString())
            } catch (error) {
                setLoading(false)
                if (error instanceof Error) {
                    setError({message: "Impossible de commiquer avec l'API", details: error.message})
                }
            }
        }
    }

    return (
        <>
            <Button onClick={fetchRes}>
                {loading ? <Loader color="rgba(255, 255, 255, 1)" type="dots" /> : "Trouver"}
            </Button>
        </>
    )
}
  
export default RequestSender