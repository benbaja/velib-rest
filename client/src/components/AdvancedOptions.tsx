import { Accordion, NumberInput, Rating, SimpleGrid, Tooltip } from "@mantine/core"
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
            <Accordion defaultValue="advOptions" chevronPosition="left">
                <Accordion.Item key="advOptions" value="advOptions">
                <Accordion.Control>Options avancées</Accordion.Control>
                    <Accordion.Panel>
                        <SimpleGrid cols={2} spacing="xl" verticalSpacing="xl">
                            <Tooltip.Group openDelay={500} closeDelay={100}>
                            <AdvOption title="Note minimale" tooltip="Note minimale attribuée au vélib">
                                <Rating defaultValue={3} size="xl" count={3} value={minRate} onChange={setMinRate} />
                            </AdvOption>

                            <AdvOption title="Dernière note" tooltip="Temps maximal écoulé depuis la dernière note attribuée au vélib">
                                <NumberInput size="sm" radius="md" min={1} max={720} suffix={" hrs"} allowDecimal={false} value={maxLastRate} onChange={(v: string | number) => setMaxLastRate(v as number)} />
                            </AdvOption>

                            <AdvOption title="Temps de marche max" tooltip="Temps de marche maximum entre vous et la station vélib">
                                <NumberInput size="sm" radius="md" min={1} max={120} suffix={" min"} allowDecimal={false} value={maxWalkTime} onChange={(v: string | number) => setMaxWalkTime(v as number)} />
                            </AdvOption>

                            <AdvOption title="Indice de décision" tooltip="0 priorise la station avec le plus de vélibs, et 1 la plus proche">
                                <NumberInput size="sm" radius="md" min={0} max={1} decimalScale={2} step={0.1} value={decisionWeight} onChange={(v: string | number) => setDecisionWeight(v as number)}/>
                            </AdvOption>
                            </Tooltip.Group>
                        </SimpleGrid>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </>
    )
}
  
export default AdvancedOptions