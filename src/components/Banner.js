import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Container from './Container'

const BannerWrapper = styled.section`
  background-color: ${({ theme }) => theme.colors.white};
`

const BannerContainer = styled(Container)`
  flex-direction: column;

  ${({ theme }) => theme.mediaQuery.sm`
    flex-direction: row;
  `}
`

const BannerItem = styled.article`
  flex: 1 1;
  padding: 2.5rem 0;
  text-align: center;

  > *:not(:first-child) {
    margin-top: 1.25rem;
  }
`

const Title = styled.div`
  font-size: 1rem;
`

const NumberText = styled.div`
  font-size: 1.5rem;
`

export default function Banner(props) {
  const {
    pot = 0,
    totalShares = 0,
    totalInsurances = 0,
    totalAgents = 0,
  } = props
  const { t } = useTranslation()

  return (
    <BannerWrapper>
      <BannerContainer flex>
        <BannerItem>
          <Title>{t('ethInPool')}</Title>
          <NumberText>{pot}</NumberText>
        </BannerItem>
        <BannerItem>
          <Title>{t('totalShares')}</Title>
          <NumberText>{totalShares}</NumberText>
        </BannerItem>
        <BannerItem>
          <Title>{t('allActiveInsurances')}</Title>
          <NumberText>{totalInsurances}</NumberText>
        </BannerItem>
        <BannerItem>
          <Title>{t('agents')}</Title>
          <NumberText>{totalAgents}</NumberText>
        </BannerItem>
      </BannerContainer>
    </BannerWrapper>
  )
}
