import '@mantine/core/styles.css';
import { MantineProvider, Title } from '@mantine/core';
import './App.css'
import { useEffect, useState } from 'react';
import TypePicker from './components/TypePicker';
import AdvancedOptions from './components/AdvancedOptions';
import RequestSender from './components/RequestSender';
import ResultsDisplay from './components/ResultsDisplay';
import Map from './components/Map';

function App() {
  const [ geoLoc, setGeoLoc ] = useState<undefined | {lat: number, lon: number}>(undefined)
  const [ typeChoice, setTypeChoice ] = useState("bike")
  const [ minRate, setMinRate ] = useState(3)
  const [ maxLastRate, setMaxLastRate ] = useState(24)
  const [ maxWalkTime, setMaxWalkTime ] = useState(20)
  const [ decisionWeight, setDecisionWeight ] = useState(0.5)
  const [ error, setError ] = useState<undefined | {message: string, details: string}>(undefined)
  const [ results, setResults ] = useState("")

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoc({lat: position.coords.latitude, lon: position.coords.longitude})
      },
      (error) => {
        setError({message: "Impossible de déterminer votre géolocalisation", details: error.message})
      })
  }, [])


  return (
    <MantineProvider>
      <Title order={1}>Velib REST</Title>
      <div className="card">
        Trouvez rapidement la meilleure station de Velib proche de vous!
      </div>

      <div className="card">
        <TypePicker setChoice={setTypeChoice} />
      </div>

      <AdvancedOptions 
        minRateHook={[minRate, setMinRate]}
        maxLastRateHook={[maxLastRate, setMaxLastRate]}
        maxWalkTimeHook={[maxWalkTime, setMaxWalkTime]}
        decisionWeightHook={[decisionWeight, setDecisionWeight]}
      />

      <RequestSender 
        geoLoc={geoLoc}
        typeChoice={typeChoice}
        minRate={minRate}
        maxLastRate={maxLastRate}
        maxWalkTime={maxWalkTime}
        decisionWeight={decisionWeight}
        setError={setError}
        setResults={setResults}
      />

      <ResultsDisplay 
        error={error}
        results={results}
      />

      <div className="card">
        <Map 
          geoLoc={geoLoc}
        />
      </div>

      <p className="footer">
        API Ref - GitHub
      </p>
    </MantineProvider>
  )
}

export default App
