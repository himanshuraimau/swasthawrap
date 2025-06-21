"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Heart, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/react-query/hooks/useAuth"
import Dashboard from "@/components/dashboard"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "ta", name: "தমিழ্", flag: "🇮🇳" },
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

export default function AuthForm() {
  const { user, isAuthenticated, isLoading, login, register, loginError, registerError } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)
  const [registrationStep, setRegistrationStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    language: "en",
    interests: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cycle through health tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      await login({
        email: formData.email,
        password: formData.password,
      })
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  // Handle registration form submission
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registrationStep < 4) {
      setRegistrationStep(registrationStep + 1)
      return
    }

    setErrors({})

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        language: formData.language,
        interests: formData.interests,
      })
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, label: "Weak", color: "bg-[#F97316]" }
    if (password.length < 8) return { strength: 1, label: "Fair", color: "bg-yellow-500" }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 2, label: "Strong", color: "bg-[#3ECF8E]" }
    }
    return { strength: 1, label: "Good", color: "bg-blue-500" }
  }

  // Show dashboard if user is authenticated
  if (isAuthenticated && user) {
    return <Dashboard user={user} />
  }

  // Get error message
  const errorMessage = isLogin 
    ? loginError?.message || errors.general
    : registerError?.message || errors.general

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
          <Select 
            value={formData.language} 
            onValueChange={(value) => setFormData({ ...formData, language: value })}
          >
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
            <CardTitle className="text-2xl text-white">
              {isLogin ? "Welcome Back" : "Join SwasthWrap"}
            </CardTitle>
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

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-[#F97316] text-sm"
                  >
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Demo Credentials */}
                <div className="bg-[#1F1F1F] border border-[#404040] rounded-lg p-3 text-sm">
                  <p className="text-[#A3A3A3] mb-2">Demo Credentials:</p>
                  <div className="space-y-1 text-white">
                    <p>Email: demo@swasthwrap.com</p>
                    <p>Password: Demo123!</p>
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
                  {registrationStep === 1 && (
                    <>
                      <div>
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E]"
                          required
                        />
                      </div>
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
                    </>
                  )}

                  {registrationStep === 2 && (
                    <>
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
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#A3A3A3]">Password Strength</span>
                            <span className={`text-xs font-medium ${
                              getPasswordStrength(formData.password).strength === 2 ? "text-[#3ECF8E]" : 
                              getPasswordStrength(formData.password).strength === 1 ? "text-yellow-500" : "text-[#F97316]"
                            }`}>
                              {getPasswordStrength(formData.password).label}
                            </span>
                          </div>
                          <div className="w-full bg-[#1F1F1F] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                              style={{ width: `${((getPasswordStrength(formData.password).strength + 1) / 3) * 100}%` }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {registrationStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-white text-lg font-medium text-center">Choose Your Health Interests</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {healthInterests.map((interest) => (
                          <motion.div
                            key={interest.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              formData.interests.includes(interest.id)
                                ? "border-[#3ECF8E] bg-[#3ECF8E]/10"
                                : "border-[#404040] bg-[#1F1F1F] hover:border-[#3ECF8E]/50"
                            }`}
                            onClick={() => {
                              const newInterests = formData.interests.includes(interest.id)
                                ? formData.interests.filter((i) => i !== interest.id)
                                : [...formData.interests, interest.id]
                              setFormData({ ...formData, interests: newInterests })
                            }}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-1">{interest.icon}</div>
                              <div className="text-white text-sm font-medium">{interest.label}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {registrationStep === 4 && (
                    <div className="space-y-4 text-center">
                      <CheckCircle className="w-16 h-16 text-[#3ECF8E] mx-auto" />
                      <h3 className="text-white text-lg font-medium">Ready to Get Started!</h3>
                      <div className="bg-[#1F1F1F] border border-[#404040] rounded-lg p-4 text-left">
                        <div className="space-y-2 text-sm">
                          <p className="text-[#A3A3A3]">Name: <span className="text-white">{formData.name}</span></p>
                          <p className="text-[#A3A3A3]">Email: <span className="text-white">{formData.email}</span></p>
                          <p className="text-[#A3A3A3]">Interests: <span className="text-white">{formData.interests.length} selected</span></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-[#F97316] text-sm"
                    >
                      <AlertCircle size={16} />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  <div className="flex space-x-3">
                    {registrationStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRegistrationStep(registrationStep - 1)}
                        className="flex-1 border-[#404040] text-white hover:bg-[#404040]"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black font-medium"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="animate-spin" size={16} />
                          <span>Creating Account...</span>
                        </div>
                      ) : registrationStep === 4 ? (
                        "Create Account"
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex justify-center space-x-2 pt-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all ${
                          step <= registrationStep ? "bg-[#3ECF8E]" : "bg-[#404040]"
                        }`}
                      />
                    ))}
                  </div>
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
