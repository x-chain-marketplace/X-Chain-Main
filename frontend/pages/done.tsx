import { Box, Button, Img, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Layout } from '../components/layout/Layout'
import * as PushAPI from '@pushprotocol/restapi'
import { useEffect, useState } from 'react'

const waitForNewNotification = async () => {
  let notifications = await PushAPI.user.getFeeds({
    user: 'eip155:42:0xE898BBd704CCE799e9593a9ADe2c1cA0351Ab660', // user address in CAIP
    env: 'staging',
  })
  const initialLength = notifications.length

  while (notifications.length === initialLength) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    notifications = await PushAPI.user.getFeeds({
      user: 'eip155:42:0xE898BBd704CCE799e9593a9ADe2c1cA0351Ab660', // user address in CAIP
      env: 'staging',
    })
  }

  console.log('New notification arrived')
  return notifications[notifications.length - 1]
}

const Done: NextPage = () => {
  const router = useRouter()
  const { message, assetLink } = router.query
  const [newNotification, setNewNotification] = useState(null)

  useEffect(() => {
    const wait = async () => {
      const newNotif = await waitForNewNotification()
      setNewNotification(newNotif)
    }

    wait()
  }, [])

  return (
    <Layout>
      <Box
        maxW="xl"
        mx="auto"
        display="flex"
        textAlign="center"
        flexDirection="column"
        justifyContent="center"
        p="20px"
      >
        <Img
          src="/logo-solo.svg"
          display="block"
          mx="auto"
          justifyContent="center"
          width="250px"
        />
        <Text fontSize="27px" mb="50px">
          {`New notification: ${newNotification}`}
        </Text>
        <Text fontSize="27px" mb="50px">
          {message}
        </Text>
        {assetLink ? (
          <Link href={assetLink as string}>
            <Button
              mt={4}
              background="#FF6600"
              mr={3}
              display="flex"
              border="2px solid #FF6600"
              width="250px"
              padding="25px 20px"
              color="#fff"
              borderRadius="120px"
              mx="auto"
              fontSize="20px"
              _hover={{
                background: '#ff660099',
                transition: '0.5s',
                transform: 'scale(1.05)',
                color: '#fff',
              }}
            >
              View Asset
            </Button>
          </Link>
        ) : null}
      </Box>
    </Layout>
  )
}

export default Done
