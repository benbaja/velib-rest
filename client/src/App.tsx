import '@mantine/core/styles.css';
import { AspectRatio, MantineProvider, Space, Title, Text } from '@mantine/core';
import {ApiData} from "./APIRes"
import './App.css'
import { MapContainer } from 'react-leaflet'
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
  const [ results, setResults ] = useState<ApiData | undefined>(undefined)

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
      <Space h="lg" />
      
      <Text>Trouvez rapidement la meilleure station de Velib proche de vous!</Text>
      <Space h="lg" />

      <TypePicker setChoice={setTypeChoice} />
      <Space h="lg" />

      <AdvancedOptions 
        minRateHook={[minRate, setMinRate]}
        maxLastRateHook={[maxLastRate, setMaxLastRate]}
        maxWalkTimeHook={[maxWalkTime, setMaxWalkTime]}
        decisionWeightHook={[decisionWeight, setDecisionWeight]}
      />
      <Space h="lg" />

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
      <Space h="md" />

      <ResultsDisplay 
        error={error}
        results={results}
        geoLoc={geoLoc}
      />
      <Space h="md" />

      <AspectRatio ratio={16 / 9}>
        <MapContainer center={[48.86040280350408, 2.3364582290119023]} zoom={10} minZoom={10} maxZoom={16} scrollWheelZoom={true}>
          <Map 
            geoLoc={geoLoc}
            results={results}
          />
        </MapContainer>
      </AspectRatio>
      <Space h="lg" />

      <p className="footer">
        API Ref - GitHub
      </p>
    </MantineProvider>
  )
}

export default App
