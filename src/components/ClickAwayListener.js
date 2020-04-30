import React, { useEffect, useRef } from 'react'

export default function ClickAwayListener({
  onClickAway,
  mouseEvent = 'click',
  touchEvent = 'touchend',
  children,
}) {
  let node = useRef(null)

  useEffect(() => {
    const handleEvents = event => {
      if (node.current && node.current.contains(event.target)) {
        return
      }

      onClickAway()
    }

    document.addEventListener(mouseEvent, handleEvents)
    document.addEventListener(touchEvent, handleEvents)

    return () => {
      document.removeEventListener(mouseEvent, handleEvents)
      document.removeEventListener(touchEvent, handleEvents)
    }
  })

  return <div ref={node}>{children}</div>
}
