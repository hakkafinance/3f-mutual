import React, { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Card from './Card'
import CardContent from './CardContent'
import Text from './Text'
import Bold from './Bold'
import Button from './Button'
import TextField from './TextField'
import Divider from './Divider'
import ProgressBar from './ProgressBar'
import { ReactComponent as CopyIcon } from '../assets/copy.svg'
import { shortenAddress } from '../utils'

const Row = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 0.5rem;
  }

  > ${Text} {
    margin: 0;
  }
`

const ProfileRow = styled(Row)`
  flex-direction: column;

  > *:not(:first-child) {
    margin-top: 2rem;
    margin-left: 0;
  }

  ${({ theme }) => theme.mediaQuery.md`
    flex-direction: row;

    > *:not(:first-child) {
      margin-top: 0;
      margin-left: 2rem;
    }
  `}
`

const LinkRow = styled.div`
  height: 3rem;
  border: 2px solid ${({ theme }) => theme.colors.gray};
  display: flex;
  justify-content: center;
`

const LinkBox = styled.div`
  padding: 0 1rem;
  flex: 1 1;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: inset 0 0 1rem ${({ theme }) => theme.colors.divider};
  text-align: center;
  line-height: 3rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const CopyButton = styled.button`
  width: 3rem;
  flex-basis: 3rem;
  margin: 0;
  border: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.buttonBackground};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.indicator};
  }
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  margin-left: 1rem;
  font-size: 1rem;
`

const Title = styled.div`
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  text-align: center;
`

const TextBlock = styled.div`
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
`

const SmallButton = styled(Button)`
  height: 2rem;
  width: fit-content;
  padding: 0 1rem;
  font-size: 0.75rem;
`

const EditButton = styled(SmallButton)`
  animation: none;
`

const TextButton = styled.a`
  height: 2rem;
  padding: 0 1rem;
  border-radius: 0.25rem;
  color: ${({ theme }) => theme.colors.buttonBackground};
  font-size: 0.75rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`

const StyledCopyIcon = styled(CopyIcon)`
  width: 1rem;
  height: 1rem;
  color: ${({ theme }) => theme.colors.white};
`

const Avatar = styled.img`
  width: 6rem;
  height: 6rem;
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: 50%;
`

const domain = process.env.REACT_APP_DOMAIN || 'http://localhost:3000/'

export default function Profile(props) {
  const {
    account = '',
    id = '',
    name = '',
    level = 0,
    points = 0,
    pointsMax = 0,
    canUpgrade = false,
    onUpgrade = () => {},
    isLoggedIn = false,
    avatar = '',
    activate = () => {},
    remark = '',
    onSaveRemark = () => {},
  } = props

  const { t } = useTranslation()

  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const handleUpgrade = useCallback(async () => {
    try {
      setIsPending(true)
      setErrorMessage()
      await onUpgrade()
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsPending(false)
    }
  }, [onUpgrade])

  const [isEditable, setIsEditable] = useState(false)

  const [localRemark, setLocalRemark] = useState(remark)
  const canSave = useMemo(() => localRemark !== remark, [localRemark, remark])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState()
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)
      setSaveError()
      await onSaveRemark(localRemark)
      setIsEditable(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setIsSaving(false)
    }
  }, [localRemark, onSaveRemark])

  return (
    <Card>
      <CardContent>
        <ProfileRow>
          {avatar && <Avatar src={`https://ipfs.infura.io/ipfs/${avatar}`} alt='avatar' />}
          <div>
            <Text>
              <Bold>{t('name')}:</Bold> <span>{name}</span>
            </Text>
            <Text>
              <Bold>{t('id')}:</Bold> <span>{id}</span>
            </Text>
            <Text>
              <Bold>{t('address')}:</Bold> <span>{shortenAddress(account, 6)}</span>
            </Text>
            <Text>
              <Bold>{t('level')}:</Bold> <span>{level}</span>
            </Text>
            <Row>
              <ProgressBar percentage={points / pointsMax} />
              <Text>
                ({points} / {pointsMax})
              </Text>
            </Row>
            <Row>
              <SmallButton disabled={!canUpgrade || isPending} onClick={handleUpgrade}>
                {isPending ? t('pending') : t('upgrade')}
              </SmallButton>
              {isLoggedIn ? (
                <TextButton 
                  as='a'
                  href={`https://3box.io/${account}`}
                  target='_blank'
                >
                  {t('3boxEdit')}
                </TextButton>
              ) : (
                <TextButton 
                  as='a'
                  href={`https://3box.io/login?wallet=metamask`}
                  target='_blank'
                  onClick={activate}
                >
                  {t('3boxConnect')}
                </TextButton>
              )}
            </Row>
            <Text error>{errorMessage}</Text>
          </div>
        </ProfileRow>
        <Title>{t('referralLinks')}</Title>
        <LinkRow>
          <LinkBox>{`${domain}${id}`}</LinkBox>
          <CopyToClipboard text={`${domain}${id}`}>
            <CopyButton>
              <StyledCopyIcon />
            </CopyButton>
          </CopyToClipboard>
        </LinkRow>
        <LinkRow>
          <LinkBox>{`${domain}${name}`}</LinkBox>
          <CopyToClipboard text={`${domain}${name}`}>
            <CopyButton>
              <StyledCopyIcon />
            </CopyButton>
          </CopyToClipboard>
        </LinkRow>
        <LinkRow>
          <LinkBox>{`${domain}${shortenAddress(account)}`}</LinkBox>
          <CopyToClipboard text={`${domain}${account}`}>
            <CopyButton>
              <StyledCopyIcon />
            </CopyButton>
          </CopyToClipboard>
        </LinkRow>
      </CardContent>
      <Divider />
      <CardContent>
        {isEditable ? (
          <>
            <TextField
              multiline
              height='6rem'
              label={t('remarkLabel')}
              placeholder={t('remarkPlaceholder')}
              value={localRemark}
              onChange={event => setLocalRemark(event.target.value)}
            />
            <Text error>{saveError}</Text>
            <Row>
              <EditButton
                onClick={() => setIsEditable(false)}
              >
                {t('cancel')}
              </EditButton>
              <SmallButton
                disabled={!canSave || isSaving}
                onClick={handleSave}
              >
                {isSaving ? t('saving') : t('saveChange')}
              </SmallButton>
            </Row>
          </>
        ) : (
          <>
            <Label>{t('remarkLabel')}</Label>
            {localRemark && (
              <TextBlock>
                <Text>{localRemark}</Text>
              </TextBlock>
            )}
            <EditButton onClick={() => setIsEditable(true)}>
              {!!localRemark ? t('edit') : t('add')}
            </EditButton>
          </>
        )}
      </CardContent>
    </Card>
  )
}
