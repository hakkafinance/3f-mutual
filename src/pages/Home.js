import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useReducer,
} from 'react'
import { useSnackbar } from 'notistack'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import {
  useInsuranceContext,
  useInsuranceSystem,
  useInsuranceUser,
} from '../contexts/insurance'
import { useProfile } from '../contexts/profile'
import { useThreeBoxContext } from '../contexts/3Box'
import { useContract } from '../hooks/ethereum'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Jumbotron from '../components/Jumbotron'
import Banner from '../components/Banner'
import Tabs from '../components/Tabs'
import TabPanel from '../components/TabPanel'
import Container from '../components/Container'
import Box from '../components/Box'
import Text from '../components/Text'
import LineChart from '../components/LineChart'
import PurchaseForm from '../components/PurchaseForm'
import WithdrawForm from '../components/WithdrawForm'
import ClaimForm from '../components/ClaimForm'
import AgentCard from '../components/AgentCard'
import RegisterForm from '../components/RegisterForm'
import Profile from '../components/Profile'
import { amountFormatter, isAddress, getContract, getEtherscanLink, delay } from '../utils'
import {
  calculateLeftUnits,
  calculateUnderlyingEth,
} from '../utils/calculation'
import {
  INSURANCE_ADDRESSES,
  READ_ONLY,
  insuranceRatesByDay,
  BOX_SPACE,
} from '../constants'
import INSURANCE_ABI from '../constants/abis/insurance.json'
import saiImage from '../assets/sai.png'

const targetAsset = process.env.REACT_APP_TARGET_ASSET

const FormGroup = styled.div`
  > *:not(:first-child) {
    margin-top: 3rem;
  }
`

const Title = styled.h1`
  margin-top: 5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  text-align: center;
`

const SubTitle = styled.p`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  text-align: center;
`

const Anchor = styled.a`
  color: ${({ theme }) => theme.colors.buttonBackground};

  &:hover {
    color: ${({ theme }) => theme.colors.indicator};
  }
`

const WarningMessage = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
`

const Icon = styled.img`
  width: 1.25rem;
  height: 1.25rem;
  vertical-align: text-bottom;
`

const ActionGroup = styled.div`
  color: #ffca28;
