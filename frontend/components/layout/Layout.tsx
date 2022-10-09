import { Container, Flex, Image, SimpleGrid, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'
import { Head, MetaProps } from './Head'

interface LayoutProps {
  children: React.ReactNode
  customMeta?: MetaProps
}

export const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  return (
    <>
      <Head customMeta={customMeta} />
      <header>
        <Container maxWidth="container.xl">
          <SimpleGrid
            columns={[1, 1, 1, 2]}
            alignItems="center"
            justifyContent="space-between"
            py="8"
          >
            <Flex>
              <Image
                mb={4}
                ml={5}
                pr={5}
                src="/logo.png"
                fallbackSrc="/logo.png"
                borderRadius="full"
              />
              <Text mt="5">
                Hello World
              </Text>
            </Flex>
            <Flex
              order={[-1, null, null, 2]}
              alignItems={'center'}
              justifyContent={['flex-start', null, null, 'flex-end']}
            >
              <ConnectButton />
            </Flex>
          </SimpleGrid>
        </Container>
      </header>
      <main>
        <Container maxWidth="container.xl">{children}</Container>
      </main>
    </>
  )
}
