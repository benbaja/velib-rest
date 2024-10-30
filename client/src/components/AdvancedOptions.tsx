import { NumberInput, Rating, SimpleGrid } from "@mantine/core"
import AdvOption from "./AdvOption"

interface advancedOptionsProps {
    minRateHook: [ number, React.Dispatch<React.SetStateAction<number>>]
    maxLastRateHook: [ number, React.Dispatch<React.SetStateAction<number>>]
    maxWalkTimeHook: [ number, React.Dispatch<React.SetStateAction<number>>]
    decisionWeightHook: [ number, React.Dispatch<React.SetStateAction<number>>]
}

const AdvancedOptions: React.FC<advancedOptionsProps> = ({minRateHook, maxLastRateHook, maxWalkTimeHook, decisionWeightHook}) => {
    const [minRate, setMinRate] = minRateHook
    const [maxLastRate, setMaxLastRate] = maxLastRateHook
    const [maxWalkTime, setMaxWalkTime] = maxWalkTimeHook
    const [decisionWeight, setDecisionWeight] = decisionWeightHook

    return (
        <>
            <SimpleGrid cols={2} spacing="xl" verticalSpacing="xl">
                <AdvOption title="Note minimale" tooltip="">
                    <Rating defaultValue={3} size="xl" count={3} value={minRate} onChange={setMinRate} />
                </AdvOption>
                <AdvOption title="Dernière note" tooltip="">
                    <NumberInput size="sm" radius="md" min={1} max={720} suffix={" hrs"} allowDecimal={false} value={maxLastRate} onChange={(v: string | number) => setMaxLastRate(v as number)} />
                </AdvOption>
                <AdvOption title="Temps de marche max" tooltip="">
                    <NumberInput size="sm" radius="md" min={1} max={120} suffix={" min"} allowDecimal={false} value={maxWalkTime} onChange={(v: string | number) => setMaxWalkTime(v as number)} />
                </AdvOption>
                <AdvOption title="Indice de décision" tooltip="">
                    <NumberInput size="sm" radius="md" min={0} max={1} decimalScale={2} step={0.1} value={decisionWeight} onChange={(v: string | number) => setDecisionWeight(v as number)}/>
                </AdvOption>
            </SimpleGrid>
        </>
    )
}
  
export default AdvancedOptions