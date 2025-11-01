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
      className="fixed z-40 bottom-24 md:bottom-28 right-4 md:right-6 left-1/2 md:left-auto transform md:transform-none -translate-x-1/2 md:translate-x-0"
    >
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-xl shadow-2xl p-3 md:p-4 border-2 border-gray-600 backdrop-blur-sm"
      >
        <div className="text-xs md:text-sm font-bold mb-2 text-center text-white drop-shadow-lg">
          ⏰ Termina em:
        </div>
        <div className="flex items-center gap-1 md:gap-1.5">
          <div className="text-center bg-black rounded-lg px-2 md:px-3 py-1.5 border-2 border-white/30 min-w-[40px] md:min-w-[50px] shadow-lg">
            <div className="text-base md:text-xl font-bold text-white font-mono drop-shadow-md">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-[7px] md:text-[9px] text-gray-200 uppercase tracking-wide font-semibold">d</div>
          </div>
          <div className="text-sm md:text-lg font-bold text-red-500 drop-shadow-lg">:</div>
          <div className="text-center bg-black rounded-lg px-2 md:px-3 py-1.5 border-2 border-white/30 min-w-[40px] md:min-w-[50px] shadow-lg">
            <div className="text-base md:text-xl font-bold text-white font-mono drop-shadow-md">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[7px] md:text-[9px] text-gray-200 uppercase tracking-wide font-semibold">h</div>
          </div>
          <div className="text-sm md:text-lg font-bold text-red-500 drop-shadow-lg">:</div>
          <div className="text-center bg-black rounded-lg px-2 md:px-3 py-1.5 border-2 border-white/30 min-w-[40px] md:min-w-[50px] shadow-lg">
            <div className="text-base md:text-xl font-bold text-white font-mono drop-shadow-md">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[7px] md:text-[9px] text-gray-200 uppercase tracking-wide font-semibold">m</div>
          </div>
          <div className="text-sm md:text-lg font-bold text-red-500 drop-shadow-lg">:</div>
          <div className="text-center bg-black rounded-lg px-2 md:px-3 py-1.5 border-2 border-white/30 min-w-[40px] md:min-w-[50px] shadow-lg">
            <div className="text-base md:text-xl font-bold text-white font-mono drop-shadow-md">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[7px] md:text-[9px] text-gray-200 uppercase tracking-wide font-semibold">s</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

