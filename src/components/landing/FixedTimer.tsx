'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface FixedTimerProps {
  endDate: Date
  backgroundColor?: string
  textColor?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const FixedTimer = ({
  endDate,
  backgroundColor = '#000000',
  textColor = '#FFFFFF',
}: FixedTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-50 bottom-4 right-4 md:bottom-6 md:right-6 md:left-auto left-1/2 md:left-auto transform md:transform-none -translate-x-1/2 md:translate-x-0"
    >
      <div
        style={{ backgroundColor, color: textColor }}
        className="rounded-lg shadow-2xl p-3 md:p-4 border-2 border-white/20 backdrop-blur-sm"
      >
        <div className="text-xs md:text-sm font-bold mb-2 text-center">
          ⏰ Termina em:
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-[8px] md:text-xs opacity-80">d</div>
          </div>
          <div className="text-lg md:text-2xl font-bold opacity-50">:</div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[8px] md:text-xs opacity-80">h</div>
          </div>
          <div className="text-lg md:text-2xl font-bold opacity-50">:</div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[8px] md:text-xs opacity-80">m</div>
          </div>
          <div className="text-lg md:text-2xl font-bold opacity-50">:</div>
          <div className="text-center">
            <div className="text-lg md:text-2xl font-bold">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[8px] md:text-xs opacity-80">s</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

