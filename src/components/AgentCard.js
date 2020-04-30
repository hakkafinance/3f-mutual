import React from 'react'
import styled from 'styled-components'
import Card from './Card'
import CardContent from './CardContent'
import Text from './Text'
import Bold from './Bold'

const Row = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  flex-direction: column;

  > *:not(:first-child) {
    margin-top: 2rem;
    margin-left: 0;
  }
  
  > ${Text} {
    margin: 0;
  }

  ${({ theme }) => theme.mediaQuery.md`
    flex-direction: row;

    > *:not(:first-child) {
      margin-top: 0;
      margin-left: 2rem;
    }
  `}
`

const Avatar = styled.img`
  width: 6rem;
  height: 6rem;
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: 50%;
`

const NoteText = styled(Text)`
  font-size: 0.75rem;
  font-style: italic;
`

const Greeting = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
  font-style: italic;
`

export default function AgentCard(props) {
  const { isAgent = false, name = '', id = 0, level = 0, greeting = '', image = '' } = props

  return (
    <Card>
      <CardContent>
        {isAgent ? (
          <>
            <Row>
              {!!image.length && <Avatar src={image} alt='agent avatar' />}
              <div>
                <Text>
                  <Bold>Your Agent's Name:</Bold> {name}
                </Text>
                <Text>
                  <Bold>Your Agent's ID:</Bold> {id}
                </Text>
                <Text>
                  <Bold>Your Agent's Level:</Bold> {level}
                </Text>
                <NoteText>
                  * Agent is the person to promote you to buy insurance.
                </NoteText>
              </div>
            </Row>
            <Greeting>{greeting}</Greeting>
          </>
        ) : (
          <Text>
            <Bold>You don't have any agent!</Bold>
          </Text>
        )}
      </CardContent>
    </Card>
  )
}
