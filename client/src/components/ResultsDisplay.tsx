import { Mark, Paper, Title, Text, Button, Space } from "@mantine/core"
import { ApiData } from "../APIRes"
import { useEffect, useState } from "react"

interface resultsDisplayProps {
    error: undefined | {message: string, details: string}
    results: ApiData | undefined
    geoLoc: undefined | {lat: number, lon: number}
}

const ResultsDisplay: React.FC<resultsDisplayProps> = ({error, results, geoLoc}) => {
    const [formattedDocksList, setFormattedDocksList] = useState("")

    useEffect(() => {
        if (results && results.docks && results.docks.length > 0) {
            const sortedList = [...results.docks].sort((a, b) => Number(a) - Number(b))
            setFormattedDocksList(sortedList.join(", "))
        } else {
            setFormattedDocksList("")
        }
    }, [results])

    const getMapsLink = () => {
        if (geoLoc && results) {
            const reqParams = new URLSearchParams({
                travelmode: "walking",
                origin: `${geoLoc.lat},${geoLoc.lon}`,
                destination: `${results.latitude},${results.longitude}`
            }).toString()
            return "https://www.google.com/maps/dir/?api=1&" + reqParams
        } else {
            return ""
        }
    }

    return (
        <> 
            <Paper shadow="sm" p="xl" display={!error && results ? "block" : "none"}>
                <Title order={4}>Meilleure station: <Mark color="lime">{results?.name}</Mark></Title>
                <Text>{results?.walkingDistance ? `À ${results?.walkingDistance} minutes à pied` : ""}</Text>
                <Text>{results?.suitableBikes || results?.numberOfDocks} {results?.suitableBikes ? "vélos" : "places"} disponibles {results?.suitableBikes ? "aux docks suivants :" : ""}</Text>
                <Text>{formattedDocksList}</Text>
                <Space h="xs" />
                <Button 
                    size="compact-md" 
                    color="lime"
                    component="a" 
                    href={getMapsLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ouvrir dans Google Maps
                </Button>
            </Paper>

            <Paper shadow="sm" p="xl" display={error ? "block" : "none"}>
                <Title order={4}><Mark color="#C91A25">Erreur</Mark></Title>
                <Text c="#C91A25">{error?.message}</Text>
                <Text size="xs">({error?.details})</Text>
            </Paper>
        </>
    )
}
  
export default ResultsDisplay