import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import Card from './Card'
import CardContent from './CardContent'
import Divider from './Divider'
import Text from './Text'
import TextField from './TextField'
import Button from './Button'
import Bold from './Bold'
import EthereumIcon from './EthereumIcon'
import { formatUTC0 } from '../utils'

const Summary = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
  margin: 1.5rem 0;
`

export default function PurchaseForm(props) {
  const {
    isContractAccount = false,
    shares = 0,
    insurances = 0,
    lastBought,
    price = 0,
    paid,
    onChange = () => {},
    onSubmit = () => {},
  } = props

  const [amount, setAmount] = useState(isContractAccount ? 0 : '')
  const [period, setPeriod] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState()

  useEffect(() => {
    onChange(amount, period)
  }, [amount, onChange, period])

  useEffect(() => {
    if (parseFloat(paid) < 1e-9) {
      setErrorMessage('The Ether you pay should be greater than 0.000000001')
    } else {
      setErrorMessage('')
    }
  }, [paid])

  const onPurchase = useCallback(async () => {
    try {
      setIsPending(true)
      setErrorMessage()
      await onSubmit(amount, period)
      setAmount('')
      setPeriod('')
    } catch (e) {
      setErrorMessage(e.message)
    } finally {
      setIsPending(false)
    }
  }, [amount, onSubmit, period])

  return (
    <Card>
      <CardContent>
        <Text>
          <Bold>Your Shares:</Bold> {shares}
        </Text>
        <Text>
          <Bold>Your Active Insurances:</Bold> {insurances}
        </Text>
        <Text>
          <Bold>Last Bought:</Bold>{' '}
          {lastBought && !isNaN(lastBought)
            ? formatUTC0(lastBought, true)
            : '-'}
        </Text>
        <Text>
          <Bold>Now:</Bold> {formatUTC0(Date.now(), true)}
        </Text>
        <Text>
          Learn more on our{' '}
          <a href='https://3fmutual.hostedwiki.co/' target='_blank' rel="noopener noreferrer">
            Wiki
          </a>.
        </Text>
      </CardContent>
      <Divider />
      <CardContent>
        <Text>
          <Bold>Basis Price:</Bold> {price} <EthereumIcon />
        </Text>
        <TextField
          type='number'
          label='Unit of Insurance:'
          placeholder='1.0 unit'
          step='0.01'
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
        {!isContractAccount &&
          <TextField
            type='number'
            label='Time:'
            placeholder='0 ~ 100 days'
            step='1'
            value={period}
            onChange={event => {
              if (event.target.value) {
                setPeriod(Math.min(Math.abs(Math.round(event.target.value)), 100))
              } else {
                setPeriod('')
              }
            }}
          />
        }
        {paid && (
          <Summary>
            You will pay <Bold>{paid}</Bold>
            <EthereumIcon /> for <Bold>{amount}</Bold> units for{' '}
            <Bold>{period}</Bold> days
          </Summary>
        )}
        <Text error>{errorMessage}</Text>
        <Button disabled={isPending || !!errorMessage} onClick={onPurchase}>
          {isPending ? 'Pending...' : 'Purchase'}
        </Button>
      </CardContent>
    </Card>
  )
}
