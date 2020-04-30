import React, { useState, useCallback } from 'react'
import Card from './Card'
import CardContent from './CardContent'
import Text from './Text'
import Button from './Button'
import Bold from './Bold'
import Divider from './Divider'
import EthereumIcon from './EthereumIcon'

export default function ClaimForm(props) {
  const { insurances = 0, estimatedCompensation = 0, canClaim, onSubmit = () => {} } = props
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
          <Bold>
            If MakerDAO shutdowned, you can claim the compensation from the
            contract by pressing the button below!
          </Bold>
        </Text>
      </CardContent>
      <Divider />
      <CardContent>
        <Text>
          <Bold>Your Active Insurances:</Bold> {insurances} <EthereumIcon />
        </Text>
        <Text>
          <Bold>Estimated Compensation:</Bold> {estimatedCompensation} <EthereumIcon />
        </Text>
        <Text error>{errorMessage}</Text>
        <Button disabled={isPending || !canClaim} onClick={onClickButton}>
          {isPending ? 'Pending...' : 'Claim'}
        </Button>
      </CardContent>
    </Card>
  )
}
