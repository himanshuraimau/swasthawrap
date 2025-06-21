"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Calendar,
  MessageCircle,
  Star,
  StarOff,
  Trash2,
  Download,
  Clock,
  Tag,
  MoreVertical,
  Play,
  Archive,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock chat history data
const mockChatHistory = [
  {
    id: "chat_001",
    title: "Blood Test Results Discussion",
    summary: "Discussed elevated glucose levels, HbA1c results, and dietary recommendations for diabetes management",
    date: "2024-06-20",
    time: "14:30",
    duration: "15 min",
    messageCount: 12,
    language: "hi",
    tags: ["diabetes", "blood-test", "diet", "medication"],
    category: "Medical Reports",
    isBookmarked: true,
    isArchived: false,
    confidence: 0.92,
    lastMessage: "Thank you for explaining my blood test results. I'll follow the dietary recommendations.",
    participants: ["user", "ai"],
    attachments: 2,
    status: "completed",
  },
  {
    id: "chat_002",
    title: "Medication Side Effects Query",
    summary: "Asked about potential side effects of Metformin and drug interactions with other medications",
    date: "2024-06-18",
    time: "09:15",
    duration: "8 min",
    messageCount: 8,
    language: "en",
    tags: ["medication", "side-effects", "metformin"],
    category: "Medication",
    isBookmarked: false,
    isArchived: false,
    confidence: 0.88,
    lastMessage: "I understand the side effects now. I'll monitor for any symptoms.",
    participants: ["user", "ai"],
    attachments: 0,
    status: "completed",
  },
  {
    id: "chat_003",
    title: "Exercise Routine Planning",
    summary: "Created a personalized exercise plan for diabetes management with low-impact activities",
    date: "2024-06-15",
    time: "18:45",
    duration: "25 min",
    messageCount: 20,
    language: "en",
    tags: ["exercise", "diabetes", "fitness", "planning"],
    category: "Lifestyle",
    isBookmarked: true,
    isArchived: false,
    confidence: 0.85,
    lastMessage: "This exercise plan looks perfect for my fitness level. I'll start tomorrow.",
    participants: ["user", "ai"],
    attachments: 1,
    status: "completed",
  },
  {
    id: "chat_004",
    title: "Hypertension Management Tips",
    summary: "Discussed blood pressure monitoring, lifestyle changes, and stress management techniques",
    date: "2024-06-12",
    time: "11:20",
    duration: "18 min",
    messageCount: 15,
    language: "hi",
    tags: ["hypertension", "blood-pressure", "stress", "lifestyle"],
    category: "Health Management",
    isBookmarked: false,
    isArchived: false,
    confidence: 0.9,
    lastMessage: "I'll start monitoring my blood pressure daily as suggested.",
    participants: ["user", "ai"],
    attachments: 0,
    status: "completed",
  },
  {
    id: "chat_005",
    title: "Nutrition Plan for Weight Loss",
    summary: "Developed a balanced nutrition plan with calorie counting and meal suggestions",
    date: "2024-06-10",
    time: "16:30",
    duration: "22 min",
    messageCount: 18,
    language: "ta",
    tags: ["nutrition", "weight-loss", "diet", "calories"],
    category: "Nutrition",
    isBookmarked: true,
    isArchived: false,
    confidence: 0.87,
    lastMessage: "The meal plan looks delicious and healthy. Thank you!",
    participants: ["user", "ai"],
    attachments: 3,
    status: "completed",
  },
  {
    id: "chat_006",
    title: "Sleep Quality Improvement",
    summary: "Discussed sleep hygiene, bedtime routines, and factors affecting sleep quality",
    date: "2024-06-08",
    time: "21:15",
    duration: "12 min",
    messageCount: 10,
    language: "en",
    tags: ["sleep", "insomnia", "hygiene", "routine"],
    category: "Mental Health",
    isBookmarked: false,
    isArchived: true,
    confidence: 0.83,
    lastMessage: "I'll try the sleep hygiene tips you suggested.",
    participants: ["user", "ai"],
    attachments: 0,
    status: "completed",
  },
]

