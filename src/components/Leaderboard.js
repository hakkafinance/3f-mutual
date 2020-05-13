import React from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import Card from './Card'
import CardContent from './CardContent'
import Bold from './Bold'
import EtheremIcon from './EthereumIcon'
import FirstPlace from '../assets/first-place.png'
import SecondPlace from '../assets/second-place.png'
import ThirdPlace from '../assets/third-place.png'

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th, td {
    height: 64px;
    padding: 0 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
    color: ${({ theme }) => theme.colors.textColor};
    font-size: 12px;
    font-weight: 500;
    font-family: ${({ theme }) => theme.fontFamilies.notoSans};
    letter-spacing: 1px;
    text-align: center;
    text-overflow: ellipsis;
  }

  th {
    font-size: 14px;
  }
`

const InlineCenter = styled.div`
  width: 100%;
  height: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`

export default function Leaderboard(props) {
  const { agents = [] } = props

  const renderRank = (rank) => {
    if (rank === 1) {
      return <img src={FirstPlace} alt='first-place' />
    } else if (rank === 2) {
      return <img src={SecondPlace} alt='second-place' />
    } else if (rank === 3) {
      return <img src={ThirdPlace} alt='third-place' />
    } else {
      return <Bold>{rank}</Bold>
    }
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Level</th>
              <th>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => (
              <tr key={agent.agentId}>
                <td>
                  <InlineCenter>
                    {renderRank(index + 1)}
                  </InlineCenter>
                </td>
                <td>{agent.name}</td>
                <td>{agent.level}</td>
                <td>
                  <InlineCenter>
                    {ethers.utils.formatEther(agent.accumulatedRef).slice(0, 6)}{' '}
                    <EtheremIcon />
                  </InlineCenter>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  )
}
