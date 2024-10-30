
import { ActionIcon, Divider, Group, Tooltip } from '@mantine/core';
import { MouseEvent, useEffect, useState } from 'react';
import { MdElectricBike, MdLocalParking, MdPedalBike } from 'react-icons/md';

interface typePickerProps {
    setChoice: React.Dispatch<React.SetStateAction<string>>
}

const TypePicker: React.FC<typePickerProps> = ({setChoice}) => {
    const [ mBikePicked, setMBikePicked] = useState(true)
    const [ eBikePicked, setEBikePicked] = useState(true)
    const [ parkPicked, setParkPicked] = useState(false)

    const handleClick = (e: MouseEvent) => {
        const btnType = e.currentTarget.id
        if (btnType.includes("bike")) {
            setParkPicked(false)
            if (btnType == "mbike") {
                !mBikePicked ? setMBikePicked(true) : eBikePicked && setMBikePicked(false)
            } else if (btnType == "ebike") {
                !eBikePicked ? setEBikePicked(true) : mBikePicked && setEBikePicked(false)
            }

        } else if (btnType == "park") {
            setMBikePicked(false)
            setEBikePicked(false)
            !parkPicked && setParkPicked(true)
        }
    }

    // update choice state
    useEffect(() => {
        if (parkPicked) {
            setChoice("park")
        } else {
            mBikePicked && setChoice("mbike")
            eBikePicked && setChoice("ebike")
            mBikePicked && eBikePicked && setChoice("bike")
        }
    }, [mBikePicked, eBikePicked, parkPicked])

    return (
        <>
            <Group justify="center">
                <Tooltip label="Velib mécanique">
                    <ActionIcon id="mbike" variant={mBikePicked ? "filled" : "outline"} color="teal" radius="xl" size="xl" onClick={handleClick} ><MdPedalBike size={28} /></ActionIcon>
                </Tooltip>
                <Tooltip label="Velib électrique">
                    <ActionIcon id="ebike" variant={eBikePicked ? "filled" : "outline"} color="blue" radius="xl" size="xl" onClick={handleClick}><MdElectricBike size={28} /></ActionIcon>
                </Tooltip>
                <Divider orientation="vertical" />
                <Tooltip label="Dock">
                    <ActionIcon id="park" variant={parkPicked ? "filled" : "outline"} color="grape" radius="xl" size="xl" onClick={handleClick}><MdLocalParking size={28} /></ActionIcon>
                </Tooltip>
            </Group>
        </>
    )
}

export default TypePicker