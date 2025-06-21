"use client"

import { useState } from "react"
import {
  SettingsIcon,
  Globe,
  Bell,
  Shield,
  User,
  Download,
  Upload,
  Trash2,
  Smartphone,
  Clock,
  Palette,
  Database,
  Link,
  Save,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const mockUserSettings = {
  profile: {
    name: "राहुल शर्मा",
    email: "rahul@example.com",
    phone: "+91-9876543210",
    avatar: "/mock-avatar.jpg",
  },

  preferences: {
    language: { primary: "hi", secondary: "en" },
    units: { weight: "kg", height: "cm", temperature: "celsius" },
    notifications: {
      medication: { enabled: true, time: "09:00", sound: true },
      appointments: { enabled: true, advance: "1 hour", sound: true },
      healthTips: { enabled: true, frequency: "daily" },
      reports: { enabled: true, email: true },
      emergency: { enabled: true, sms: true },
    },
    display: {
      fontSize: "medium",
      animations: true,
      compactMode: false,
    },
    privacy: {
      shareWithDoctors: true,
      anonymousData: false,
      marketingEmails: false,
      dataRetention: "2 years",
    },
  },

  security: {
    twoFactorEnabled: false,
    lastPasswordChange: "2024-05-15",
    loginSessions: [
      { device: "iPhone 13", location: "Mumbai, India", lastActive: "2024-06-20", current: true },
      { device: "Chrome Browser", location: "Mumbai, India", lastActive: "2024-06-19", current: false },
    ],
  },

  connectedServices: [
    { name: "Google Fit", connected: true, lastSync: "2024-06-20" },
    { name: "Apple Health", connected: false, lastSync: null },
    { name: "Fitbit", connected: true, lastSync: "2024-06-19" },
  ],
}

export default function Settings({ user }) {
  const [settings, setSettings] = useState(mockUserSettings)
  const [activeTab, setActiveTab] = useState("general")
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  const handleNotificationToggle = (type, field, value) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [type]: {
            ...prev.preferences.notifications[type],
            [field]: value,
          },
        },
      },
    }))
  }

  const handleServiceToggle = (serviceName) => {
    setSettings((prev) => ({
      ...prev,
      connectedServices: prev.connectedServices.map((service) =>
        service.name === serviceName
          ? {
              ...service,
              connected: !service.connected,
              lastSync: service.connected ? null : new Date().toISOString().split("T")[0],
            }
          : service,
      ),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-[#A3A3A3] mt-1">Customize your SwasthWrap experience</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-black">
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 animate-spin" size={16} />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2" size={16} />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#262626] border border-[#404040]">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <SettingsIcon className="mr-2" size={16} />
            General
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black"
          >
            <Bell className="mr-2" size={16} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Shield className="mr-2" size={16} />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <User className="mr-2" size={16} />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-[#3ECF8E] data-[state=active]:text-black">
            <Database className="mr-2" size={16} />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          {/* Language Settings */}
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="mr-2 text-[#3ECF8E]" size={20} />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-2 block">Primary Language</label>
                  <Select
                    value={settings.preferences.language.primary}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          language: { ...prev.preferences.language, primary: value },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-[#404040]">
                      <SelectItem value="en" className="text-white hover:bg-[#404040]">
                        🇺🇸 English
                      </SelectItem>
                      <SelectItem value="hi" className="text-white hover:bg-[#404040]">
                        🇮🇳 हिंदी
                      </SelectItem>
                      <SelectItem value="ta" className="text-white hover:bg-[#404040]">
                        🇮🇳 தமிழ்
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-2 block">Secondary Language</label>
                  <Select
                    value={settings.preferences.language.secondary}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          language: { ...prev.preferences.language, secondary: value },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-[#404040]">
                      <SelectItem value="en" className="text-white hover:bg-[#404040]">
                        🇺🇸 English
                      </SelectItem>
                      <SelectItem value="hi" className="text-white hover:bg-[#404040]">
                        🇮🇳 हिंदी
                      </SelectItem>
                      <SelectItem value="ta" className="text-white hover:bg-[#404040]">
                        🇮🇳 தமிழ்
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Units Settings */}
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white">Measurement Units</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-2 block">Weight</label>
                  <Select
                    value={settings.preferences.units.weight}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          units: { ...prev.preferences.units, weight: value },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-[#404040]">
                      <SelectItem value="kg" className="text-white hover:bg-[#404040]">
                        Kilograms (kg)
                      </SelectItem>
                      <SelectItem value="lbs" className="text-white hover:bg-[#404040]">
                        Pounds (lbs)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-2 block">Height</label>
                  <Select
                    value={settings.preferences.units.height}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          units: { ...prev.preferences.units, height: value },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-[#404040]">
                      <SelectItem value="cm" className="text-white hover:bg-[#404040]">
                        Centimeters (cm)
                      </SelectItem>
                      <SelectItem value="ft" className="text-white hover:bg-[#404040]">
                        Feet & Inches
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[#A3A3A3] text-sm mb-2 block">Temperature</label>
                  <Select
                    value={settings.preferences.units.temperature}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          units: { ...prev.preferences.units, temperature: value },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-[#404040]">
                      <SelectItem value="celsius" className="text-white hover:bg-[#404040]">
                        Celsius (°C)
                      </SelectItem>
                      <SelectItem value="fahrenheit" className="text-white hover:bg-[#404040]">
                        Fahrenheit (°F)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Palette className="mr-2 text-[#3ECF8E]" size={20} />
                Display Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Animations</h4>
                  <p className="text-[#A3A3A3] text-sm">Enable smooth animations and transitions</p>
                </div>
                <Switch
                  checked={settings.preferences.display.animations}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        display: { ...prev.preferences.display, animations: checked },
                      },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Compact Mode</h4>
                  <p className="text-[#A3A3A3] text-sm">Show more information in less space</p>
                </div>
                <Switch
                  checked={settings.preferences.display.compactMode}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        display: { ...prev.preferences.display, compactMode: checked },
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-[#A3A3A3] text-sm mb-2 block">Font Size</label>
                <Select
                  value={settings.preferences.display.fontSize}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        display: { ...prev.preferences.display, fontSize: value },
                      },
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-[#404040]">
                    <SelectItem value="small" className="text-white hover:bg-[#404040]">
                      Small
                    </SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-[#404040]">
                      Medium
                    </SelectItem>
                    <SelectItem value="large" className="text-white hover:bg-[#404040]">
                      Large
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {/* Medication Reminders */}
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="mr-2 text-[#3ECF8E]" size={20} />
                Medication Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Enable Reminders</h4>
                  <p className="text-[#A3A3A3] text-sm">Get notified when it's time to take medication</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.medication.enabled}
                  onCheckedChange={(checked) => handleNotificationToggle("medication", "enabled", checked)}
                />
              </div>
              {settings.preferences.notifications.medication.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#A3A3A3] text-sm mb-2 block">Default Time</label>
                      <Input
                        type="time"
                        value={settings.preferences.notifications.medication.time}
                        onChange={(e) => handleNotificationToggle("medication", "time", e.target.value)}
                        className="bg-[#1F1F1F] border-[#404040] text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Sound Alert</h4>
                        <p className="text-[#A3A3A3] text-sm">Play sound with notification</p>
                      </div>
                      <Switch
                        checked={settings.preferences.notifications.medication.sound}
                        onCheckedChange={(checked) => handleNotificationToggle("medication", "sound", checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appointment Reminders */}
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="mr-2 text-[#3ECF8E]" size={20} />
                Appointment Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Enable Reminders</h4>
                  <p className="text-[#A3A3A3] text-sm">Get notified about upcoming appointments</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.appointments.enabled}
                  onCheckedChange={(checked) => handleNotificationToggle("appointments", "enabled", checked)}
                />
              </div>
              {settings.preferences.notifications.appointments.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#A3A3A3] text-sm mb-2 block">Advance Notice</label>
                    <Select
                      value={settings.preferences.notifications.appointments.advance}
                      onValueChange={(value) => handleNotificationToggle("appointments", "advance", value)}
                    >
                      <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-[#404040]">
                        <SelectItem value="15 minutes" className="text-white hover:bg-[#404040]">
                          15 minutes
                        </SelectItem>
                        <SelectItem value="30 minutes" className="text-white hover:bg-[#404040]">
                          30 minutes
                        </SelectItem>
                        <SelectItem value="1 hour" className="text-white hover:bg-[#404040]">
                          1 hour
                        </SelectItem>
                        <SelectItem value="2 hours" className="text-white hover:bg-[#404040]">
                          2 hours
                        </SelectItem>
                        <SelectItem value="1 day" className="text-white hover:bg-[#404040]">
                          1 day
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Sound Alert</h4>
                      <p className="text-[#A3A3A3] text-sm">Play sound with notification</p>
                    </div>
                    <Switch
                      checked={settings.preferences.notifications.appointments.sound}
                      onCheckedChange={(checked) => handleNotificationToggle("appointments", "sound", checked)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Notifications */}
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white">Other Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Health Tips</h4>
                  <p className="text-[#A3A3A3] text-sm">Receive daily health tips and advice</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.healthTips.enabled}
                  onCheckedChange={(checked) => handleNotificationToggle("healthTips", "enabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Report Updates</h4>
                  <p className="text-[#A3A3A3] text-sm">Get notified when new reports are available</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.reports.enabled}
                  onCheckedChange={(checked) => handleNotificationToggle("reports", "enabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Emergency Alerts</h4>
                  <p className="text-[#A3A3A3] text-sm">Critical health alerts and emergency notifications</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.emergency.enabled}
                  onCheckedChange={(checked) => handleNotificationToggle("emergency", "enabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="mr-2 text-[#3ECF8E]" size={20} />
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Share with Healthcare Providers</h4>
                  <p className="text-[#A3A3A3] text-sm">Allow doctors to access your health data</p>
                </div>
                <Switch
                  checked={settings.preferences.privacy.shareWithDoctors}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        privacy: { ...prev.preferences.privacy, shareWithDoctors: checked },
                      },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Anonymous Data Collection</h4>
                  <p className="text-[#A3A3A3] text-sm">Help improve our services with anonymous usage data</p>
                </div>
                <Switch
                  checked={settings.preferences.privacy.anonymousData}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        privacy: { ...prev.preferences.privacy, anonymousData: checked },
                      },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Marketing Emails</h4>
                  <p className="text-[#A3A3A3] text-sm">Receive promotional emails and health newsletters</p>
                </div>
                <Switch
                  checked={settings.preferences.privacy.marketingEmails}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        privacy: { ...prev.preferences.privacy, marketingEmails: checked },
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-[#A3A3A3] text-sm mb-2 block">Data Retention Period</label>
                <Select
                  value={settings.preferences.privacy.dataRetention}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        privacy: { ...prev.preferences.privacy, dataRetention: value },
                      },
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#1F1F1F] border-[#404040] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-[#404040]">
                    <SelectItem value="1 year" className="text-white hover:bg-[#404040]">
                      1 year
                    </SelectItem>
                    <SelectItem value="2 years" className="text-white hover:bg-[#404040]">
                      2 years
                    </SelectItem>
                    <SelectItem value="5 years" className="text-white hover:bg-[#404040]">
                      5 years
                    </SelectItem>
                    <SelectItem value="indefinite" className="text-white hover:bg-[#404040]">
                      Indefinite
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white">Password & Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-[#A3A3A3] text-sm">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      security: { ...prev.security, twoFactorEnabled: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Change Password</h4>
                  <p className="text-[#A3A3A3] text-sm">
                    Last changed: {new Date(settings.security.lastPasswordChange).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="bg-transparent border-[#404040] text-[#A3A3A3] hover:bg-[#404040] hover:text-white"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.security.loginSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1F1F1F] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="text-[#3ECF8E]" size={20} />
                      <div>
                        <h4 className="text-white font-medium">{session.device}</h4>
                        <p className="text-[#A3A3A3] text-sm">{session.location}</p>
                        <p className="text-[#A3A3A3] text-xs">
                          Last active: {new Date(session.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.current && (
                        <Badge variant="outline" className="bg-[#3ECF8E]/20 border-[#3ECF8E] text-[#3ECF8E]">
                          Current
                        </Badge>
                      )}
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-[#F97316] hover:bg-[#F97316]/10">
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Link className="mr-2 text-[#3ECF8E]" size={20} />
                Connected Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.connectedServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1F1F1F] rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{service.name}</h4>
                      <p className="text-[#A3A3A3] text-sm">
                        {service.connected
                          ? `Last synced: ${new Date(service.lastSync).toLocaleDateString()}`
                          : "Not connected"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`${
                          service.connected
                            ? "bg-[#3ECF8E]/20 border-[#3ECF8E] text-[#3ECF8E]"
                            : "bg-[#404040]/20 border-[#404040] text-[#A3A3A3]"
                        }`}
                      >
                        {service.connected ? "Connected" : "Disconnected"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleServiceToggle(service.name)}
                        className="bg-transparent border-[#404040] text-[#A3A3A3] hover:bg-[#404040] hover:text-white"
                      >
                        {service.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#262626] border-[#404040]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="mr-2 text-[#3ECF8E]" size={20} />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="bg-transparent border-[#404040] text-[#A3A3A3] hover:bg-[#404040] hover:text-white"
                >
                  <Download className="mr-2" size={16} />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-[#404040] text-[#A3A3A3] hover:bg-[#404040] hover:text-white"
                >
                  <Upload className="mr-2" size={16} />
                  Import Data
                </Button>
              </div>
              <div className="border-t border-[#404040] pt-4">
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10"
                >
                  <Trash2 className="mr-2" size={16} />
                  Delete All Data
                </Button>
                <p className="text-[#A3A3A3] text-xs mt-2 text-center">
                  This action cannot be undone. All your health data will be permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
