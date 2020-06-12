import React, { useState, useCallback, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
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

  const { t } = useTranslation()

  const [amount, setAmount] = useState(isContractAccount ? 0 : '')
  const [duration, setDuration] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState()

  useEffect(() => {
    onChange(amount, duration)
  }, [amount, onChange, duration])

  useEffect(() => {
    if (parseFloat(paid) < 1e-9) {
      setErrorMessage(t('minPaidError'))
    } else {
      setErrorMessage('')
    }
  }, [paid, t])

  const onPurchase = useCallback(async () => {
    try {
      setIsPending(true)
      setErrorMessage()
      await onSubmit(amount, duration)
      setAmount('')
      setDuration('')
    } catch (e) {
      setErrorMessage(e.message)
    } finally {
      setIsPending(false)
    }
  }, [amount, onSubmit, duration])

  return (
    <Card>
      <CardContent>
        <Text>
          <Bold>{t('yourShares')}:</Bold> {shares}
        </Text>
        <Text>
          <Bold>{t('yourActiveInsurances')}:</Bold> {insurances}
        </Text>
        <Text>
          <Bold>{t('lastBought')}:</Bold>{' '}
          {lastBought && !isNaN(lastBought)
            ? formatUTC0(lastBought, true)
            : '-'}
        </Text>
        <Text>
          <Bold>{t('now')}:</Bold> {formatUTC0(Date.now(), true)}
        </Text>
        <Text>
          {t('learnMoreOnOur')}{' '}
          <a href='https://3fmutual.hostedwiki.co/' target='_blank' rel="noopener noreferrer">
            Wiki
          </a>.
        </Text>
      </CardContent>
      <Divider />
      <CardContent>
        <Text>
          <Bold>{t('basisPrice')}:</Bold> {price} <EthereumIcon />
        </Text>
        <TextField
          type='number'
          label={t('insuranceAmountLabel')}
          placeholder={t('insuranceAmountPlaceholder')}
          step='0.01'
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
        {!isContractAccount &&
          <TextField
            type='number'
            label={t('durationLabel')}
            placeholder={t('durationPlaceholder')}
            step='1'
            value={duration}
            onChange={event => {
              if (event.target.value) {
                setDuration(Math.min(Math.abs(Math.round(event.target.value)), 100))
              } else {
                setDuration('')
              }
            }}
          />
        }
        {paid && (
          <Summary>
            <Trans i18nKey='insuranceSummary'>
              You will pay <Bold>{{ paid }}</Bold>
              <EthereumIcon /> for <Bold>{{ amount }}</Bold> units for
              <Bold>{{ duration }}</Bold> days
            </Trans>
          </Summary>
        )}
        <Text error>{errorMessage}</Text>
        <Button disabled={isPending || !!errorMessage} onClick={onPurchase}>
          {isPending ? t('pending') : t('purchase')}
        </Button>
      </CardContent>
    </Card>
  )
}
