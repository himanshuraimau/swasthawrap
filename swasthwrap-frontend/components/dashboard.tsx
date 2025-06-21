"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Home,
  MessageCircle,
  FileText,
  User,
  SettingsIcon,
  Bell,
  Upload,
  Activity,
  Heart,
  Calendar,
  Pill,
  Clock,
  Target,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import AIChatbot from "./ai-chatbot"
import MedicalHistory from "./medical-history"
import HealthProfile from "./health-profile"
import Settings from "./settings"

const mockDashboardData = {
  healthTips: [
    { en: "Drink 8 glasses of water daily", hi: "दिन में 8 गिलास पानी पिएं", ta: "தினமும் 8 கிளாஸ் தண்ணீர் குடிக்கவும்" },
    { en: "Take 10,000 steps today", hi: "आज 10,000 कदम चलें", ta: "தினமும் 8 கிளாஸ் தண்ணீர் குடிக்கவும்" },
    { en: "Get 7-8 hours of sleep", hi: "7-8 घंटे की नींद लें", ta: "7-8 மணி நேர தூக்கம் பெறுங்கள்" },
  ],
  quickStats: {
    totalReports: 15,
    chatSessions: 43,
    healthGoalsAchieved: 8,
    medicationsTracked: 5,
  },
  recentActivity: [
    { type: "chat", content: "Asked about diabetes management", time: "2 hours ago", icon: "💬" },
    { type: "upload", content: "Uploaded blood test report", time: "1 day ago", icon: "📋" },
    { type: "medication", content: "Took morning medications", time: "1 day ago", icon: "💊" },
    { type: "goal", content: "Completed daily water intake", time: "2 days ago", icon: "🎯" },
  ],
  upcomingReminders: [
    { type: "appointment", title: "Dr. Sharma Consultation", time: "Today, 3:00 PM", urgent: true },
    { type: "medication", title: "Evening Medication", time: "Today, 8:00 PM", urgent: false },
    { type: "checkup", title: "Blood Pressure Check", time: "Tomorrow, 9:00 AM", urgent: false },
  ],
}

const navigationItems = [
  { icon: Home, label: "Dashboard", id: "dashboard", active: true },
  { icon: MessageCircle, label: "AI Health Chat", id: "chat" },
  { icon: FileText, label: "Medical History", id: "history" },
  { icon: User, label: "Health Profile", id: "profile" },
  { icon: SettingsIcon, label: "Settings", id: "settings" },
]

