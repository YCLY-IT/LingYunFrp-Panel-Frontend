export const viewportOnce = { once: true, amount: 0.25 }
export const viewportRepeat = { once: false, amount: 0.15 }

export const springSnappy = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.8,
}

export const springSoft = {
  type: 'spring',
  stiffness: 210,
  damping: 26,
  mass: 1,
}

export const easeOutExpo = { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
export const easeOutSoft = { duration: 0.32, ease: [0.33, 1, 0.68, 1] }
export const quickFade = { duration: 0.18, ease: 'easeOut' }

export const distance = {
  sm: 12,
  md: 24,
  lg: 40,
}

export const fadeUp = {
  hidden: { opacity: 0, y: distance.md },
  show: { opacity: 1, y: 0, transition: easeOutExpo },
}

export const fadeUpSm = {
  hidden: { opacity: 0, y: distance.sm },
  show: { opacity: 1, y: 0, transition: easeOutSoft },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: easeOutSoft },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: springSnappy },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -distance.lg },
  show: { opacity: 1, x: 0, transition: easeOutExpo },
}

export const slideInRight = {
  hidden: { opacity: 0, x: distance.lg },
  show: { opacity: 1, x: 0, transition: easeOutExpo },
}

export const blurIn = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: distance.sm },
  show: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: easeOutExpo,
  },
}

export const staggerContainer = (
  staggerChildren = 0.07,
  delayChildren = 0,
) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
})

export const hoverLift = { y: -4, transition: springSnappy }

export const hoverLiftShadow = {
  y: -6,
  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
  transition: springSnappy,
}

export const hoverLiftShadowStrong = {
  y: -10,
  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.16)',
  transition: springSnappy,
}

export const hoverScale = { scale: 1.025, transition: springSnappy }

export const pressDown = { scale: 0.975, transition: quickFade }

export const listItem = {
  hidden: { opacity: 0, y: distance.md, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: springSoft },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: -distance.sm,
    transition: quickFade,
  },
}
