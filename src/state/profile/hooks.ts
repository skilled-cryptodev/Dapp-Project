import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useSelector } from 'react-redux'
import { isAddress } from 'utils'
import { useAppDispatch } from 'state'
import usePreviousValue from 'hooks/usePreviousValue'
import { FetchStatus } from 'config/constants/types'
import { State, ProfileState } from '../types'
import { fetchProfile, fetchProfileUsername } from '.'
import { getProfile, GetProfileResponse } from './helpers'

export const useFetchProfile = () => {
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (account) {
      dispatch(fetchProfile(account))
    }
  }, [account, dispatch])
}

export const useProfileForAddress = (address: string) => {
  const [profileState, setProfileState] = useState<{ profile: GetProfileResponse; isFetching: boolean }>({
    profile: null,
    isFetching: true,
  })
  const previousAddress = usePreviousValue(address)
  const hasAddressChanged = previousAddress !== address

  useEffect(() => {
    const fetchProfileForAddress = async () => {
      try {
        const profile = await getProfile(address)
        setProfileState({ profile, isFetching: false })
      } catch (error) {
        console.error(`Failed to fetch profile for address ${address}`, error)
        setProfileState({ profile: null, isFetching: false })
      }
    }
    if (hasAddressChanged || (!profileState.isFetching && !profileState.profile)) {
      fetchProfileForAddress()
    }
  }, [profileState, address, hasAddressChanged])

  // Clear state on account switch
  useEffect(() => {
    setProfileState({ profile: null, isFetching: true })
  }, [address])

  return profileState
}

export const useAchievementsForAddress = (address: string) => {
  const [state, setState] = useState<{ isFetching: boolean }>({ isFetching: false })
  const previousAddress = usePreviousValue(address)
  const hasAddressChanged = previousAddress !== address

  useEffect(() => {
    const fetchProfileForAddress = async () => {
      setState({ isFetching: true })
      try {
        setState({ isFetching: false })
      } catch (error) {
        setState({ isFetching: false })
      }
    }
    if (hasAddressChanged || (!state.isFetching)) {
      fetchProfileForAddress()
    }
  }, [state, address, hasAddressChanged])

  // Clear state on account switch
  useEffect(() => {
    setState({ isFetching: true })
  }, [address])

  return state
}

export const useProfile = () => {
  const { isInitialized, isLoading, data, hasRegistered }: ProfileState = useSelector((state: State) => state.profile)
  return { profile: data, hasProfile: isInitialized && hasRegistered, isInitialized, isLoading }
}

export const useGetProfileAvatar = (account: string) => {
  const profileAvatar = useSelector((state: State) => state.profile.profileAvatars[account])
  const { username, hasRegistered, usernameFetchStatus, avatarFetchStatus } = profileAvatar || {}
  const dispatch = useAppDispatch()

  useEffect(() => {
    const address = isAddress(account)

    if (
      !username &&
      avatarFetchStatus === FetchStatus.Fetched &&
      usernameFetchStatus !== FetchStatus.Fetched &&
      address
    ) {
      dispatch(fetchProfileUsername({ account, hasRegistered }))
    }
  }, [account, username, hasRegistered, avatarFetchStatus, usernameFetchStatus, dispatch])

  return { username, usernameFetchStatus, avatarFetchStatus }
}