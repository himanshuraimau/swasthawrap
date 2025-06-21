"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Heart, Activity, Pill, Stethoscope } from "lucide-react"
import LoginForm from "@/components/login-form"

const healthTips = [
  {
    en: "Stay hydrated for better health",
    hi: "बेहतर स्वास्थ्य के लिए हाइड्रेटेड रहें",
    ta: "நல்ல ஆரோக்கியத்திற்கு நீர்ச்சத்து பராமரிக்கவும்",
  },
  { en: "Exercise daily for 30 minutes", hi: "रोजाना 30 मिनट व्यायाम करें", ta: "தினமும் 30 நிமிடங்கள் உடற்பயிற்சி செய்யுங்கள்" },
  { en: "Get 7-8 hours of quality sleep", hi: "7-8 घंटे की गुणवत्तापूर्ण नींद लें", ta: "7-8 மணி நேர தரமான தூக்கம் பெறுங்கள்" },
]

const languages = [
  { code: "en", name: "English", greeting: "Welcome to SwasthWrap" },
  { code: "hi", name: "हिंदी", greeting: "स्वास्थ्यरैप में आपका स्वागत है" },
  { code: "ta", name: "தமிழ்", greeting: "SwasthWrap இல் உங்களை வரவேற்கிறோம்" },
]

export default function HomePage() {
  const [currentTip, setCurrentTip] = useState(0)
  const [currentLang, setCurrentLang] = useState(0)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length)
    }, 4000)

    const langInterval = setInterval(() => {
      setCurrentLang((prev) => (prev + 1) % languages.length)
    }, 3000)

    const timer = setTimeout(() => {
      setShowLogin(true)
    }, 2000)

    return () => {
      clearInterval(tipInterval)
      clearInterval(langInterval)
      clearTimeout(timer)
    }
  }, [])

  const floatingIcons = [
    { Icon: Heart, delay: 0, x: 20, y: 30 },
    { Icon: Activity, delay: 0.5, x: 80, y: 20 },
    { Icon: Pill, delay: 1, x: 15, y: 70 },
    { Icon: Stethoscope, delay: 1.5, x: 85, y: 80 },
  ]

  if (showLogin) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F1F1F] to-[#262626] flex items-center justify-center relative overflow-hidden">
      {/* Floating Health Icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute text-[#3ECF8E] opacity-20"
          style={{ left: `${x}%`, top: `${y}%` }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Icon size={40} />
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center z-10"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-[#3ECF8E] rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-black" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SwasthWrap</h1>
          <p className="text-[#A3A3A3] text-lg">Your AI Health Companion</p>
        </motion.div>

        {/* Rotating Language Greetings */}
        <motion.div
          key={currentLang}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl text-white font-medium">{languages[currentLang].greeting}</h2>
        </motion.div>

        {/* Health Tips Carousel */}
        <motion.div
          key={currentTip}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-[#262626] border border-[#404040] rounded-lg p-4 max-w-md mx-auto"
        >
          <p className="text-[#A3A3A3] text-sm mb-2">💡 Health Tip</p>
          <p className="text-white">{healthTips[currentTip].en}</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-[#3ECF8E] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#3ECF8E] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-[#3ECF8E] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-[#A3A3A3] mt-2 text-sm">Initializing your health journey...</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
