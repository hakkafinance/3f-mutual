import React, { useMemo } from 'react'
import styled from 'styled-components'
import createPlotlyComponent from 'react-plotly.js/factory'
import Plotly from 'plotly.js-basic-dist'

const Plot = createPlotlyComponent(Plotly)

const StyledPlot = styled(Plot)`
  height: 450px;
`

const layout = {
  height: 450,
  xaxis: {
    title: 'days after',
    rangemode: 'tozero',
    dtick: 5,
    fixedrange: true,
    showline: true,
    autoMargin: true,
  },
  yaxis: {
    title: 'units of insurance left',
    rangemode: 'tozero',
    fixedrange: true,
    showline: true,
  },
  yaxis2: {
    title: 'estimated compensation per unit',
    rangemode: 'tozero',
    fixedrange: true,
    showline: true,
    showgrid: false,
    titlefont: {color: 'rgb(76, 175, 80)'},
    tickfont: {color: 'rgb(76, 175, 80)'},
    overlaying: 'y',
    side: 'right'
  },
  legend: {
    orientation: 'h',
    x: 0.5,
    xanchor: 'center',
    y: 1.1,
    yanchor: 'top',
  },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'rgba(255, 255, 255, .4)',
  margin: { l: 80, r: 80, t: 20, b: 60 },
  font: { size: 14 },
}

const config = {
  responsive: true,
  displayModeBar: false,
}

export default function LineChart(props) {
  const {
    value = [],
    chartStyles = {},
    value2 = [],
    chart2Styles = {}
  } = props
  const x = useMemo(() => value.map((v, i) => i), [value])
  const x2 = useMemo(() => value2.map((v, i) => i), [value2])

  const data = useMemo(() => {
    return value2.length === 0
      ? [
          {
            x: x,
            y: value,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'units',
            ...chartStyles,
          }
        ]
      : [
          {
            x: x,
            y: value,
            type: 'scatter',
            name: 'units',
            mode: 'lines+markers',
            ...chartStyles,
          },
          {
            x: x2,
            y: value2,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'compensation',
            yaxis: 'y2',
            ...chart2Styles,
          }
        ]
  }, [chart2Styles, chartStyles, value, value2, x, x2])

  return <StyledPlot data={data} layout={layout} config={config} />
}
