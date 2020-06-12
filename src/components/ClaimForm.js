import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Card from './Card'
import CardContent from './CardContent'
import Text from './Text'
import Button from './Button'
import Bold from './Bold'
import Divider from './Divider'
import EthereumIcon from './EthereumIcon'

export default function ClaimForm(props) {
  const { insurances = 0, estimatedCompensation = 0, canClaim, onSubmit = () => {} } = props
  
  const { t } = useTranslation()
  
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState()

  const onClickButton = useCallback(async () => {
    try {
      setErrorMessage('')
      setIsPending(true)
      await onSubmit()
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsPending(false)
    }
  }, [onSubmit])

  return (
    <Card>
      <CardContent>
        <Text>
          <Bold>{t('claimInstruction')}</Bold>
        </Text>
      </CardContent>
      <Divider />
      <CardContent>
        <Text>
          <Bold>{t('yourActiveInsurances')}:</Bold> {insurances} <EthereumIcon />
        </Text>
        <Text>
          <Bold>{t('estimatedCompensation')}:</Bold> {estimatedCompensation} <EthereumIcon />
        </Text>
        <Text error>{errorMessage}</Text>
        <Button disabled={isPending || !canClaim || parseFloat(insurances) === 0} onClick={onClickButton}>
          {isPending ? t('pending') : t('claim')}
        </Button>
      </CardContent>
    </Card>
  )
}
