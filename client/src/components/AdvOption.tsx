import { Text, Stack, Tooltip } from '@mantine/core';
import { ReactNode } from 'react';

interface optionProps {
    children: ReactNode
    title: string
    tooltip: string
}

const AdvOption: React.FC<optionProps> = ({children, title, tooltip}) => {

    return (
        <>
            <Stack
                h={300}
                bg="var(--mantine-color-body)"
                align="stretch"
                gap="xs"
            >
                <Tooltip label={tooltip}>
                    <Text fw={700}>{title}</Text>
                </Tooltip>
                {children}
            </Stack>
        </>
    )
}

export default AdvOption