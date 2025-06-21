"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Heart, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { mockUsers } from "../mock-users-LLYAER1eHPE9pfBDhpy0YInBrVYi4E"
import Dashboard from "@/components/dashboard"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
]

const healthInterests = [
  { id: "diabetes", label: "Diabetes Management", icon: "🩺" },
  { id: "heart", label: "Heart Health", icon: "❤️" },
  { id: "nutrition", label: "Nutrition & Diet", icon: "🥗" },
  { id: "fitness", label: "Fitness & Exercise", icon: "💪" },
  { id: "mental", label: "Mental Health", icon: "🧠" },
  { id: "sleep", label: "Sleep Health", icon: "😴" },
]

const healthTips = [
  "Regular checkups can prevent 80% of health issues",
  "Walking 10,000 steps daily improves cardiovascular health",
  "Proper hydration boosts immune system function",
  "7-8 hours of sleep enhances mental clarity",
]

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentTip, setCurrentTip] = useState(0)
  const [registrationStep, setRegistrationStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    language: "en",
    interests: [],
  })
  const [errors, setErrors] = useState({})

  // Simulate login
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const user = mockUsers.find((u) => u.email === formData.email && u.password === formData.password)

    if (user) {
      localStorage.setItem("swasthwrap_user", JSON.stringify(user))
      setCurrentUser(user)
    } else {
      setErrors({ general: "Invalid email or password" })
    }

    setIsLoading(false)
  }

  // Simulate registration
  const handleRegistration = async (e) => {
    e.preventDefault()
    if (registrationStep < 4) {
      setRegistrationStep(registrationStep + 1)
      return
    }

    setIsLoading(true)

    // Simulate registration process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newUser = {
      ...formData,
      healthScore: Math.floor(Math.random() * 25) + 70, // 70-95
      streak: 0,
      upcomingAppointments: 0,
      medicationsDue: 0,
    }

    localStorage.setItem("swasthwrap_user", JSON.stringify(newUser))
    setCurrentUser(newUser)
    setIsLoading(false)
  }

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 0, label: "Weak", color: "bg-[#F97316]" }
    if (password.length < 8) return { strength: 1, label: "Fair", color: "bg-yellow-500" }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 2, label: "Strong", color: "bg-[#3ECF8E]" }
    }
    return { strength: 1, label: "Good", color: "bg-blue-500" }
  }

  if (currentUser) {
    return <Dashboard user={currentUser} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F1F1F] to-[#262626] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Health Icons */}
      <motion.div
        className="absolute top-20 left-20 text-[#3ECF8E] opacity-20"
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
      >
        <Heart size={30} />
      </motion.div>

      <motion.div
        className="absolute top-40 right-32 text-[#3ECF8E] opacity-20"
        animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
      >
        <Shield size={25} />
      </motion.div>

      <div className="w-full max-w-md">
        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-center"
        >
          <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
            <SelectTrigger className="w-40 bg-[#262626] border-[#404040] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#262626] border-[#404040]">
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-[#404040]">
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <Card className="bg-[#262626] border-[#404040] shadow-2xl">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-[#3ECF8E] rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Heart className="text-black" size={32} />
            </motion.div>
            <CardTitle className="text-2xl text-white">{isLogin ? "Welcome Back" : "Join SwasthWrap"}</CardTitle>
            <p className="text-[#A3A3A3]">
              {isLogin ? "Sign in to your health dashboard" : "Start your health journey today"}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLogin ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E]"
                    required
                  />
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-[#F97316] text-sm"
                  >
                    <AlertCircle size={16} />
                    <span>{errors.general}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Demo Credentials */}
                <div className="bg-[#1F1F1F] border border-[#404040] rounded-lg p-3 text-sm">
                  <p className="text-[#A3A3A3] mb-2">Demo Credentials:</p>
                  <div className="space-y-1 text-white">
                    <p>📧 demo@swasthwrap.com</p>
                    <p>🔑 demo123</p>
                  </div>
                </div>
              </form>
            ) : (
              // Registration Form
              <AnimatePresence mode="wait">
                <motion.form
                  key={registrationStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegistration}
                  className="space-y-4"
                >
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step <= registrationStep ? "bg-[#3ECF8E] text-black" : "bg-[#404040] text-[#A3A3A3]"
                          }`}
                        >
                          {step < registrationStep ? <CheckCircle size={16} /> : step}
                        </div>
                        {step < 4 && (
                          <div
                            className={`w-8 h-1 mx-2 ${step < registrationStep ? "bg-[#3ECF8E]" : "bg-[#404040]"}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {registrationStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E]"
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E]"
                        required
                      />
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create Password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E] pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#A3A3A3]">Password Strength</span>
                            <span
                              className={`font-medium ${getPasswordStrength(formData.password).color.replace("bg-", "text-")}`}
                            >
                              {getPasswordStrength(formData.password).label}
                            </span>
                          </div>
                          <div className="w-full bg-[#404040] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                              style={{ width: `${(getPasswordStrength(formData.password).strength + 1) * 33.33}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {registrationStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white mb-4">Language Preference</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {languages.map((lang) => (
                          <label
                            key={lang.code}
                            className="flex items-center space-x-3 p-3 bg-[#1F1F1F] border border-[#404040] rounded-lg cursor-pointer hover:border-[#3ECF8E] transition-colors"
                          >
                            <input
                              type="radio"
                              name="language"
                              value={lang.code}
                              checked={formData.language === lang.code}
                              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                              className="text-[#3ECF8E] focus:ring-[#3ECF8E]"
                            />
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="text-white font-medium">{lang.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {registrationStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white mb-4">Health Interests</h3>
                      <p className="text-[#A3A3A3] text-sm mb-4">Select areas you'd like to focus on (optional)</p>
                      <div className="grid grid-cols-1 gap-3">
                        {healthInterests.map((interest) => (
                          <label
                            key={interest.id}
                            className="flex items-center space-x-3 p-3 bg-[#1F1F1F] border border-[#404040] rounded-lg cursor-pointer hover:border-[#3ECF8E] transition-colors"
                          >
                            <Checkbox
                              checked={formData.interests.includes(interest.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({ ...formData, interests: [...formData.interests, interest.id] })
                                } else {
                                  setFormData({
                                    ...formData,
                                    interests: formData.interests.filter((i) => i !== interest.id),
                                  })
                                }
                              }}
                              className="border-[#404040] data-[state=checked]:bg-[#3ECF8E] data-[state=checked]:border-[#3ECF8E]"
                            />
                            <span className="text-xl">{interest.icon}</span>
                            <span className="text-white">{interest.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {registrationStep === 4 && (
                    <div className="text-center space-y-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-[#3ECF8E] rounded-full flex items-center justify-center mx-auto"
                      >
                        <CheckCircle className="text-black" size={40} />
                      </motion.div>
                      <h3 className="text-xl font-medium text-white">Welcome to SwasthWrap!</h3>
                      <p className="text-[#A3A3A3]">
                        You're all set to begin your personalized health journey. Click below to access your dashboard.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : registrationStep === 4 ? (
                      "Complete Registration"
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </motion.form>
              </AnimatePresence>
            )}

            {/* Health Tip */}
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1F1F1F] border border-[#404040] rounded-lg p-3 text-center"
            >
              <p className="text-[#A3A3A3] text-xs mb-1">💡 Health Tip</p>
              <p className="text-white text-sm">{healthTips[currentTip]}</p>
            </motion.div>

            {/* Toggle Login/Register */}
            <div className="text-center pt-4 border-t border-[#404040]">
              <p className="text-[#A3A3A3] text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setRegistrationStep(1)
                    setFormData({ email: "", password: "", name: "", language: "en", interests: [] })
                    setErrors({})
                  }}
                  className="ml-2 text-[#3ECF8E] hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
