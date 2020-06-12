import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import styled from 'styled-components'
import Card from './Card'
import CardContent from './CardContent'
import TextField from './TextField'
import Button from './Button'
import Text from './Text'

const Label = styled.div`
  margin-left: 1rem;
  font-size: 1rem;
`

const RuleItem = styled.li`
  margin-bottom: 0.5rem;
  margin-left: 1.5rem;
  font-size: 0.75rem;
  color: ${({ theme, active }) =>
    active ? theme.colors.error : theme.colors.textColor};
`

const LENGTH_ERROR = 1
const CHARACTER_ERROR = 2
const PREFIX_ERROR = 3
const ONLY_DIGITS_ERROR = 4
const SPACE_ERROR = 5
const CONSECUTIVE_SPACE_ERROR = 6

export default function RegisterForm(props) {
  const { onSubmit = () => {} } = props

  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formatErrors, setFormatErrors] = useState([])

  useEffect(() => {
    let errorCodes = []
    if (name.length < 1 || name.length > 32) {
      errorCodes = [...errorCodes, LENGTH_ERROR]
    }
    if (/[~!@#$%^&*()_+~`<>?;"':;|/,.[\]\\]+/.test(name)) {
      errorCodes = [...errorCodes, CHARACTER_ERROR]
    }
    if (name.startsWith('0x')) {
      errorCodes = [...errorCodes, PREFIX_ERROR]
    }
    if (name && !isNaN(name)) {
      errorCodes = [...errorCodes, ONLY_DIGITS_ERROR]
    }
    if (name.startsWith(' ') || name.endsWith(' ')) {
      errorCodes = [...errorCodes, SPACE_ERROR]
    }
    if (name.includes('  ')) {
      errorCodes = [...errorCodes, CONSECUTIVE_SPACE_ERROR]
    }
    setFormatErrors(errorCodes)
  }, [name])

  const onClickButton = useCallback(async () => {
    try {
      setErrorMessage('')
      setIsPending(true)
      if (formatErrors.length === 0) {
        await onSubmit(name)
      }
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsPending(false)
    }
  }, [formatErrors, name, onSubmit])

  return (
    <Card>
      <CardContent>
        <TextField
          type='text'
          label={t('name')}
          value={name}
          onChange={event => setName(event.target.value)}
        />
        <Label>{t('nameRules')}</Label>
        <ul>
          <RuleItem active={formatErrors.includes(LENGTH_ERROR)}>
            <Trans i18nKey='mustConsistOfCharacters'>
              must consist of <strong>1~32</strong> characters
            </Trans>
          </RuleItem>
          <RuleItem active={formatErrors.includes(CHARACTER_ERROR)}>
            <Trans i18nKey='mustUseOnly'>
              must use only <strong>a-z/0-9 and spaces</strong>
            </Trans>
          </RuleItem>
          <RuleItem active={formatErrors.includes(PREFIX_ERROR)}>
            {t('mustNotBeginWith0x')}
          </RuleItem>
          <RuleItem active={formatErrors.includes(ONLY_DIGITS_ERROR)}>
            {t('mustNotConsistOfDigitsOnly')}
          </RuleItem>
          <RuleItem active={formatErrors.includes(SPACE_ERROR)}>
            {t('mustNotBeginWithOrEndWithSpaces')}
          </RuleItem>
          <RuleItem active={formatErrors.includes(CONSECUTIVE_SPACE_ERROR)}>
            {t('mustNotContainConsecutiveSpaces')}
          </RuleItem>
        </ul>
        <Text error>{errorMessage}</Text>
        <Button
          onClick={onClickButton}
          disabled={isPending || !!formatErrors.length}
        >
          {isPending ? t('pending') : t('payToRegister', { amount: 0.01 })}
        </Button>
      </CardContent>
    </Card>
  )
}
