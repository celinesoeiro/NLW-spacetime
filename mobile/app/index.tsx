import { useCallback, useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

import Logo from '../assets/nlw-logo.svg'

import { api } from '../lib/api'

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

  return (
    <View className=" flex-1 items-center  px-12 py-10">
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
    </View>
  )
}
