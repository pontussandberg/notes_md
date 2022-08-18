import React, { useEffect, useRef, useState } from 'react'

type CustomScrollbarProps = {
  /**
   * Ref to element that will act as container element visually,
   * has to be the first parent that is positioned relative.
   */
  containerElementRef: React.RefObject<HTMLDivElement>,

  // Ref to scollable element to mimic.
  scrollElementRef: React.RefObject<HTMLTextAreaElement | HTMLDivElement>,

  // Orientation of scrollbar
  orientation: 'horizontalTop' | 'horizontalBottom' | 'verticalRight' | 'verticalLeft'

  // Settings if element should be positioned as fixed.
  positionFixed?: boolean
  positionFixedTop?: number
  positionFixedLeft?: number

  // Settings
  fadeOutTimerMS?: number

  // CSS settings
  zIndex?: number
  scrollbarThickness?: number
  borderRadius?: number
  backgroundColor?: string
}

// TODO - When $containerElementRef is not taking full space from offset, draggable desont work properly
const CustomScrollbar = (
  {
    orientation,
    containerElementRef,
    scrollElementRef,
    positionFixed,
    positionFixedLeft,
    positionFixedTop,

    // Settings
    fadeOutTimerMS = 3000,
    zIndex = 1000000,
    scrollbarThickness = 6,
    borderRadius = 3,
    backgroundColor = 'rgba(157, 165, 204, 0.5)'
  }: CustomScrollbarProps
  ) => {

  // Refs
  const customScrollbarRef = useRef<HTMLDivElement>(null)
  const customScrollbarContainerRef = useRef<HTMLDivElement>(null)

  // State
  const [show, setShow] = useState<boolean>(true)
  const [mouseOffsetFromScrollbarStart, setMouseOffsetFromScrollbarStart] = useState<number>(0)
  const [isDraggingScrollbar, setIsDraggingScrollbar] = useState(false)
  const [isMouseHoveringScrollbar, setIsMouseHoveringScrollbar] = useState(false)

  // Constants
  const isVerticalScrollbar = orientation === 'verticalLeft' || orientation === 'verticalRight'

  /**
   * Fade out scrollbar after delay
   */
  useEffect(() => {
    if (customScrollbarRef.current) {

      if (show) {
        customScrollbarRef.current.style.transition = 'none'

        const timer = setTimeout(() => {
          const { current: customScrollbarEl } = customScrollbarRef

          if (
            customScrollbarEl
            && !isMouseHoveringScrollbar
          ) {
            customScrollbarEl.style.transition = 'opacity .6s'
            setShow(false)
          }
        }, fadeOutTimerMS)

        /***/
        customScrollbarRef.current.style.opacity = '1'

        return () => {
          clearTimeout(timer)
        }
      } else {
        /***/
        customScrollbarRef.current.style.opacity = '0'
      }
    }

  })

  useEffect(() => {
    if (!scrollElementRef.current) {
      return
    }

    window.addEventListener('resize', initValues)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    scrollElementRef.current.addEventListener('scroll', handleScroll)
    /* * */
    return () => {
      if (!scrollElementRef.current) {
        return
      }

      window.removeEventListener('resize', initValues)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      scrollElementRef.current.removeEventListener('scroll', handleScroll)
      /* * */
    }
  }, [isDraggingScrollbar])

  /**
   * 1. If positionFixed prop is enabled,
   *    setting fixed position values for custom scrollbar.
   *
   * 2. If not fixed, position inside of container.
   *
   * 3. Setting styles from props.
   */
  useEffect(() => {
    initValues()
  }, [])

  const initValues = () => {
    const { current: customScrollbarEl } = customScrollbarRef
    const { current: customScrollbarContainerEl } = customScrollbarContainerRef
    const { current: containerEl } = containerElementRef

    if (customScrollbarContainerEl && customScrollbarEl && containerEl) {
      /**
       * 1.
       */
      if (positionFixed) {
        customScrollbarContainerEl.style.position = 'fixed'

        if (positionFixedTop) {
          customScrollbarContainerEl.style.top = `${positionFixedTop}px`
        } else {
          customScrollbarContainerEl.style.bottom = '0px'
        }

        if (positionFixedLeft) {
          customScrollbarContainerEl.style.left = `${positionFixedLeft}px`
        } else {
          customScrollbarContainerEl.style.right = '0px'
        }
      }

      /**
       * 2.
       */
      else {
        customScrollbarContainerEl.style.position = 'absolute'

        switch(orientation) {
          case 'verticalLeft':
            customScrollbarContainerEl.style.top = '0'
            customScrollbarContainerEl.style.left = '0'
            break

          case 'verticalRight':
            customScrollbarContainerEl.style.top = '0'
            customScrollbarContainerEl.style.right = '0'
            break

          case 'horizontalTop':
            customScrollbarContainerEl.style.left = '0'
            customScrollbarContainerEl.style.top = '0'
            break

          case 'horizontalBottom':
            customScrollbarContainerEl.style.left = '0'
            customScrollbarContainerEl.style.bottom = '0'
            break
        }
      }

      /**
       * 3.
       */
      if (isVerticalScrollbar) {
        customScrollbarEl.style.width = `${scrollbarThickness}px`
        customScrollbarContainerEl.style.width = `${scrollbarThickness}px`
      } else {
        customScrollbarEl.style.height = `${scrollbarThickness}px`
        customScrollbarContainerEl.style.height = `${scrollbarThickness}px`
      }

      const containerRect = containerEl.getBoundingClientRect()
      const fullWidth = containerRect.width
      const fullHeight = containerRect.height

      if (isVerticalScrollbar) {
        customScrollbarContainerEl.style.height = `${fullHeight}px`
      } else {
        customScrollbarContainerEl.style.width = `${fullWidth}px`
      }


      customScrollbarContainerEl.style.zIndex = `${zIndex}`
      customScrollbarEl.style.borderRadius = `${borderRadius}px`
      customScrollbarEl.style.backgroundColor = backgroundColor

      // Set initial scrollbar values on next tick.
      setTimeout(() => {
        if (isVerticalScrollbar) {
          handleScrollY()
        } else {
          handleScrollX()
        }
      })
    }
  }

  const getScrollbarLength = () => {
    if (!customScrollbarRef.current) {
      return 0
    }

    const rect = customScrollbarRef.current.getBoundingClientRect()
    return isVerticalScrollbar ? rect.height : rect.width
  }

  const getScrollbarPosition = () => {
    if (!customScrollbarRef.current) {
      return 0
    }

    return isVerticalScrollbar
      ? customScrollbarRef.current.getBoundingClientRect().top
      : customScrollbarRef.current.getBoundingClientRect().left
  }

  const getScrollbarContainerOffset = () => {
    if (!customScrollbarContainerRef.current) {
      return 0
    }

    const rect = customScrollbarContainerRef.current.getBoundingClientRect()
    return isVerticalScrollbar ? rect.top : rect.left
  }

  const getScrollbarContainerLength = () => {
    if (!customScrollbarContainerRef.current) {
      return 0
    }

    return isVerticalScrollbar
      ? customScrollbarContainerRef.current.getBoundingClientRect().height
      : customScrollbarContainerRef.current.getBoundingClientRect().width
  }

  const getMaxScrollPos = () => {
    if (!scrollElementRef.current) {
      return 0
    }

    return isVerticalScrollbar
    ? scrollElementRef.current.scrollHeight - scrollElementRef.current.clientHeight
    : scrollElementRef.current.scrollWidth - scrollElementRef.current.clientWidth

  }

  const setScrollElementScrollPos = (value: number): boolean => {
    if (!scrollElementRef.current) {
      return false
    }

    isVerticalScrollbar
      ? scrollElementRef.current.scrollTop = value
      : scrollElementRef.current.scrollLeft = value

    return true
  }

  const getScrollbarStartViewportOffset = () => {
    if (!customScrollbarRef.current) {
      return 0
    }

    return isVerticalScrollbar
      ? customScrollbarRef.current.getBoundingClientRect().top + document.documentElement.scrollTop
      : customScrollbarRef.current.getBoundingClientRect().left + document.documentElement.scrollLeft
  }

  /**
   * Getting the multiply factor that will be used to translate SCROLLBAR position to SCROLL position.
   */
  const getMaxScrollToMaxScrollbarPosRatio = () => {
    const scrollbarLength = getScrollbarLength()
    const scrollbarContainerLength = getScrollbarContainerLength()
    const maxScroll = getMaxScrollPos()

    const maxScrollbarOffsetPos = scrollbarContainerLength - scrollbarLength

    return maxScroll / maxScrollbarOffsetPos
  }


  /****************
   * Mouse events *
   ****************/

  const handleMouseEnter = () => {
    if (getMaxScrollPos()) {
      setShow(true)
    }
    setIsMouseHoveringScrollbar(true)
  }

  const handleMouseLeave = () => {
    if (!isDraggingScrollbar) {
      setShow(false)
    }

    setIsMouseHoveringScrollbar(false)
  }

  const handleMouseDown = (isContainerClick?: boolean) => (event: React.MouseEvent) => {
    setIsDraggingScrollbar(true)

    const coordinateKey = isVerticalScrollbar ? 'pageY' : 'pageX'
    const coordinate = event[coordinateKey]
    const scrollElementEl = scrollElementRef.current

    if (isContainerClick && scrollElementEl) {
      const scrollbarLength = getScrollbarLength()
      const scrollbarContainerOffset = getScrollbarContainerOffset()
      const scrollbarPosition = getScrollbarPosition()

      const ratio = getMaxScrollToMaxScrollbarPosRatio()

      if (coordinate < scrollbarPosition) {
        setScrollElementScrollPos(ratio * (coordinate - scrollbarContainerOffset))
        setMouseOffsetFromScrollbarStart(0)
      } else if (coordinate > scrollbarPosition + scrollbarLength) {
        setScrollElementScrollPos(ratio * (coordinate - scrollbarLength - scrollbarContainerOffset))
        setMouseOffsetFromScrollbarStart(getScrollbarLength())
      }
    }
    else {
      const _mouseOffsetFromScrollbarStart = coordinate - getScrollbarStartViewportOffset()
      setMouseOffsetFromScrollbarStart(_mouseOffsetFromScrollbarStart)
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDraggingScrollbar || !scrollElementRef.current) {
      return
    }

    // While dragging scrollbar, disable text select / highlight
    document.body.style.userSelect = 'none'

    const coordinateKey = isVerticalScrollbar ? 'pageY' : 'pageX'
    const mouseCoordinate = event[coordinateKey]
    const percentMouseMoved = (mouseCoordinate - mouseOffsetFromScrollbarStart - getScrollbarContainerOffset()) / (getScrollbarContainerLength() - getScrollbarLength())
    const maxScrollPos = getMaxScrollPos()
    const scrollPos = maxScrollPos * percentMouseMoved

    setScrollElementScrollPos(scrollPos)
  }

  const handleMouseUp = () => {
    // Enable text select / highlight
    document.body.style.userSelect = ''

    setIsDraggingScrollbar(false)
  }

  /**********
   *  ###   *
   **********/


  const handleScrollX = () => {
    if (
      !customScrollbarContainerRef.current
      || !customScrollbarRef.current
      || !scrollElementRef.current
    ) {
      return
    }

    // Scroll values
    const fullWidth = customScrollbarContainerRef.current.getBoundingClientRect().width
    const maxScrollX = scrollElementRef.current.scrollWidth - scrollElementRef.current.clientWidth

    // Custom scrollbar width
    const deltaHiddenContent = 1 - (maxScrollX / fullWidth)
    const finalWidth = deltaHiddenContent * fullWidth

    const min = fullWidth / 10
    const finalWidthCapped = finalWidth < min ? min : finalWidth

    /**
     * If scrollElementRef and containerElementRef are same node,
     * the scrolled value need to be doubled
     */
    const multiplier = scrollElementRef === containerElementRef ? 2 : 1

    // Custom scrollbar left position
    const widthDiff = fullWidth - finalWidthCapped
    const deltaScrolled = (scrollElementRef.current.scrollLeft / maxScrollX)
    const finalLeft = widthDiff * deltaScrolled * multiplier

    customScrollbarRef.current.style.width = `${finalWidthCapped}px`
    customScrollbarRef.current.style.left = `${finalLeft}px`
  }

  const handleScrollY = () => {
    if (
      !customScrollbarContainerRef.current
      || !customScrollbarRef.current
      || !scrollElementRef.current
    ) {
      return
    }

    // Scroll values
    const fullHeight = customScrollbarContainerRef.current.getBoundingClientRect().height
    const maxScrollY = scrollElementRef.current.scrollHeight - scrollElementRef.current.clientHeight

    // Custom scrollbar height
    const deltaHiddenContent = 1 - (maxScrollY / fullHeight)
    const finalHeight = deltaHiddenContent * fullHeight

    const min = fullHeight / 10
    const finalHeightCapped = finalHeight < min ? min : finalHeight

    /**
     * If scrollElementRef and containerElementRef are same node,
     * the scrolled value need to be doubled
     */
    const multiplier = scrollElementRef === containerElementRef ? 2 : 1

    // Custom scrollbar top position
    const heightDiff = fullHeight - finalHeightCapped
    const deltaScrolled = (scrollElementRef.current.scrollTop / maxScrollY)
    const finalTop = heightDiff * deltaScrolled * multiplier

    customScrollbarRef.current.style.height = `${finalHeightCapped}px`
    customScrollbarRef.current.style.top = `${finalTop + (positionFixedTop || 0)}px`
  }

  const handleScroll = () => {
    setShow(true)

    if (isVerticalScrollbar) {
      handleScrollY()
    } else {
      handleScrollX()
    }
  }

  return (
    <div
      ref={customScrollbarContainerRef}
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown(true)}
    >
      <div
        id={!isVerticalScrollbar ? '1' : '0'}
        ref={customScrollbarRef}
        style={{ position: 'absolute', opacity: 0 }}
        onMouseDown={handleMouseDown()}
      ></div>
    </div>
  )
}

export default CustomScrollbar