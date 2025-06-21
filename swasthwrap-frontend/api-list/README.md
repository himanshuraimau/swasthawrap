API DOCUMENTATION OVERVIEW FOR SWASTHWRAP FRONTEND
=====================================================

This folder contains comprehensive API documentation for the Swasthwrap health management platform frontend. The APIs are organized into the following categories:

## 📁 API Categories

### 1. Authentication APIs (authentication-apis.txt)
- User login/registration
- Profile management
- Password reset
- Session management

### 2. Chat & AI APIs (chat-ai-apis.txt)
- AI chatbot interactions
- Chat history management
- Message search
- Session bookmarking

### 3. Health Data APIs (health-data-apis.txt)
- Medical document management
- Health conditions tracking
- Health metrics (vitals, measurements)
- Health goals management

### 4. Dashboard & Analytics APIs (dashboard-analytics-apis.txt)
- Dashboard statistics
- Activity feeds
- Health trends
- Medication adherence tracking

### 5. Settings & Preferences APIs (settings-preferences-apis.txt)
- User preferences
- Notification settings
- Security settings
- Connected services management

### 6. Medication & Appointments APIs (medication-appointment-apis.txt)
- Medication tracking
- Appointment scheduling
- Intake history
- Reminder management

### 7. Notification & Emergency APIs (notification-emergency-apis.txt)
- Notification management
- Emergency alert system
- Emergency contacts
- Alert history

## 🔧 Technical Requirements

### Authentication
- All APIs (except login/register) require JWT token in Authorization header
- Format: `Authorization: Bearer <token>`

### Response Format
All APIs follow consistent response format:
```json
{
  "data": "response data",
  "success": "boolean",
  "message": "string (optional)"
}
```

### Pagination Format
For paginated endpoints:
```json
{
  "data": ["array of items"],
  "total": "number",
  "page": "number",
  "limit": "number", 
  "hasMore": "boolean"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "error message",
  "code": "error code (optional)"
}
```

## 🌐 Base URL
All API endpoints should be prefixed with the base API URL:
`https://api.swasthwrap.com/v1`

## 📱 Language Support
The platform supports multiple languages:
- English (en)
- Hindi (hi) 
- Tamil (ta)

Language-specific content should be returned based on user preferences or `Accept-Language` header.

## 🔒 Security Considerations
- All file uploads should be validated and scanned
- Sensitive data should be encrypted
- Rate limiting should be implemented
- Input validation and sanitization required
- CORS policies should be configured properly

## 📊 Data Validation
- All date fields should follow ISO 8601 format (YYYY-MM-DD)
- Time fields should follow HH:MM format
- File uploads should have size and type restrictions
- Email validation required for email fields
- Phone number validation required for phone fields

## 🚀 Performance Requirements
- Response times should be under 2 seconds
- File upload endpoints may take longer (with progress indicators)
- Implement caching where appropriate
- Use compression for large responses

## 📈 Analytics & Monitoring
APIs should include logging for:
- Response times
- Error rates
- Usage patterns
- Security events

This documentation provides the backend team with all necessary information to implement the APIs required by the Swasthwrap frontend application.
