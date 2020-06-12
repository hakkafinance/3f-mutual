import React from 'react'
import { useTranslation, Trans } from 'react-i18next'
import styled, { keyframes } from 'styled-components'
import Container from './Container'
import Bold from './Bold'
import EthereumIcon from './EthereumIcon'
import JumbotronImage from '../assets/jumbotron-background.svg'
import IllustrationImage from '../assets/illustration.png'

const JumbotronWrapper = styled.section`
  padding-bottom: 2.25rem;
  background-color: ${({ theme }) => theme.colors.primary};
  background-image: url(${JumbotronImage});
  color: ${({ theme }) => theme.colors.white};
`

const Headline = styled.h1`
  margin: 0;
  padding: 3rem 0;
  font-family: 'Noto Serif', serif;
  font-size: 2.8rem;
  letter-spacing: 1.5px;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  transition: font-size 350ms ease-out;

  ${({ theme }) => theme.mediaQuery.md`
    font-size: 3.2rem;
  `}
`

const breathe = keyframes`
  0% {
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 5px 0 rgba(255, 255, 255, 0.5);
  }
  45% {
    background-color: rgba(255, 255, 255, 0.75);
    box-shadow: 0 0 10px 8px rgba(255, 255, 255, 0.5);
  }
  55% {
    background-color: rgba(255, 255, 255, 0.75);
    box-shadow: 0 0 10px 8px rgba(255, 255, 255, 0.5);
  }
  100% {
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 5px 0 rgba(255, 255, 255, 0.5);
  }
`

const Bulletin = styled.div`
  width: fit-content;
  padding: 2rem;
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  background: rgba(255, 255, 255, 0.4);
  font-weight: 500;
  font-size: 1.5rem;
  animation: ${breathe} 3s ease-out infinite;
`

const Illustration = styled.div`
  display: none;

  ${({ theme }) => theme.mediaQuery.md`
    flex: 1 1;
    display: flex;
    justify-content: center;
    align-items: center;
  `}

  > img {
    width: 60%;
  }
`

const Strong = styled(Bold)`
  font-size: 2rem;
`

export default function Jumbotron(props) {
  const { ended, odd } = props
  const { t } = useTranslation()

  return (
    <JumbotronWrapper>
      <Container flex>
        <div>
          <Headline>
            {t('myInsurance')} <br /> {t('yourInsurance')} <br />{t('insuranceForAll')}
          </Headline>
          <Bulletin>
            {ended ? (
              <>
                <div>MakerDAO {t('emergencyShutdown')}</div>
                <div>{t('claimCompensation')}</div>
              </>
            ) : (
              <span>
                <Trans i18nKey='returnIfShutdown'>
                  Get <Strong>{{odd}}</Strong> <EthereumIcon /> if MakerDAO shutdowns today.
                </Trans>
              </span>
            )}
          </Bulletin>
        </div>
        <Illustration>
          <img src={IllustrationImage} alt='illustration' />
        </Illustration>
      </Container>
    </JumbotronWrapper>
  )
}
