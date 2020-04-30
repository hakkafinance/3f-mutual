import React, { useState, useCallback } from 'react'
import Card from './Card'
import CardContent from './CardContent'
import Text from './Text'
import Button from './Button'
import Bold from './Bold'
import EthereumIcon from './EthereumIcon'

export default function WithdrawForm(props) {
  const { dividends = 0, bonus = 0, total = 0, onSubmit = () => {} } = props
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
          <Bold>Your dividends:</Bold> {dividends} <EthereumIcon />
        </Text>
        <Text>
          <Bold>Your referral bonus:</Bold> {bonus} <EthereumIcon />
        </Text>
        <Text>
          <Bold>Total:</Bold> {total} <EthereumIcon />
        </Text>
        <Text error>{errorMessage}</Text>
        <Button disabled={isPending || parseFloat(total) === 0} onClick={onClickButton}>
          {isPending ? 'Pending...' : 'Withdraw'}
        </Button>
      </CardContent>
    </Card>
  )
}
