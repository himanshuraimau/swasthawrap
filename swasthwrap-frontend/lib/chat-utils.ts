// Utility functions for chat functionality

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix to get just the base64 content
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isValidAudioFile = (file: File): boolean => {
  const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/ogg', 'audio/flac']
  return validTypes.includes(file.type)
}

export const isValidDocumentFile = (file: File): boolean => {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
  return validTypes.includes(file.type)
}

export const getLanguageCode = (language: string): "en" | "hi" | "ta" => {
  switch (language.toLowerCase()) {
    case 'hindi':
    case 'hi':
      return 'hi'
    case 'tamil':
    case 'ta':
      return 'ta'
    case 'english':
    case 'en':
    default:
      return 'en'
  }
}

export const getLanguageName = (code: "en" | "hi" | "ta"): string => {
  switch (code) {
    case 'hi':
      return 'Hindi'
    case 'ta':
      return 'Tamil'
    case 'en':
    default:
      return 'English'
  }
}

export const formatTimestamp = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}

export const generateSessionTitle = (firstMessage: string): string => {
  if (!firstMessage) return 'New Chat'
  
  // Take first few words and limit length
  const words = firstMessage.trim().split(' ').slice(0, 6)
  let title = words.join(' ')
  
  if (title.length > 50) {
    title = title.substring(0, 50) + '...'
  }
  
  return title || 'New Chat'
}

export const extractHealthKeywords = (text: string): string[] => {
  const healthKeywords = [
    'diabetes', 'blood pressure', 'hypertension', 'cholesterol',
    'medication', 'medicine', 'exercise', 'diet', 'nutrition',
    'sleep', 'stress', 'heart', 'weight', 'blood test',
    'symptoms', 'fever', 'pain', 'headache', 'checkup',
    'doctor', 'appointment', 'hospital', 'clinic'
  ]
  
  const lowerText = text.toLowerCase()
  return healthKeywords.filter(keyword => lowerText.includes(keyword))
}

export const categorizeChat = (messages: any[]): string => {
  const allText = messages.map(m => m.content).join(' ').toLowerCase()
  
  if (allText.includes('blood test') || allText.includes('report') || allText.includes('results')) {
    return 'Medical Reports'
  }
  if (allText.includes('medication') || allText.includes('medicine') || allText.includes('drug')) {
    return 'Medication'
  }
  if (allText.includes('exercise') || allText.includes('fitness') || allText.includes('diet')) {
    return 'Lifestyle'
  }
  if (allText.includes('sleep') || allText.includes('stress') || allText.includes('mental')) {
    return 'Mental Health'
  }
  
  return 'Health Management'
}
