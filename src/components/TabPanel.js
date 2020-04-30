export default function TabPanel(props) {
  const { value, index, children } = props

  return value === index && children
}