`

const UPDATE_AGENT = 'UPDATE_AGENT'

function agentReducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_AGENT: {
      const { isAgent, id, name, address, level, image, greeting } = payload
      return {
        isAgent,
        id,
        name,
        address,
        level,
        image,
        greeting,
      }
    }
    default: {
      return { ...state }
    }
  }
}

function renderTransactionActions(chainId, hash, close) {
  return (key) => (
    <ActionGroup>
      <Button
        color='inherit'
        size='small'
        href={getEtherscanLink(chainId, hash, 'transaction')}
        target='_blank'
      >
        View
      </Button>
      <Button
        color='inherit'
        size='small'
        onClick={() => close(key)}
      >
        Dismiss
      </Button>
    </ActionGroup>
  )
}

export default function Home() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const { account } = useWeb3React()
  const { chainId, library: readOnlyLibrary } = useWeb3React(READ_ONLY)

  const [, { refresh }] = useInsuranceContext()

  const {
    pot,
    totalShares,
    totalInsurances,
    totalAgents,
    sharePrice,
    ended,
    expiringUnits = Array(100).fill(ethers.constants.Zero),
  } = useInsuranceSystem()

  const {
    shares,
    insurances,
    lastBought,
    dividends,
    bonus,
    expiringUnits: userExpiringUnits = Array(100).fill(ethers.constants.Zero),
  } = useInsuranceUser()

  const {
    id,
    name,
    level,
    points,
    pointsMax,
    refresh: refreshProfile,
  } = useProfile(account)

  const {
    isLoggedIn,
    profile,
    activate,
  } = useThreeBoxContext()

  const [remark, setRemark] = useState()
  useEffect(() => {
    window.Box.getSpace(account, BOX_SPACE)
      .then(space => {
        setRemark(space.remark || '')
      })
  }, [account])

  const onSaveRemark = useCallback(async (remark) => {
    try {
      console.log(remark)
      const box = await window.Box.openBox(account, window.ethereum)
      await box.syncDone
      const space = await box.openSpace(BOX_SPACE)
      await space.syncDone
      await space.public.set('remark', remark)
      setRemark(remark)
    } catch  {
      throw Error('Fail to Save the remark')
    }
  }, [account])

  const agentAddress = useMemo(
    () => localStorage.getItem('agentAddress') || ethers.constants.AddressZero,
    [],
  )
  const [agentState, dispatchAgentState] = useReducer(agentReducer, {
    isAgent: false,
  })
  const {
    isAgent,
    id: agentId,
    name: agentName,
    level: agentLevel,
    image: agentImage,
    greeting: agentGreeting,
  } = agentState
  useEffect(() => {
    if (
      isAddress(agentAddress) &&
      agentAddress !== ethers.constants.AddressZero &&
      (chainId || chainId === 0) &&
      readOnlyLibrary
    ) {
      let stale = false
      const contract = getContract(
        INSURANCE_ADDRESSES[chainId],
        INSURANCE_ABI,
        readOnlyLibrary,
      )
      Promise.all([
        contract.player(agentAddress),
        window.Box.getProfile(agentAddress),
        window.Box.getSpace(agentAddress, BOX_SPACE)
      ]).then(([player, profile, space]) => {
          if (!stale) {
            dispatchAgentState({
              type: UPDATE_AGENT,
              payload: {
                isAgent: player.isAgent,
                id: player.id,
                name: ethers.utils.parseBytes32String(player.name),
                address: agentAddress,
                level: player.level,
                image: profile.image ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}` : '',
                greeting: space.remark || '',
              },
            })
          }
        })
        .catch(() => {
          if (!stale) {
            dispatchAgentState({
              type: UPDATE_AGENT,
              payload: {
                isAgent: false,
                id: null,
                name: null,
                address: null,
                level: null,
                image: null,
              },
            })
          }
        })

      return () => {
        stale = true
      }
    }
  }, [agentAddress, chainId, readOnlyLibrary])

  const odd = useMemo(() => {
    if (pot && totalInsurances && !totalInsurances.isZero() && sharePrice) {
      return pot
        .mul(ethers.constants.WeiPerEther)
        .div(totalInsurances)
        .mul(ethers.constants.WeiPerEther)
        .div(sharePrice)
    }
  }, [pot, sharePrice, totalInsurances])
  
  const estimatedFutureCompensation = useMemo(() => {
    if (pot && expiringUnits) {
      return calculateLeftUnits(expiringUnits).map(v => {
        return v.isZero()
          ? ethers.constants.Zero
          : pot
            .mul(ethers.constants.WeiPerEther)
            .div(v)
      })
    }
  }, [expiringUnits, pot])

  const estimatedUserCompensation = useMemo(() => {
    if (pot && totalInsurances && !totalInsurances.isZero() && insurances) {
      return pot
        .mul(ethers.constants.WeiPerEther)
        .div(totalInsurances)
        .mul(insurances)
        .div(ethers.constants.WeiPerEther)
    }
  }, [pot, totalInsurances, insurances])

  const contract = useContract(INSURANCE_ADDRESSES[chainId], INSURANCE_ABI)

  const [paid, setPaid] = useState()
  const estimatePaid = useCallback(
    (shares, days) => {
      if (
        totalShares &&
        shares &&
        shares > 0 &&
        (days || days === 0) &&
        days < insuranceRatesByDay.length
      ) {
        const computedShares = new BigNumber(shares).times(1e18)
        const total = new BigNumber(totalShares.toString())
        const basePrice = calculateUnderlyingEth(
          total.plus(computedShares),
        ).minus(calculateUnderlyingEth(total))
        const discount = new BigNumber(insuranceRatesByDay[days]).plus(
          ethers.constants.WeiPerEther.toString(),
        )
        const value = basePrice
          .times(discount)
          .div(ethers.constants.WeiPerEther.toString())
        setPaid(value)
      } else {
        setPaid()
      }
    },
    [totalShares],
  )

  const purchase = useCallback(
    async (shares, days) => {
      if (!account) {
        throw Error('Please connect your wallet.')
      }

      if (
        totalShares &&
        (days || days === 0) &&
        shares &&
        shares > 0 &&
        contract
      ) {
        const computedShares = new BigNumber(shares).times(1e18)
        const total = new BigNumber(totalShares.toString())
        const basePrice = calculateUnderlyingEth(
          total.plus(computedShares),
        ).minus(calculateUnderlyingEth(total))
        const discount = new BigNumber(insuranceRatesByDay[days]).plus(
          ethers.constants.WeiPerEther.toString(),
        )
        const value = ethers.BigNumber.from(
          basePrice
            .times(discount)
            .div(ethers.constants.WeiPerEther.toString())
            .toFixed(0),
        )
        try {
          const tx = await contract['buy(address,uint256)'](agentAddress, days, {
            value,
          })
          const firstSnackbar = enqueueSnackbar('Waiting for purchasing.', {
            variant: 'info',
            persist: true,
            action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
          })
          await tx.wait()
          closeSnackbar(firstSnackbar)
          await delay(600)
          enqueueSnackbar('Successfully purchased.', {
            variant: 'success',
            autoHideDuration: 10000,
            action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
          })
          refresh()
        } catch {
          throw Error('Fail to purchse.')
        }
      }
    },
    [account, agentAddress, chainId, closeSnackbar, contract, enqueueSnackbar, refresh, totalShares],
  )

  const withdraw = useCallback(async () => {
    if (!account) {
      throw Error('Please connect your wallet.')
    }
    try {
      const tx = await contract.withdraw()
      const firstSnackbar = enqueueSnackbar('Waiting for withdrawing.', {
        variant: 'info',
        persist: true,
        action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
      })
      await tx.wait()
      closeSnackbar(firstSnackbar)
      await delay(600)
      enqueueSnackbar('Successfully withdrawed.', {
        variant: 'success',
        autoHideDuration: 10000,
        action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
      })
      refresh()
    } catch {
      throw Error('Fail to withdraw.')
    }
  }, [account, chainId, closeSnackbar, contract, enqueueSnackbar, refresh])

  const claim = useCallback(async () => {
    if (!account) {
      throw Error('Please connect your wallet.')
    }
    try {
      const tx = await contract.claim()
      const firstSnackbar = enqueueSnackbar('Waiting for claiming.', {
        variant: 'info',
        persist: true,
        action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
      })
      await tx.wait()
      closeSnackbar(firstSnackbar)
      await delay(600)
      enqueueSnackbar('Successfully claimed.', {
        variant: 'success',
        autoHideDuration: 10000,
        action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
      })
      refresh()
    } catch {
      throw Error('Fail to claim.')
    }
  }, [account, chainId, closeSnackbar, contract, enqueueSnackbar, refresh])

  const register = useCallback(
    async name => {
      if (!account) {
        throw Error('Please connect your wallet.')
      }
      if (name) {
        try {
          const tx = await contract.register(name, {
            value: ethers.utils.parseEther('0.01'),
          })
          const firstSnackbar = enqueueSnackbar('Waiting for registering.', {
            variant: 'info',
            persist: true,
            action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
          })
          await tx.wait()
          closeSnackbar(firstSnackbar)
          await delay(600)
          enqueueSnackbar('Successfully registered.', {
            variant: 'success',
            autoHideDuration: 10000,
            action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
          })
          refreshProfile()
        } catch {
          throw Error('The name has been registered.')
        }
      }
    },
    [account, chainId, closeSnackbar, contract, enqueueSnackbar, refreshProfile],
  )

  const upgrade = useCallback(async () => {
    if (!account) {
      throw Error('Please connect your wallet.')
    }
    try {
      const tx = await contract.upgrade()
      const firstSnackbar = enqueueSnackbar('Waiting for upgrading.', {
        variant: 'info',
        persist: true,
        action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
      })
      await tx.wait()
      closeSnackbar(firstSnackbar)
      await delay(600)
      enqueueSnackbar('Successfully upgraded.', {
        variant: 'success',
        autoHideDuration: 10000,
        action: renderTransactionActions(chainId, tx.hash, closeSnackbar)
      })
      refreshProfile()
    } catch {
      throw Error('Fail to upgrade.')
    }
  }, [account, chainId, closeSnackbar, contract, enqueueSnackbar, refreshProfile])

  const tabs = [
    { text: 'Purchase', index: 0 },
    { text: 'Vault', index: 1 },
    { text: 'Agent', index: 2, badge: isAgent },
    { text: 'Profile', index: 3 },
  ]
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <>
      <Header />
      <Jumbotron ended={ended} odd={odd ? amountFormatter(odd, 18, 2) : 0} />
      <Banner
        pot={pot ? amountFormatter(pot, 18) : '-'}
        totalShares={totalShares ? amountFormatter(totalShares, 18) : '-'}
        totalInsurances={
          totalInsurances ? amountFormatter(totalInsurances, 18) : '-'
        }
        totalAgents={totalAgents ? totalAgents.toString() : '-'}
      />
      <Tabs
        value={tabIndex}
        items={tabs}
        onChange={i => setTabIndex(i)}
      />
      <Box mt={4} mb={10} minHeight='calc(100vh - 15rem)'>
        <Container flex direction='column' justifyContent='center'>
          <WarningMessage>
            <div>
              <span role='img' aria-label='caution'>
                🚨
              </span>{' '}
              Alpha Version! Smart contracts have NOT been audited. Use at own risk!
            </div>
            <div>
              <span role='img' aria-label='caution'>
                🚨
              </span>{' '}
              This Insurance is for {targetAsset}{' '}
              <Icon src={saiImage} />{' '}
              shutdown.
            </div>
          </WarningMessage>
          <TabPanel value={tabIndex} index={0}>
            {ended ? (
              <Box flex direction='column' alignItems='center'>
                <Text>MakerDAO emergency shutdown had happened.</Text>
                <Text>
                  Please claim your compensation{' '}
                  <Anchor onClick={() => setTabIndex(1)}>Here</Anchor>
                </Text>
              </Box>
            ) : (
              <>
                <Box flex justifyContent='center'>
                  <PurchaseForm
                    shares={shares ? amountFormatter(shares, 18) : '-'}
                    insurances={
                      insurances ? amountFormatter(insurances, 18) : '-'
                    }
                    lastBought={
                      lastBought &&
                      !isNaN(lastBought.toNumber()) &&
                      lastBought.toNumber()
                    }
                    price={
                      sharePrice ? amountFormatter(sharePrice, 18, 6) : '-'
                    }
                    paid={paid ? amountFormatter(paid, 18, 6) : null}
                    onChange={estimatePaid}
                    onSubmit={purchase}
                  />
                </Box>
                {expiringUnits && (
                  <>
                    <Title>Trends</Title>
                    <SubTitle>
                      Total insurances in the system in next 100 days
                    </SubTitle>
                    <LineChart
                      value={calculateLeftUnits(expiringUnits).map(v =>
                        parseFloat(ethers.utils.formatEther(v)),
                      )}
                      chartStyles={{
                        marker: { color: 'rgb(33, 150, 243)', opacity: 0.8 },
                        line: { color: 'rgb(33, 150, 243)' },
                        fill: 'tozeroy',
                        fillcolor: 'rgba(187, 222, 251, 0.2)',
                      }}
                      value2={(estimatedFutureCompensation || []).map(v => parseFloat(ethers.utils.formatEther(v)))}
                      chart2Styles={{
                        marker: { color: 'rgb(76, 175, 80)', opacity: 0.8 },
                        line: { color: 'rgb(76, 175, 80)' },
                        fill: 'tozeroy',
                        fillcolor: 'rgba(200, 230, 201, 0.2)',
                      }}
                    />
                  </>
                )}
                {userExpiringUnits && (
                  <>
                    <Title>Mine</Title>
                    <SubTitle>My insurance in next 100 days</SubTitle>
                    <LineChart
                      value={calculateLeftUnits(userExpiringUnits).map(v =>
                        parseFloat(ethers.utils.formatEther(v)),
                      )}
                      chartStyles={{
                        marker: { color: 'rgb(237, 129, 53)', opacity: 0.8 },
                        line: { color: 'rgb(237, 129, 53)' },
                        fill: 'tozeroy',
                        fillcolor: 'rgba(253, 216, 136, 0.2)',
                      }}
                    />
                  </>
                )}
              </>
            )}
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <Box flex direction='column' alignItems='center'>
              <FormGroup>
                <WithdrawForm
                  dividends={dividends ? amountFormatter(dividends, 18) : '-'}
                  bonus={bonus ? amountFormatter(bonus, 18) : '-'}
                  total={
                    dividends && bonus
                      ? amountFormatter(dividends.add(bonus), 18)
                      : '-'
                  }
                  onSubmit={withdraw}
                />
                <ClaimForm
                  insurances={insurances ? amountFormatter(insurances, 18) : '-'}
                  estimatedCompensation={estimatedUserCompensation ? amountFormatter(estimatedUserCompensation, 18) : '-'}
                  canClaim={ended}
                  onSubmit={claim}
                />
              </FormGroup>
            </Box>
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <Box flex direction='column' alignItems='center'>
              <AgentCard
                isAgent={isAgent}
                id={agentId && agentId.toNumber()}
                name={agentName && agentName.toString()}
                address={agentAddress}
                level={agentLevel && agentLevel.toNumber()}
                image={agentImage}
                greeting={agentGreeting}
              />
            </Box>
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <Box flex direction='column' alignItems='center'>
              {account && id && !id.isZero() ? (
                <Profile
                  account={account}
                  id={id && id.toNumber()}
                  name={name && name.toString()}
                  level={level && level.toNumber()}
                  points={points && parseFloat(amountFormatter(points, 18, 6))}
                  pointsMax={
                    pointsMax && parseFloat(amountFormatter(pointsMax, 18, 6))
                  }
                  canUpgrade={points && pointsMax && points.gte(pointsMax)}
                  onUpgrade={upgrade}
                  isLoggedIn={isLoggedIn}
                  avatar={profile.image ? profile.image[0].contentUrl['/'] : ''}
                  activate={activate}
                  remark={remark}
                  onSaveRemark={onSaveRemark}
                />
              ) : (
                <RegisterForm onSubmit={register} />
              )}
            </Box>
          </TabPanel>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