export default function Dashboard({ user }) {
  const [currentTip, setCurrentTip] = useState(0)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % mockDashboardData.healthTips.length)
    }, 5000)

    return () => clearInterval(tipInterval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("swasthwrap_user")
    window.location.reload()
  }

  const renderContent = () => {
    switch (activeSection) {
      case "chat":
        return <AIChatbot user={user} />
      case "history":
        return <MedicalHistory user={user} />
      case "profile":
        return <HealthProfile user={user} />
      case "settings":
        return <Settings user={user} />
      default:
        return renderDashboardContent()
    }
  }

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Welcome Section with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3ECF8E]/20 via-[#262626] to-[#1F1F1F] p-8 border border-[#3ECF8E]/20"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3ECF8E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#3ECF8E]/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {getGreeting()}, {user.name.split(" ")[0]}! 👋
              </h2>
              <p className="text-[#A3A3A3] text-lg">Ready to take charge of your health today?</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-[#3ECF8E] mb-1">{user.healthScore}</div>
              <div className="text-[#A3A3A3] text-sm">Health Score</div>
              <div className="w-16 h-1 bg-[#3ECF8E] rounded-full mt-2 ml-auto" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-8">
          {/* Quick Stats with Modern Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <div className="w-1 h-6 bg-[#3ECF8E] rounded-full mr-3" />
              Quick Overview
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  value: mockDashboardData.quickStats.totalReports,
                  label: "Reports",
                  color: "from-blue-500/20 to-blue-600/5",
                },
                {
                  icon: MessageCircle,
                  value: mockDashboardData.quickStats.chatSessions,
                  label: "AI Chats",
                  color: "from-purple-500/20 to-purple-600/5",
                },
                {
                  icon: Target,
                  value: mockDashboardData.quickStats.healthGoalsAchieved,
                  label: "Goals",
                  color: "from-green-500/20 to-green-600/5",
                },
                {
                  icon: Pill,
                  value: mockDashboardData.quickStats.medicationsTracked,
                  label: "Medications",
                  color: "from-orange-500/20 to-orange-600/5",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} backdrop-blur-sm border border-white/10 p-6 hover:scale-105 transition-all duration-300 group cursor-pointer`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all duration-300" />
                  <div className="relative z-10">
                    <stat.icon
                      className="text-[#3ECF8E] mb-4 group-hover:scale-110 transition-transform duration-300"
                      size={28}
                    />
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-[#A3A3A3] text-sm font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity with Modern Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-gradient-to-br from-[#262626] to-[#1F1F1F] border border-[#404040]/50 overflow-hidden"
          >
            <div className="p-8 border-b border-[#404040]/30">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Activity className="mr-3 text-[#3ECF8E]" size={24} />
                Recent Activity
              </h3>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {mockDashboardData.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-r from-[#1F1F1F] to-[#262626] hover:from-[#262626] hover:to-[#1F1F1F] transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E]/10 flex items-center justify-center text-2xl group-hover:bg-[#3ECF8E]/20 transition-colors duration-300">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">{activity.content}</p>
                      <p className="text-[#A3A3A3] text-xs">{activity.time}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#3ECF8E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          {/* Health Score with Circular Progress */}
          <motion.div className="rounded-3xl bg-gradient-to-br from-[#262626] to-[#1F1F1F] border border-[#404040]/50 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#3ECF8E]/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-center">
                <Heart className="mr-2 text-[#3ECF8E]" size={20} />
                Health Score
              </h3>
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#404040" strokeWidth="8" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#healthGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - user.healthScore / 100)}`}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3ECF8E" />
                      <stop offset="100%" stopColor="#2DD4BF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{user.healthScore}</span>
                </div>
              </div>
              <p className="text-[#A3A3A3] text-sm font-medium">
                {user.healthScore >= 90
                  ? "🎉 Excellent"
                  : user.healthScore >= 80
                    ? "😊 Good"
                    : user.healthScore >= 70
                      ? "👍 Fair"
                      : "⚠️ Needs Attention"}
              </p>
            </div>
          </motion.div>

          {/* Upcoming Reminders */}
          <div className="rounded-3xl bg-gradient-to-br from-[#262626] to-[#1F1F1F] border border-[#404040]/50 overflow-hidden">
            <div className="p-6 border-b border-[#404040]/30">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Clock className="mr-2 text-[#3ECF8E]" size={20} />
                Upcoming
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockDashboardData.upcomingReminders.map((reminder, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start space-x-3 p-4 rounded-2xl bg-gradient-to-r from-[#1F1F1F] to-[#262626] hover:from-[#262626] hover:to-[#1F1F1F] transition-all duration-300 group"
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${reminder.urgent ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF]"} shadow-lg`}
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">{reminder.title}</p>
                      <p className="text-[#A3A3A3] text-xs">{reminder.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions with Modern Buttons */}
          <div className="rounded-3xl bg-gradient-to-br from-[#262626] to-[#1F1F1F] border border-[#404040]/50 overflow-hidden">
            <div className="p-6 border-b border-[#404040]/30">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <Button className="w-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#3ECF8E] text-black font-medium rounded-2xl h-12 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Upload className="mr-2" size={16} />
                Upload Report
              </Button>
              <Button className="w-full bg-gradient-to-r from-[#1F1F1F] to-[#262626] border border-[#404040] text-white hover:border-[#3ECF8E] rounded-2xl h-12 transition-all duration-300 transform hover:scale-105">
                <MessageCircle className="mr-2" size={16} />
                Start AI Chat
              </Button>
              <Button className="w-full bg-gradient-to-r from-[#1F1F1F] to-[#262626] border border-[#404040] text-white hover:border-[#3ECF8E] rounded-2xl h-12 transition-all duration-300 transform hover:scale-105">
                <Calendar className="mr-2" size={16} />
                Schedule Checkup
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )

  const getGreeting = () => {
    const hour = new Date().getHours()
    const greetings = {
      en: hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening",
      hi: hour < 12 ? "सुप्रभात" : hour < 17 ? "नमस्कार" : "शुभ संध्या",
      ta: hour < 12 ? "காலை வணக்கம்" : hour < 17 ? "மதிய வணக்கம்" : "மாலை வணக்கம்",
    }
    return greetings[user.language] || greetings.en
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-[#1F1F1F] border-r border-[#404040] flex flex-col"
      >
        {/* User Profile Section */}
        <div className="p-8 border-b border-[#404040]/30">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3ECF8E] to-[#2DD4BF] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-xl">{user.name.charAt(0)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-[#1F1F1F]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">{user.name}</h3>
              <p className="text-[#A3A3A3] text-sm">Health Score: {user.healthScore}</p>
            </div>
          </div>

          {/* Health Score Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#A3A3A3]">Health Score</span>
              <span className="text-[#3ECF8E] font-semibold">{user.healthScore}/100</span>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-[#404040] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${user.healthScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-3">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] text-black shadow-lg transform scale-105"
                      : "text-[#A3A3A3] hover:text-white hover:bg-gradient-to-r hover:from-[#262626] hover:to-[#2A2A2A] hover:scale-105"
                  }`}
                >
                  <item.icon
                    size={22}
                    className={`transition-transform duration-300 ${activeSection === item.id ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  <span className="font-medium text-base">{item.label}</span>
                  {activeSection === item.id && <div className="ml-auto w-2 h-2 rounded-full bg-black" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-[#404040]/30">
          <Button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-[#1F1F1F] to-[#262626] border border-[#404040] text-[#A3A3A3] hover:border-red-500 hover:text-red-400 rounded-2xl h-12 transition-all duration-300 transform hover:scale-105"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-[#262626] via-[#2A2A2A] to-[#262626] border-b border-[#404040]/30 backdrop-blur-xl"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#A3A3A3] bg-clip-text text-transparent">
                  {getGreeting()}, {user.name.split(" ")[0]}!
                </h1>
                <p className="text-[#A3A3A3] mt-2 text-lg">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-[#1F1F1F] to-[#262626] border-[#404040] text-[#A3A3A3] hover:border-[#3ECF8E] hover:text-white relative rounded-2xl h-12 px-6 transition-all duration-300"
                >
                  <Bell size={18} />
                  {notifications > 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                      {notifications}
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Health Tip with Modern Design */}
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1F1F1F] via-[#262626] to-[#1F1F1F] border border-[#3ECF8E]/20 p-6"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#3ECF8E]/5 rounded-full blur-2xl" />
              <div className="relative z-10 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E]/10 flex items-center justify-center text-2xl">
                  💡
                </div>
                <div className="flex-1">
                  <p className="text-[#3ECF8E] text-sm font-semibold mb-2">Today's Health Tip</p>
                  <p className="text-white text-base leading-relaxed">
                    {mockDashboardData.healthTips[currentTip][user.language] ||
                      mockDashboardData.healthTips[currentTip].en}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  )
}
