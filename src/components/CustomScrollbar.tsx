import { useEffect, useRef, useState } from 'react'

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

// TODO - Make draggable
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
    zIndex = 100,
    scrollbarThickness = 6,
    borderRadius = 3,
    backgroundColor = 'rgba(157, 165, 204, 0.5)'
  }: CustomScrollbarProps
  ) => {

  const customScrollbarRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState<boolean>(true)

  /**
   * Fade out scrollbar after delay
   */
  useEffect(() => {
    if (customScrollbarRef.current) {
      if (show) {
        customScrollbarRef.current.style.transition = 'opacity .2s'

        const timer = setTimeout(() => {
          const { current: customScrollbarEl } = customScrollbarRef

          if (customScrollbarEl) {
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

  }, [show])

  useEffect(() => {
    if (!scrollElementRef.current) {
      return
    }

    scrollElementRef.current.addEventListener('scroll', handleScroll)
    /* * */
    return () => {
      if (!scrollElementRef.current) {
        return
      }

      scrollElementRef.current.removeEventListener('scroll', handleScroll)
      /* * */
    }
  }, [])

  /**
   * 1. If positionFixed prop is enabled,
   *    setting fixed position values for custom scrollbar.
   *
   * 2. If not fixed, position inside of container.
   *
   * 3. Setting styles from props.
   */
  useEffect(() => {
    const { current: customScrollbarEl } = customScrollbarRef

    if (customScrollbarEl) {
      /**
       * 1.
       */
      if (positionFixed) {
        customScrollbarEl.style.position = 'fixed'

        if (positionFixedTop) {
          customScrollbarEl.style.top = `${positionFixedTop}px`
        } else {
          customScrollbarEl.style.bottom = '0px'
        }

        if (positionFixedLeft) {
          customScrollbarEl.style.left = `${positionFixedLeft}px`
        } else {
          customScrollbarEl.style.right = '0px'
        }

        customScrollbarEl.style.left = `${positionFixedLeft}px`
      }
      /**
       * 2.
       */
      else {
        customScrollbarEl.style.position = 'absolute'

        switch(orientation) {
          case 'verticalLeft':
            customScrollbarEl.style.top = '0'
            customScrollbarEl.style.left = '0'
            break

          case 'verticalRight':
            customScrollbarEl.style.top = '0'
            customScrollbarEl.style.right = '0'
            break

          case 'horizontalTop':
            customScrollbarEl.style.left = '0'
            customScrollbarEl.style.top = '0'
            break

          case 'horizontalBottom':
            customScrollbarEl.style.left = '0'
            customScrollbarEl.style.bottom = '0'
            break
        }
      }

      /**
       * 3.
       */
      if (orientation === 'verticalLeft' || orientation === 'verticalRight') {
        customScrollbarEl.style.width = `${scrollbarThickness}px`
      } else {
        customScrollbarEl.style.height = `${scrollbarThickness}px`
      }

      customScrollbarEl.style.zIndex = `${zIndex}`
      customScrollbarEl.style.borderRadius = `${borderRadius}px`
      customScrollbarEl.style.backgroundColor = backgroundColor
    }
  }, [])

  const handleScrollX = () => {
    if (
      !containerElementRef.current
      || !scrollElementRef.current
      || !customScrollbarRef.current
    ) {
      return
    }

    // Scroll values
    const fullWidth = containerElementRef.current.getBoundingClientRect().width
    const maxScrollX = scrollElementRef.current.scrollWidth - scrollElementRef.current.clientWidth

    // Custom scrollbar width
    const dletaHiddenContent = 1 - (maxScrollX / fullWidth)
    const finalWidth = dletaHiddenContent * fullWidth

    /**
     * If scrollElementRef and containerElementRef are same node,
     * the scrolled value need to be doubled
     */
    const multiplier = scrollElementRef === containerElementRef ? 2 : 1

    // Custom scrollbar left position
    const widthDiff = fullWidth - finalWidth
    const deltaScrolled = (scrollElementRef.current.scrollLeft / maxScrollX)
    const finalLeft = widthDiff * deltaScrolled * multiplier


    customScrollbarRef.current.style.width = `${finalWidth}px`
    customScrollbarRef.current.style.left = `${finalLeft + (positionFixedLeft || 0)}px`
  }

  const handleScrollY = () => {
    if (
      !containerElementRef.current
      || !scrollElementRef.current
      || !customScrollbarRef.current
    ) {
      return
    }

    // Scroll values
    const fullHeight = containerElementRef.current.getBoundingClientRect().height
    const maxScrollY = scrollElementRef.current.scrollHeight - scrollElementRef.current.clientHeight

    // Custom scrollbar height
    const deltaHiddenContent = 1 - (maxScrollY / fullHeight)
    const finalHeight = deltaHiddenContent * fullHeight

    /**
     * If scrollElementRef and containerElementRef are same node,
     * the scrolled value need to be doubled
     */
    const multiplier = scrollElementRef === containerElementRef ? 2 : 1

    // Custom scrollbar top position
    const heightDiff = fullHeight - finalHeight
    const deltaScrolled = (scrollElementRef.current.scrollTop / maxScrollY)
    const finalTop = heightDiff * deltaScrolled * multiplier


    customScrollbarRef.current.style.height = `${finalHeight}px`
    customScrollbarRef.current.style.top = `${finalTop + (positionFixedTop || 0)}px`
  }

  const handleScroll = () => {
    setShow(true)

    if (orientation === 'verticalLeft' || orientation === 'verticalRight') {
      handleScrollY()
    } else {
      handleScrollX()
    }
  }

  return (
    <div ref={customScrollbarRef} style={{ opacity: 0 }}></div>
  )
}

export default CustomScrollbar