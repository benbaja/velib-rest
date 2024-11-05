import { Text, Stack, Tooltip, Box } from '@mantine/core';
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
                bg="var(--mantine-color-body)"
                align="stretch"
                gap="xs"
            >
                <Tooltip label={tooltip} multiline w={150} withArrow>
                    <Text fw={700}>{title}</Text>
                </Tooltip>
                <Box mx="auto">
                    {children}
                </Box>
            </Stack>
        </>
    )
}

export default AdvOption