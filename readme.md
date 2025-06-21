# 🏥 SwasthWrap - AI-Powered Health Companion

> **Your Personal Health Assistant with Multilingual AI Support**

SwasthWrap is a comprehensive health management platform that combines AI-powered consultations, medical record management, and personalized health tracking in a beautiful, multilingual interface.

![SwasthWrap Dashboard](https://via.placeholder.com/800x400/1F1F1F/3ECF8E?text=SwasthWrap+Dashboard)

## ✨ Features

### 🤖 **AI Health Assistant**
- **Intelligent Conversations**: Advanced AI chatbot with medical knowledge
- **Multilingual Support**: English, Hindi (हिंदी), Tamil (தமிழ்)
- **Voice Integration**: Voice input and text-to-speech responses
- **File Analysis**: Upload and analyze medical reports, images, and documents
- **Smart Suggestions**: Context-aware health recommendations
- **Confidence Scoring**: AI response reliability indicators
- **Chat History**: Complete conversation management with search and filtering

### 📊 **Health Dashboard**
- **Health Score**: Personalized health scoring system (0-100)
- **Quick Stats**: Reports, chat sessions, goals, and medications tracking
- **Recent Activity**: Timeline of health-related activities
- **Smart Reminders**: Medication alerts and appointment notifications
- **Health Tips**: Rotating multilingual health advice
- **Progress Tracking**: Visual progress indicators for health goals

### 📋 **Medical Records Management**
- **Document Upload**: Support for PDFs, images, and text files
- **Smart Categorization**: Automatic sorting by medical specialty
- **Tag System**: Searchable tags for easy organization
- **Status Tracking**: Review status and processing indicators
- **Secure Storage**: HIPAA-compliant document handling
- **Quick Access**: Fast search and filtering capabilities

### 👤 **Health Profile**
- **Personal Information**: Complete demographic and contact details
- **Medical History**: Chronic conditions, allergies, and medications
- **Health Metrics**: BMI, blood pressure, glucose levels, and more
- **Emergency Contacts**: Critical contact information
- **Health Goals**: Personalized targets with progress tracking
- **Medical Alerts**: Critical allergy and condition warnings

### ⚙️ **Settings & Preferences**
- **Language Settings**: Primary and secondary language selection
- **Measurement Units**: Metric/Imperial system preferences
- **Notification Controls**: Granular notification management
- **Privacy Settings**: Data sharing and retention preferences
- **Security Features**: Two-factor authentication and session management
- **Data Management**: Export, import, and deletion capabilities

### 🔒 **Security & Privacy**
- **Secure Authentication**: JWT-based login with refresh tokens
- **Data Encryption**: End-to-end encryption for sensitive data
- **Privacy Controls**: Granular data sharing permissions
- **Session Management**: Active session monitoring and control
- **Audit Logs**: Complete activity tracking
- **GDPR Compliance**: Right to data portability and deletion

## 🛠️ **Technology Stack**

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library

### **State Management**
- **Global State**: Zustand with persistence
- **Server State**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with validation
- **Local Storage**: Persistent user preferences

### **Development Tools**
- **Package Manager**: npm/yarn
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js built-in bundler

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser

### **Installation**

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/your-org/swasthwrap.git
cd swasthwrap
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. **Start development server**
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. **Open your browser**
\`\`\`
http://localhost:3000
\`\`\`

### **Environment Variables**
\`\`\`env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SwasthWrap

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
API_SECRET_KEY=your-secret-key

# Database (for backend)
DATABASE_URL=postgresql://user:password@localhost:5432/swasthwrap
REDIS_URL=redis://localhost:6379

# File Storage
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,application/pdf,text/*

# AI Service
AI_API_KEY=your-ai-api-key
AI_MODEL=gpt-4

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
\`\`\`

## 📱 **User Journey**

### **1. Onboarding**
- Beautiful animated splash screen
- Multilingual welcome experience
- Quick registration/login process
- Health profile setup wizard

### **2. Dashboard Experience**
- Personalized health score display
- Quick access to all features
- Recent activity timeline
- Smart health recommendations

### **3. AI Consultation**
- Natural language health queries
- Voice input and audio responses
- Medical document analysis
- Conversation history management

### **4. Health Management**
- Medical record organization
- Health metrics tracking
- Goal setting and monitoring
- Medication management

### **5. Settings & Privacy**
- Comprehensive preference controls
- Security settings management
- Data export and deletion
- Notification customization

## 🎨 **Design System**

### **Color Palette**
- **Primary**: `#3ECF8E` (Health Green)
- **Secondary**: `#2DD4BF` (Teal)
- **Background**: `#1F1F1F` (Dark)
- **Surface**: `#262626` (Card Background)
- **Text**: `#FFFFFF` (Primary Text)
- **Muted**: `#A3A3A3` (Secondary Text)
- **Border**: `#404040` (Subtle Borders)
- **Warning**: `#F97316` (Orange)
- **Error**: `#EF4444` (Red)

### **Typography**
- **Font Family**: Inter (System fallback)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)
- **Captions**: Light weight (300)

