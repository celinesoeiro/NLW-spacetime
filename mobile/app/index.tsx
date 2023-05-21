import { useCallback, useEffect } from 'react'
import { ImageBackground, View, Text, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'
import { BaiJamjuree_700Bold } from '@expo-google-fonts/bai-jamjuree'
import { styled } from 'nativewind'

import Stripes from '../assets/stripes.svg'
import Logo from '../assets/nlw-logo.svg'
import blurBg from '../assets/luz.png'

import { api } from '../lib/api'

const StyledStripes = styled(Stripes)

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint:
    'https://github.com/settings/connections/applications/072d421155ccf9796760',
}

export default function App() {
  const router = useRouter()

  const [, response, signinWithGithub] = useAuthRequest(
    {
      clientId: '072d421155ccf9796760',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        scheme: 'spacetime',
      }),
    },
    discovery,
  )

  const handleGithubOAuthCode = useCallback(
    async (code: string) => {
      const response = await api.post('/register', {
        code,
      })

      const { token } = response.data

      await SecureStore.setItemAsync('token', token)

      router.push('/memories')
    },
    [router],
  )

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params

      handleGithubOAuthCode(code)

      console.log(code)
    }
  }, [response, handleGithubOAuthCode])

  const [hasLoadedFonts] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    BaiJamjuree_700Bold,
  })

  if (!hasLoadedFonts) {
    // Only shows interface after the fonts hae loaded
    return null
  }

  return (
    <ImageBackground
      source={blurBg}
      className="relative flex-1 items-center bg-gray-900 px-12 py-10"
      imageStyle={{ position: 'absolute', left: '-100%' }}
    >
      <StyledStripes className="absolute left-2" />

      <View className="flex-1 items-center justify-center gap-6">
        <Logo />
        <View className="space-y-2">
          <Text className="text-center font-title text-2xl leading-tight text-gray-50">
            Your time capsule
          </Text>
          <Text className="text-center font-body text-base leading-relaxed text-gray-100">
            Collect memorable moments from your journey and share (if you like)
            with the world!
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-full bg-green-500 px-5 py-3"
          onPress={() => signinWithGithub()}
        >
          <Text className="font-alt text-sm uppercase text-black">
            Register a memory
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center font-body text-sm leading-relaxed text-gray-200">
        Made with 💜 by Celine Soeiro at Rocketseat&apos;s NLW
      </Text>

      <StatusBar style="light" translucent />
    </ImageBackground>
  )
}
