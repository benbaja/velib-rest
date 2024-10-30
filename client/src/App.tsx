import '@mantine/core/styles.css';
import { MantineProvider, Title } from '@mantine/core';
import './App.css'
import { useState } from 'react';
import TypePicker from './components/TypePicker';
import AdvancedOptions from './components/AdvancedOptions';

function App() {
  const [ typeChoice, setTypeChoice ] = useState("bike")
  const [ minRate, setMinRate ] = useState(3)
  const [ maxLastRate, setMaxLastRate ] = useState(24)
  const [ maxWalkTime, setMaxWalkTime ] = useState(20)
  const [ decisionWeight, setDecisionWeight ] = useState(0.5)


  return (
    <MantineProvider>
      <Title order={1}>Velib REST</Title>
      <div className="card">
        Trouvez rapidement la meilleure station de Velib proche de vous!
      </div>
      <TypePicker setChoice={setTypeChoice} />
      <AdvancedOptions 
        minRateHook={[minRate, setMinRate]}
        maxLastRateHook={[maxLastRate, setMaxLastRate]}
        maxWalkTimeHook={[maxWalkTime, setMaxWalkTime]}
        decisionWeightHook={[decisionWeight, setDecisionWeight]}
      />
      <p className="footer">
        API Ref - GitHub
      </p>
    </MantineProvider>
  )
}

export default App
