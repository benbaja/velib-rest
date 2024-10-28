import '@mantine/core/styles.css';
import { MantineProvider, Rating, Title } from '@mantine/core';
import './App.css'
import { useState } from 'react';
import TypePicker from './components/TypePicker';

function App() {
  const typeChoiceHook = useState("bike")
  const [minRate, setMinRate] = useState(3)

  return (
    <MantineProvider>
      <Title order={1}>Velib REST</Title>
      <div className="card">
        Trouvez rapidement la meilleure station de Velib proche de vous!
      </div>
      <TypePicker choiceHook={typeChoiceHook} />
      <Rating defaultValue={3} size="xl" count={3} value={minRate} onChange={setMinRate} />
      <p className="footer">
        API Ref - GitHub
      </p>
    </MantineProvider>
  )
}

export default App
