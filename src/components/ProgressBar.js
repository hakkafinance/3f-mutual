import React from 'react'
import styled from 'styled-components'

const Tracker = styled.div`
  position: relative;
  width: 10rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  background-color: #fafafa;
  box-shadow: inset 0 0 0.5rem ${({ theme }) => theme.colors.divider};
`

const ProgressInTracker = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ percentage }) => `${Math.min(10 * percentage, 10)}rem`};
  height: 1.25rem;
  border-radius: 0.25rem;
  background-color: ${({ theme }) => theme.colors.indicator};
`

const ProgressPercentage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.colors.white};
  text-shadow: 1px 1px 1px ${({ theme }) => theme.colors.primary},
    1px -1px 1px ${({ theme }) => theme.colors.primary},
    -1px 1px 1px ${({ theme }) => theme.colors.primary},
    -1px -1px 1px ${({ theme }) => theme.colors.primary};
`

export default function ProgressBar(props) {
  const { percentage } = props

  return (
    <Tracker>
      <ProgressInTracker percentage={percentage} />
      <ProgressPercentage>{`${(percentage * 100).toFixed(
        2,
      )}%`}</ProgressPercentage>
    </Tracker>
  )
}
