"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Heart, Activity, Phone, Mail, Edit, Save, X, Trash2, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const mockProfileData = {
  personalInfo: {
    name: "राहुल शर्मा",
    email: "rahul.sharma@example.com",
    phone: "+91-9876543210",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    bloodGroup: "O+",
    address: "123 Health Street, Mumbai, Maharashtra, India",
    emergencyContact: {
      name: "प्रिया शर्मा",
      relationship: "Spouse",
      phone: "+91-9876543211",
    },
  },

  healthProfile: {
    height: "175",
    weight: "75.2",
    bmi: "24.6",
    allergies: ["Penicillin", "Shellfish"],
    chronicConditions: ["Type 2 Diabetes", "Hypertension"],
    currentMedications: [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", prescribedBy: "Dr. Sharma" },
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", prescribedBy: "Dr. Patel" },
    ],
    healthGoals: [
      { goal: "Maintain HbA1c below 7%", target: "7.0", current: "7.2", unit: "%", progress: 85 },
      { goal: "Lose 5kg weight", target: "70", current: "75.2", unit: "kg", progress: 60 },
      { goal: "Exercise 150 min/week", target: "150", current: "120", unit: "min", progress: 80 },
    ],
  },

  preferences: {
    language: "hi",
    units: {
      weight: "kg",
      height: "cm",
      temperature: "celsius",
    },
    notifications: {
      medication: true,
      appointments: true,
      healthTips: true,
      reports: true,
    },
    privacy: {
      shareWithDoctors: true,
      anonymousData: false,
      marketingEmails: false,
    },
  },
}

