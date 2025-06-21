"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Calendar, FileText, Download, Eye, Star, Clock, Tag, MessageCircle, Upload, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockUserHealthData = {
  chatHistory: [
    {
      id: 1,
      date: "2024-06-20",
      title: "Blood Test Results Discussion",
      summary: "Discussed elevated glucose levels and dietary recommendations",
      messages: 12,
      language: "hi",
      tags: ["diabetes", "diet", "blood-test"],
      bookmark: true,
      duration: "15 min",
    },
    {
      id: 2,
      date: "2024-06-18",
      title: "Medication Side Effects Query",
      summary: "Asked about potential side effects of Metformin",
      messages: 8,
      language: "en",
      tags: ["medication", "side-effects"],
      bookmark: false,
      duration: "8 min",
    },
    {
      id: 3,
      date: "2024-06-15",
      title: "Exercise Routine Planning",
      summary: "Created a personalized exercise plan for diabetes management",
      messages: 20,
      language: "en",
      tags: ["exercise", "diabetes", "fitness"],
      bookmark: true,
      duration: "25 min",
    },
  ],

  medicalHistory: {
    conditions: [
      {
        id: 1,
        name: "Type 2 Diabetes",
        diagnosed: "2022-03-15",
        status: "Managed",
        severity: "Moderate",
        medications: ["Metformin 500mg", "Glipizide 5mg"],
        lastUpdate: "2024-06-15",
        notes: "Well controlled with current medication regimen",
      },
      {
        id: 2,
        name: "Hypertension",
        diagnosed: "2023-01-10",
        status: "Controlled",
        severity: "Mild",
        medications: ["Lisinopril 10mg"],
        lastUpdate: "2024-06-10",
        notes: "Blood pressure within normal range",
      },
    ],

    documents: [
      {
        id: 1,
        name: "Blood Test Report - June 2024",
        type: "Lab Report",
        date: "2024-06-20",
        size: "2.3 MB",
        category: "Laboratory",
        tags: ["blood-test", "glucose", "hba1c"],
        status: "Reviewed",
      },
      {
        id: 2,
        name: "ECG Report - May 2024",
        type: "Diagnostic",
        date: "2024-05-15",
        size: "1.8 MB",
        category: "Cardiology",
        tags: ["ecg", "heart", "routine"],
        status: "Normal",
      },
      {
        id: 3,
        name: "Prescription - Dr. Sharma",
        type: "Prescription",
        date: "2024-06-01",
        size: "0.5 MB",
        category: "Medication",
        tags: ["prescription", "diabetes"],
        status: "Active",
      },
    ],

    healthMetrics: [
      { date: "2024-06-20", type: "Blood Pressure", value: "128/82", unit: "mmHg", status: "Normal" },
      { date: "2024-06-20", type: "Blood Glucose", value: "145", unit: "mg/dL", status: "Elevated" },
      { date: "2024-06-15", type: "Weight", value: "75.2", unit: "kg", status: "Stable" },
      { date: "2024-06-10", type: "HbA1c", value: "7.2", unit: "%", status: "Fair" },
    ],
  },
}