const categories = [
  "All",
  "Medical Reports",
  "Medication",
  "Lifestyle",
  "Health Management",
  "Nutrition",
  "Mental Health",
]
const languages = [
  { code: "all", name: "All Languages", flag: "🌐" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
]

export default function ChatHistory({ user, onResumeChat }) {
  const [chatHistory, setChatHistory] = useState(mockChatHistory)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [filterBy, setFilterBy] = useState("all")
  const [selectedChats, setSelectedChats] = useState([])
  const [expandedChat, setExpandedChat] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // grid or list

  // Filter and sort chat history
  const filteredChats = chatHistory
    .filter((chat) => {
      const matchesSearch =
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "All" || chat.category === selectedCategory
      const matchesLanguage = selectedLanguage === "all" || chat.language === selectedLanguage

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "bookmarked" && chat.isBookmarked) ||
        (filterBy === "archived" && chat.isArchived) ||
        (filterBy === "recent" && new Date(chat.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

      return matchesSearch && matchesCategory && matchesLanguage && matchesFilter && !chat.isArchived
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time)
        case "title":
          return a.title.localeCompare(b.title)
        case "duration":
          return Number.parseInt(b.duration) - Number.parseInt(a.duration)
        case "messages":
          return b.messageCount - a.messageCount
        default:
          return 0
      }
    })

  const archivedChats = chatHistory.filter((chat) => chat.isArchived)
  const bookmarkedChats = chatHistory.filter((chat) => chat.isBookmarked)

  const handleBookmarkToggle = (chatId) => {
    setChatHistory((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, isBookmarked: !chat.isBookmarked } : chat)),
    )
  }

  const handleArchiveToggle = (chatId) => {
    setChatHistory((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat)),
    )
  }

  const handleDeleteChat = (chatId) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
    setSelectedChats((prev) => prev.filter((id) => id !== chatId))
  }

  const handleBulkAction = (action) => {
    switch (action) {
      case "bookmark":
        setChatHistory((prev) =>
          prev.map((chat) => (selectedChats.includes(chat.id) ? { ...chat, isBookmarked: true } : chat)),
        )
        break
      case "archive":
        setChatHistory((prev) =>
          prev.map((chat) => (selectedChats.includes(chat.id) ? { ...chat, isArchived: true } : chat)),
        )
        break
      case "delete":
        setChatHistory((prev) => prev.filter((chat) => !selectedChats.includes(chat.id)))
        break
    }
    setSelectedChats([])
  }

  const handleSelectChat = (chatId) => {
    setSelectedChats((prev) => (prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]))
  }

  const handleSelectAll = () => {
    if (selectedChats.length === filteredChats.length) {
      setSelectedChats([])
    } else {
      setSelectedChats(filteredChats.map((chat) => chat.id))
    }
  }

  const exportChatHistory = () => {
    const exportData = {
      user: user.name,
      exportDate: new Date().toISOString(),
      totalChats: chatHistory.length,
      chats: chatHistory.map((chat) => ({
        ...chat,
        exportedAt: new Date().toISOString(),
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTimeAgo = (date, time) => {
    const chatDate = new Date(date + " " + time)
    const now = new Date()
    const diffInHours = Math.floor((now - chatDate) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
  }

  const ChatCard = ({ chat, isSelected, onSelect }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`relative group ${viewMode === "grid" ? "h-full" : ""}`}
    >
      <Card
        className={`bg-gradient-to-br from-[#262626] to-[#1F1F1F] border-[#404040] hover:border-[#3ECF8E]/50 transition-all duration-300 cursor-pointer h-full ${
          isSelected ? "border-[#3ECF8E] bg-[#3ECF8E]/5" : ""
        }`}
        onClick={() => onResumeChat(chat)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation()
                    onSelect(chat.id)
                  }}
                  className="rounded border-[#404040] text-[#3ECF8E] focus:ring-[#3ECF8E] focus:ring-offset-0"
                />
                <CardTitle className="text-white text-lg font-semibold truncate">{chat.title}</CardTitle>
                {chat.isBookmarked && <Star className="text-[#3ECF8E] flex-shrink-0" size={16} fill="currentColor" />}
              </div>
              <p className="text-[#A3A3A3] text-sm line-clamp-2 leading-relaxed">{chat.summary}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#A3A3A3] hover:text-white hover:bg-[#404040] rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#262626] border-[#404040] text-white">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onResumeChat(chat)
                  }}
                  className="hover:bg-[#404040]"
                >
                  <Play className="mr-2" size={14} />
                  Resume Chat
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmarkToggle(chat.id)
                  }}
                  className="hover:bg-[#404040]"
                >
                  {chat.isBookmarked ? (
                    <>
                      <StarOff className="mr-2" size={14} />
                      Remove Bookmark
                    </>
                  ) : (
                    <>
                      <Star className="mr-2" size={14} />
                      Bookmark
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedChat(expandedChat === chat.id ? null : chat.id)
                  }}
                  className="hover:bg-[#404040]"
                >
                  <Eye className="mr-2" size={14} />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#404040]" />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleArchiveToggle(chat.id)
                  }}
                  className="hover:bg-[#404040]"
                >
                  <Archive className="mr-2" size={14} />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChat(chat.id)
                  }}
                  className="hover:bg-red-500/20 text-red-400"
                >
                  <Trash2 className="mr-2" size={14} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Chat Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-[#A3A3A3]">
                <Calendar size={14} />
                <span>{new Date(chat.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-[#A3A3A3]">
                <Clock size={14} />
                <span>{chat.duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-[#A3A3A3]">
                <MessageCircle size={14} />
                <span>{chat.messageCount} messages</span>
              </div>
              <div className="flex items-center space-x-2 text-[#A3A3A3]">
                <Tag size={14} />
                <span>{chat.category}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {chat.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E] text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {chat.tags.length > 3 && (
                <Badge variant="outline" className="bg-[#404040]/20 border-[#404040] text-[#A3A3A3] text-xs">
                  +{chat.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Confidence and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#A3A3A3]">Confidence:</span>
                <div className="w-16 h-1 bg-[#404040] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] rounded-full"
                    style={{ width: `${chat.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#3ECF8E] font-medium">{Math.round(chat.confidence * 100)}%</span>
              </div>
              <span className="text-xs text-[#A3A3A3]">{getTimeAgo(chat.date, chat.time)}</span>
            </div>

            {/* Last Message Preview */}
            <div className="border-t border-[#404040]/30 pt-3">
              <p className="text-xs text-[#A3A3A3] italic line-clamp-2">"{chat.lastMessage}"</p>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedChat === chat.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-[#404040]/30 pt-4 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#A3A3A3]">Language:</span>
                      <span className="text-white ml-2">
                        {languages.find((l) => l.code === chat.language)?.name || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#A3A3A3]">Attachments:</span>
                      <span className="text-white ml-2">{chat.attachments}</span>
                    </div>
                    <div>
                      <span className="text-[#A3A3A3]">Status:</span>
                      <span className="text-white ml-2 capitalize">{chat.status}</span>
                    </div>
                    <div>
                      <span className="text-[#A3A3A3]">Time:</span>
                      <span className="text-white ml-2">{chat.time}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#A3A3A3] text-xs">All Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {chat.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E] text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat History</h1>
          <p className="text-[#A3A3A3] mt-1">
            {filteredChats.length} of {chatHistory.filter((c) => !c.isArchived).length} conversations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedChats.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-[#A3A3A3] text-sm">{selectedChats.length} selected</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white rounded-xl"
                  >
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#262626] border-[#404040] text-white">
                  <DropdownMenuItem onClick={() => handleBulkAction("bookmark")} className="hover:bg-[#404040]">
                    <Star className="mr-2" size={14} />
                    Bookmark All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("archive")} className="hover:bg-[#404040]">
                    <Archive className="mr-2" size={14} />
                    Archive All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#404040]" />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("delete")}
                    className="hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="mr-2" size={14} />
                    Delete All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <Button
            onClick={exportChatHistory}
            variant="outline"
            className="bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white rounded-xl"
          >
            <Download className="mr-2" size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-r from-[#262626] to-[#1F1F1F] border-[#404040]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3]" size={16} />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1F1F1F] border-[#404040] text-white placeholder:text-[#A3A3A3] focus:border-[#3ECF8E] rounded-xl"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-[#404040]">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-[#404040]">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white rounded-xl">
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
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-[#404040]">
                <SelectItem value="all" className="text-white hover:bg-[#404040]">
                  All Chats
                </SelectItem>
                <SelectItem value="recent" className="text-white hover:bg-[#404040]">
                  Recent (7 days)
                </SelectItem>
                <SelectItem value="bookmarked" className="text-white hover:bg-[#404040]">
                  Bookmarked
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-[#A3A3A3] text-sm">
                <input
                  type="checkbox"
                  checked={selectedChats.length === filteredChats.length && filteredChats.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-[#404040] text-[#3ECF8E] focus:ring-[#3ECF8E] focus:ring-offset-0"
                />
                <span>Select All</span>
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-[#1F1F1F] border-[#404040] text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#262626] border-[#404040]">
                  <SelectItem value="date" className="text-white hover:bg-[#404040]">
                    Sort by Date
                  </SelectItem>
                  <SelectItem value="title" className="text-white hover:bg-[#404040]">
                    Sort by Title
                  </SelectItem>
                  <SelectItem value="duration" className="text-white hover:bg-[#404040]">
                    Sort by Duration
                  </SelectItem>
                  <SelectItem value="messages" className="text-white hover:bg-[#404040]">
                    Sort by Messages
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl ${
                  viewMode === "grid"
                    ? "bg-[#3ECF8E] text-black"
                    : "bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white"
                }`}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-xl ${
                  viewMode === "list"
                    ? "bg-[#3ECF8E] text-black"
                    : "bg-transparent border-[#404040] text-[#A3A3A3] hover:text-white"
                }`}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-[#262626] border border-[#404040]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            All Chats ({filteredChats.length})
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Star className="mr-2" size={16} />
            Bookmarked ({bookmarkedChats.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Archive className="mr-2" size={16} />
            Archived ({archivedChats.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredChats.length === 0 ? (
            <Card className="bg-[#262626] border-[#404040]">
              <CardContent className="p-12 text-center">
                <MessageCircle className="mx-auto text-[#A3A3A3] mb-4" size={48} />
                <h3 className="text-white text-lg font-medium mb-2">No conversations found</h3>
                <p className="text-[#A3A3A3]">
                  {searchTerm || selectedCategory !== "All" || selectedLanguage !== "all"
                    ? "Try adjusting your search filters"
                    : "Start a new conversation with the AI assistant"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredChats.map((chat) => (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChats.includes(chat.id)}
                  onSelect={handleSelectChat}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarked" className="space-y-4">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {bookmarkedChats.map((chat) => (
              <ChatCard
                key={chat.id}
                chat={chat}
                isSelected={selectedChats.includes(chat.id)}
                onSelect={handleSelectChat}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {archivedChats.map((chat) => (
              <ChatCard
                key={chat.id}
                chat={chat}
                isSelected={selectedChats.includes(chat.id)}
                onSelect={handleSelectChat}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