export default function HealthProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [profileData, setProfileData] = useState(mockProfileData)
  const [editingSection, setEditingSection] = useState(null)

  const handleSave = () => {
    // Simulate saving to backend
    setTimeout(() => {
      setIsEditing(false)
      setEditingSection(null)
    }, 1000)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingSection(null)
    // Reset to original data
    setProfileData(mockProfileData)
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getBMIStatus = (bmi) => {
    const bmiValue = Number.parseFloat(bmi)
    if (bmiValue < 18.5) return { status: "Underweight", color: "text-blue-500" }
    if (bmiValue < 25) return { status: "Normal", color: "text-[#3ECF8E]" }
    if (bmiValue < 30) return { status: "Overweight", color: "text-[#F97316]" }
    return { status: "Obese", color: "text-red-500" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Profile</h1>
          <p className="text-[#A3A3A3] mt-1">Manage your personal health information</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black">
                <Save className="mr-2" size={16} />
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="bg-transparent border-[#404040] text-[#A3A3A3] hover:bg-[#404040] hover:text-white"
              >
                <X className="mr-2" size={16} />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="bg-transparent border-[#404040] text-[#A3A3A3] hover:bg-[#404040] hover:text-white"
            >
              <Edit className="mr-2" size={16} />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="bg-[#262626] border-[#404040]">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-[#3ECF8E] rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-2xl">{profileData.personalInfo.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{profileData.personalInfo.name}</h2>
              <p className="text-[#A3A3A3] mb-2">
                {calculateAge(profileData.personalInfo.dateOfBirth)} years old • {profileData.personalInfo.gender} •{" "}
                {profileData.personalInfo.bloodGroup}
              </p>
              <div className="flex items-center space-x-4 text-sm text-[#A3A3A3]">
                <span className="flex items-center">
                  <Mail className="mr-1" size={14} />
                  {profileData.personalInfo.email}
                </span>
                <span className="flex items-center">
                  <Phone className="mr-1" size={14} />
                  {profileData.personalInfo.phone}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#3ECF8E]">{user.healthScore}</div>
              <div className="text-[#A3A3A3] text-sm">Health Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#262626] border border-[#404040]">
          <TabsTrigger value="personal" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <User className="mr-2" size={16} />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Heart className="mr-2" size={16} />
            Health Data
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Activity className="mr-2" size={16} />
            Health Goals
          </TabsTrigger>
          <TabsTrigger value="emergency" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <AlertTriangle className="mr-2" size={16} />
            Emergency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Full Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.personalInfo.name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, name: e.target.value },
                        })
                      }
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  ) : (
                    <p className="text-white">{profileData.personalInfo.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profileData.personalInfo.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, email: e.target.value },
                        })
                      }
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  ) : (
                    <p className="text-white">{profileData.personalInfo.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Phone</label>
                  {isEditing ? (
                    <Input
                      value={profileData.personalInfo.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, phone: e.target.value },
                        })
                      }
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  ) : (
                    <p className="text-white">{profileData.personalInfo.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Date of Birth</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={profileData.personalInfo.dateOfBirth}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, dateOfBirth: e.target.value },
                        })
                      }
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  ) : (
                    <p className="text-white">{new Date(profileData.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Gender</label>
                  {isEditing ? (
                    <Select
                      value={profileData.personalInfo.gender}
                      onValueChange={(value) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, gender: value },
                        })
                      }
                    >
                      <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-[#404040]">
                        <SelectItem value="Male" className="text-white hover:bg-[#404040]">
                          Male
                        </SelectItem>
                        <SelectItem value="Female" className="text-white hover:bg-[#404040]">
                          Female
                        </SelectItem>
                        <SelectItem value="Other" className="text-white hover:bg-[#404040]">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">{profileData.personalInfo.gender}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Blood Group</label>
                  {isEditing ? (
                    <Select
                      value={profileData.personalInfo.bloodGroup}
                      onValueChange={(value) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, bloodGroup: value },
                        })
                      }
                    >
                      <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-[#404040]">
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                          <SelectItem key={group} value={group} className="text-white hover:bg-[#404040]">
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">{profileData.personalInfo.bloodGroup}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[#A3A3A3] text-sm mb-1 block">Address</label>
                {isEditing ? (
                  <Textarea
                    value={profileData.personalInfo.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        personalInfo: { ...profileData.personalInfo, address: e.target.value },
                      })
                    }
                    className="bg-[#1F1F1F] border-[#404040] text-white"
                    rows={2}
                  />
                ) : (
                  <p className="text-white">{profileData.personalInfo.address}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[#262626] border-[#404040]">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{profileData.healthProfile.height} cm</div>
                <div className="text-[#A3A3A3] text-sm">Height</div>
              </CardContent>
            </Card>
            <Card className="bg-[#262626] border-[#404040]">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{profileData.healthProfile.weight} kg</div>
                <div className="text-[#A3A3A3] text-sm">Weight</div>
              </CardContent>
            </Card>
            <Card className="bg-[#262626] border-[#404040]">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getBMIStatus(profileData.healthProfile.bmi).color}`}>
                  {profileData.healthProfile.bmi}
                </div>
                <div className="text-[#A3A3A3] text-sm">BMI - {getBMIStatus(profileData.healthProfile.bmi).status}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white">Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[#A3A3A3] text-sm mb-2 block">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {profileData.healthProfile.allergies.map((allergy, index) => (
                    <Badge key={index} variant="outline" className="bg-[#1F1F1F] border-[#F97316] text-[#F97316]">
                      <AlertTriangle className="mr-1" size={12} />
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[#A3A3A3] text-sm mb-2 block">Chronic Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {profileData.healthProfile.chronicConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="bg-[#1F1F1F] border-[#404040] text-white">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[#A3A3A3] text-sm mb-2 block">Current Medications</label>
                <div className="space-y-2">
                  {profileData.healthProfile.currentMedications.map((med, index) => (
                    <div key={index} className="bg-[#1F1F1F] border border-[#404040] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{med.name}</h4>
                          <p className="text-[#A3A3A3] text-sm">
                            {med.dosage} - {med.frequency}
                          </p>
                          <p className="text-[#A3A3A3] text-xs">Prescribed by {med.prescribedBy}</p>
                        </div>
                        {isEditing && (
                          <Button variant="ghost" size="sm" className="text-[#F97316] hover:bg-[#F97316]/10">
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {profileData.healthProfile.healthGoals.map((goal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-[#262626] border-[#404040]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">{goal.goal}</h3>
                    <Badge
                      variant="outline"
                      className={`${
                        goal.progress >= 90
                          ? "border-[#3ECF8E] text-[#3ECF8E]"
                          : goal.progress >= 70
                            ? "border-[#F97316] text-[#F97316]"
                            : "border-[#404040] text-[#A3A3A3]"
                      }`}
                    >
                      {goal.progress}%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{goal.current}</div>
                      <div className="text-[#A3A3A3] text-xs">Current</div>
                    </div>
                    <div className="flex-1">
                      <Progress value={goal.progress} className="h-2 bg-[#404040]" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#3ECF8E]">{goal.target}</div>
                      <div className="text-[#A3A3A3] text-xs">Target</div>
                    </div>
                  </div>
                  <div className="text-[#A3A3A3] text-sm">
                    {goal.current} / {goal.target} {goal.unit}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="mr-2 text-[#3ECF8E]" size={20} />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Contact Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.personalInfo.emergencyContact.name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: {
                            ...profileData.personalInfo,
                            emergencyContact: {
                              ...profileData.personalInfo.emergencyContact,
                              name: e.target.value,
                            },
                          },
                        })
                      }
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  ) : (
                    <p className="text-white">{profileData.personalInfo.emergencyContact.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Relationship</label>
                  {isEditing ? (
                    <Input
                      value={profileData.personalInfo.emergencyContact.relationship}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: {
                            ...profileData.personalInfo,
                            emergencyContact: {
                              ...profileData.personalInfo.emergencyContact,
                              relationship: e.target.value,
                            },
                          },
                        })
                      }
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  ) : (
                    <p className="text-white">{profileData.personalInfo.emergencyContact.relationship}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[#A3A3A3] text-sm mb-1 block">Phone Number</label>
                  {isEditing ? (
                    <Input
                      value={profileData.personalInfo.emergencyContact.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: {
                            ...profileData.personalInfo,
                            emergencyContact: {
                              ...profileData.personalInfo.emergencyContact,
                              phone: e.target.value,
                            },
                          },
                        })
                      }
                      className="bg-[#1F1F1F] border-[#404040] text-white"
                    />
                  ) : (
                    <p className="text-white">{profileData.personalInfo.emergencyContact.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="mr-2 text-[#F97316]" size={20} />
                Medical Alert Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#F97316]/10 border border-[#F97316] rounded-lg p-4">
                <h4 className="text-[#F97316] font-medium mb-2">Critical Allergies</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.healthProfile.allergies.map((allergy, index) => (
                    <Badge key={index} variant="outline" className="bg-[#F97316]/20 border-[#F97316] text-[#F97316]">
                      {allergy}
                    </Badge>
                  ))}
                </div>
                <h4 className="text-[#F97316] font-medium mb-2">Chronic Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.healthProfile.chronicConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="bg-[#F97316]/20 border-[#F97316] text-[#F97316]">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