### **Spacing**
- **Base Unit**: 4px
- **Component Padding**: 16px, 24px
- **Section Margins**: 32px, 48px
- **Container Max Width**: 1200px

## 📊 **Features Overview**

| Feature | Status | Description |
|---------|--------|-------------|
| 🤖 AI Chatbot | ✅ Complete | Multilingual AI health assistant |
| 📊 Dashboard | ✅ Complete | Health overview and quick stats |
| 📋 Medical Records | ✅ Complete | Document management system |
| 👤 Health Profile | ✅ Complete | Personal health information |
| ⚙️ Settings | ✅ Complete | Preferences and privacy controls |
| 🔐 Authentication | ✅ Complete | Secure login and registration |
| 📱 Responsive Design | ✅ Complete | Mobile-first responsive layout |
| 🌐 Multilingual | ✅ Complete | English, Hindi, Tamil support |
| 🎨 Modern UI | ✅ Complete | Beautiful gradient-based design |
| 📈 Analytics | 🚧 Planned | Health insights and trends |

## 🔧 **API Integration**

The app is designed to work with a RESTful API. See `API_DOCUMENTATION.txt` for complete backend requirements.

### **Key Endpoints**
- `POST /auth/login` - User authentication
- `GET /user/profile` - User profile data
- `POST /chat/message` - AI chat interactions
- `GET /health/documents` - Medical documents
- `POST /health/metrics` - Health data recording

## 🧪 **Testing**

### **Run Tests**
\`\`\`bash
npm run test
# or
yarn test
\`\`\`

### **Test Coverage**
- Unit tests for components
- Integration tests for user flows
- API endpoint testing
- Accessibility testing

## 📦 **Build & Deployment**

### **Production Build**
\`\`\`bash
npm run build
npm start
\`\`\`

### **Docker Deployment**
\`\`\`bash
docker build -t swasthwrap .
docker run -p 3000:3000 swasthwrap
\`\`\`

### **Vercel Deployment**
\`\`\`bash
vercel --prod
\`\`\`

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Ensure accessibility compliance
- Follow the existing code style

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Design Inspiration**: Modern healthcare applications
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React icon set
- **Animations**: Framer Motion library
- **AI Integration**: OpenAI GPT models

## 📞 **Support**

- **Documentation**: [docs.swasthwrap.com](https://docs.swasthwrap.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/swasthwrap/issues)
- **Email**: support@swasthwrap.com
- **Discord**: [SwasthWrap Community](https://discord.gg/swasthwrap)

## 🗺️ **Roadmap**

### **Phase 1** ✅ **Complete**
- Core UI/UX implementation
- AI chatbot with multilingual support
- Health dashboard and profile management
- Medical records system
- Settings and preferences

### **Phase 2** 🚧 **In Progress**
- Real-time notifications
- Advanced health analytics
- Telemedicine integration
- Wearable device connectivity
- Enhanced AI capabilities

### **Phase 3** 📋 **Planned**
- Mobile app (React Native)
- Healthcare provider portal
- Insurance integration
- Advanced reporting
- Machine learning insights

---

<div align="center">

**Built with ❤️ for better health management**

[Website](https://swasthwrap.com) • [Documentation](https://docs.swasthwrap.com) • [API](https://api.swasthwrap.com) • [Support](mailto:support@swasthwrap.com)

</div>
