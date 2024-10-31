interface resultsDisplayProps {
    error: undefined | {message: string, details: string}
    results: string
}

const ResultsDisplay: React.FC<resultsDisplayProps> = ({error, results}) => {

    return (
        <> 
            {results}
            {error?.details}
        </>
    )
}
  
export default ResultsDisplay