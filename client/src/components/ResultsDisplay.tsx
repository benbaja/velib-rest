import { Mark, Paper, Title, Text } from "@mantine/core"
import { ApiData } from "../APIRes"
import { useEffect, useState } from "react"

interface resultsDisplayProps {
    error: undefined | {message: string, details: string}
    results: ApiData | undefined
}

const ResultsDisplay: React.FC<resultsDisplayProps> = ({error, results}) => {
    const [formattedDocksList, setFormattedDocksList] = useState("")

    useEffect(() => {
        if (results && results.docks.length > 0) {
            const sortedList = [...results.docks].sort((a, b) => Number(a) - Number(b))
            setFormattedDocksList(sortedList.join(", "))
        } 
    }, [results])

    return (
        <> 
            <Paper shadow="sm" p="xl" display={!error && results ? "block" : "none"}>
                <Title order={4}>Meilleure station: <Mark color="lime">{results?.name}</Mark></Title>
                <Text>{results?.walkingDistance ? `À ${results?.walkingDistance} minutes à pied` : ""}</Text>
                <Text>{results?.suitableBikes || results?.numberOfDocks} {results?.suitableBikes ? "vélos" : "places"} disponibles {results?.suitableBikes ? "aux docks suivants :" : ""}</Text>
                <Text>{formattedDocksList}</Text>
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