export default function MedicalHistory({ user }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("chats")

  const filteredChatHistory = mockUserHealthData.chatHistory.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "bookmarked" && chat.bookmark) ||
      (selectedFilter === "recent" && new Date(chat.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    return matchesSearch && matchesFilter
  })

  const filteredDocuments = mockUserHealthData.medicalHistory.documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Medical History</h1>
          <p className="text-[#A3A3A3] mt-1">Your complete health journey and records</p>
        </div>
        <Button className="bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black">
          <Upload className="mr-2" size={16} />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#262626] border-[#404040]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3]" size={16} />
                <Input
                  placeholder="Search your health records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E]"
                />
              </div>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40 bg-[#1F1F1F] border-[#404040] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-[#404040]">
                <SelectItem value="all" className="text-white hover:bg-[#404040]">
                  All Records
                </SelectItem>
                <SelectItem value="recent" className="text-white hover:bg-[#404040]">
                  Recent
                </SelectItem>
                <SelectItem value="bookmarked" className="text-white hover:bg-[#404040]">
                  Bookmarked
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-[#1F1F1F] border-[#404040] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-[#404040]">
                <SelectItem value="all" className="text-white hover:bg-[#404040]">
                  All Categories
                </SelectItem>
                <SelectItem value="laboratory" className="text-white hover:bg-[#404040]">
                  Laboratory
                </SelectItem>
                <SelectItem value="cardiology" className="text-white hover:bg-[#404040]">
                  Cardiology
                </SelectItem>
                <SelectItem value="medication" className="text-white hover:bg-[#404040]">
                  Medication
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#262626] border border-[#404040]">
          <TabsTrigger value="chats" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <MessageCircle className="mr-2" size={16} />
            Chat History
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <FileText className="mr-2" size={16} />
            Documents
          </TabsTrigger>
          <TabsTrigger value="conditions" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Calendar className="mr-2" size={16} />
            Conditions
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Tag className="mr-2" size={16} />
            Health Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="space-y-4">
          {filteredChatHistory.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-[#262626] border-[#404040] hover:border-[#3ECF8E] transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-white font-medium">{chat.title}</h3>
                        {chat.bookmark && <Star className="text-[#3ECF8E]" size={16} fill="currentColor" />}
                      </div>
                      <p className="text-[#A3A3A3] text-sm mb-3">{chat.summary}</p>
                      <div className="flex items-center space-x-4 text-xs text-[#A3A3A3]">
                        <span className="flex items-center">
                          <Calendar className="mr-1" size={12} />
                          {new Date(chat.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="mr-1" size={12} />
                          {chat.messages} messages
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1" size={12} />
                          {chat.duration}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chat.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-[#1F1F1F] border-[#404040] text-[#A3A3A3] text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-[#A3A3A3] hover:text-white hover:bg-[#404040]">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#A3A3A3] hover:text-white hover:bg-[#404040]">
                        <Download size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-[#262626] border-[#404040] hover:border-[#3ECF8E] transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="text-[#3ECF8E]" size={24} />
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          doc.status === "Normal"
                            ? "border-[#3ECF8E] text-[#3ECF8E]"
                            : doc.status === "Active"
                              ? "border-[#F97316] text-[#F97316]"
                              : "border-[#404040] text-[#A3A3A3]"
                        }`}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-medium mb-2 line-clamp-2">{doc.name}</h3>
                    <p className="text-[#A3A3A3] text-sm mb-2">{doc.type}</p>
                    <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-3">
                      <span>{new Date(doc.date).toLocaleDateString()}</span>
                      <span>{doc.size}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-[#1F1F1F] border-[#404040] text-[#A3A3A3] text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-[#A3A3A3] hover:text-white hover:bg-[#404040]"
                      >
                        <Eye className="mr-1" size={12} />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#A3A3A3] hover:text-white hover:bg-[#404040]">
                        <Download size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          {mockUserHealthData.medicalHistory.conditions.map((condition) => (
            <motion.div key={condition.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-[#262626] border-[#404040]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{condition.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`${
                        condition.status === "Managed"
                          ? "border-[#3ECF8E] text-[#3ECF8E]"
                          : condition.status === "Controlled"
                            ? "border-blue-500 text-blue-500"
                            : "border-[#F97316] text-[#F97316]"
                      }`}
                    >
                      {condition.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#A3A3A3] text-sm mb-1">Diagnosed</p>
                      <p className="text-white">{new Date(condition.diagnosed).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[#A3A3A3] text-sm mb-1">Severity</p>
                      <p className="text-white">{condition.severity}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[#A3A3A3] text-sm mb-2">Current Medications</p>
                      <div className="flex flex-wrap gap-2">
                        {condition.medications.map((med, index) => (
                          <Badge key={index} variant="outline" className="bg-[#1F1F1F] border-[#404040] text-white">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[#A3A3A3] text-sm mb-1">Notes</p>
                      <p className="text-white text-sm">{condition.notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#404040]">
                    <span className="text-[#A3A3A3] text-xs">
                      Last updated: {new Date(condition.lastUpdate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-[#A3A3A3] hover:text-white hover:bg-[#404040]">
                        <Edit size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUserHealthData.medicalHistory.healthMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#262626] border-[#404040]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{metric.type}</h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          metric.status === "Normal"
                            ? "border-[#3ECF8E] text-[#3ECF8E]"
                            : metric.status === "Elevated"
                              ? "border-[#F97316] text-[#F97316]"
                              : metric.status === "Fair"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-[#404040] text-[#A3A3A3]"
                        }`}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-2xl font-bold text-white">{metric.value}</span>
                      <span className="text-[#A3A3A3] text-sm">{metric.unit}</span>
                    </div>
                    <p className="text-[#A3A3A3] text-xs">{new Date(metric.date).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
