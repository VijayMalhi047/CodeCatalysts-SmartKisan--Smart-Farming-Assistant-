# SmartKisan - AI-Powered Farming Assistant

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation Guide](#installation-guide)
5. [Project Structure](#project-structure)
6. [Usage Guide](#usage-guide)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

## 🌾 Project Overview

**SmartKisan** is an intelligent farming assistant that leverages AI and 15 years of historical agricultural data to provide data-driven farming recommendations. The application offers bilingual support (English/Urdu) and helps farmers make informed decisions about crop management, irrigation, pest control, and harvesting.

### Key Value Propositions:
- **Data-Driven Insights**: 15 years of historical weather and crop data analysis
- **AI-Powered Recommendations**: Conversational farming advice
- **Bilingual Support**: Accessible to both English and Urdu speaking farmers
- **Mobile-First Design**: Optimized for farmers in rural areas

**[Screenshot: Dashboard Overview]**
*Placeholder: Take screenshot of the main dashboard showing weather cards, crop information, and action buttons*

## 🚀 Features

### 1. AI Chat Assistant
- Conversational interface for farming queries
- Context-aware responses with memory
- Bilingual support (English/Urdu)
- Historical data integration

**[Screenshot: Chat Interface]**
*Placeholder: Show the chat interface with conversation history and input area*

### 2. Smart Dashboard
- Real-time weather information
- Crop condition monitoring
- 7-day weather forecast
- Quick action buttons

**[Screenshot: Weather Dashboard]**
*Placeholder: Display weather cards with temperature, humidity, rainfall, soil moisture, and wind speed*

### 3. Analytics & Reports
- Interactive charts and graphs
- Crop yield predictions
- Weather trend analysis
- PDF export functionality

**[Screenshot: Analytics Page]**
*Placeholder: Show charts for temperature vs humidity, AQI components, and crop yield predictions*

### 4. Personalized Settings
- Crop type selection
- Regional preferences
- Language settings
- Notification preferences

**[Screenshot: Settings Page]**
*Placeholder: Display settings interface with crop selection, region choice, and language toggle*

## 🛠 Technology Stack

### Frontend
```json
{
  "Framework": "Next.js 13 + React 18",
  "Styling": "Tailwind CSS",
  "Charts": "Recharts",
  "Icons": "Lucide React",
  "PDF Export": "jsPDF + html2canvas"
}
```

### Backend & AI
```json
{
  "AI Service": "OpenRouter API",
  "AI Model": "Mistral 7B",
  "Data Storage": "JSON files + LocalStorage",
  "API": "Next.js API Routes"
}
```

### Development Tools
```json
{
  "Language": "JavaScript (ES6+)",
  "Package Manager": "npm",
  "Version Control": "Git",
  "Linting": "ESLint"
}
```

## 📥 Installation Guide

### Prerequisites
- Node.js 16.8 or later
- npm or yarn package manager
- OpenRouter API account

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smartkisan.git
cd smartkisan
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Run Development Server
```bash
npm run dev
```

#### 5. Access Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

**[Screenshot: Terminal showing successful installation]**
*Placeholder: Show terminal with npm install and npm run dev commands running successfully*

## 📁 Project Structure

```
smartkisan/
├── pages/                 # Next.js pages
│   ├── index.js          # Dashboard
│   ├── chat.js           # AI Chat interface
│   ├── advice.js         # Structured recommendations
│   ├── analytics.js      # Data visualization
│   ├── settings.js       # User preferences
│   └── api/              # Backend APIs
│       └── chat.js       # AI integration
├── data/                 # Historical datasets
│   ├── historical_weather.json
│   ├── crop_yield_data.json
│   └── soil_data.json
├── lib/                  # Utility libraries
│   ├── dataLoader.js     # Data analysis
│   └── promptBuilder.js  # AI prompts
├── public/               # Static assets
└── styles/               # CSS files
```

## 📖 Usage Guide

### Getting Started

#### 1. Dashboard Overview
- **Weather Information**: Current conditions and 7-day forecast
- **Crop Status**: Current crop health and needs
- **Quick Actions**: Access to chat, analytics, and settings

**[Screenshot: Annotated Dashboard]**
*Placeholder: Dashboard with callouts explaining each section*

#### 2. Using AI Chat Assistant
1. Click "Chat with AI" from dashboard
2. Select your preferred language (English/Urdu)
3. Ask farming-related questions:
   - "When should I plant wheat in Punjab?"
   - "How much water does rice need?"
   - "What's the best fertilizer for cotton?"

**[Screenshot: Chat Conversation]**
*Placeholder: Show a complete conversation about wheat planting*

#### 3. Viewing Analytics
1. Navigate to Analytics page
2. View interactive charts:
   - Temperature vs Humidity trends
   - Air quality components
   - Crop yield predictions
3. Export reports as PDF

**[Screenshot: Analytics Charts]**
*Placeholder: Display various charts with farming data*

#### 4. Configuring Settings
1. Set your primary crop type
2. Select your region
3. Choose preferred language
4. Configure notifications

**[Screenshot: Settings Configuration]**
*Placeholder: Show settings page with crop selection and region choices*

## 🔌 API Documentation

### Chat API Endpoint

**POST** `/api/chat`

```javascript
// Request Body
{
  "message": "When should I plant wheat in Punjab?",
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hello! How can I help?"}
  ],
  "language": "en"
}

// Response
{
  "response": "Based on 15 years of data...",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "openrouter-mistral-7b"
}
```

### Data Analysis Functions

```javascript
// Example usage in dataLoader.js
const predictions = DataAnalyzer.predictOptimalSowingTime('wheat', 'punjab');
const weatherTrends = DataAnalyzer.analyzeWeatherTrends('sindh');
const cropPerformance = DataAnalyzer.getCropPerformance('rice', 'punjab');
```


## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Areas for Contribution
- **New Crop Data**: Add data for additional crops
- **Regional Expansion**: Include more regions and their specific data
- **UI Improvements**: Enhance mobile experience
- **Translation**: Help translate to more languages

### Code Standards
- Use consistent naming conventions
- Add comments for complex logic
- Ensure responsive design
- Test on multiple devices

## 📊 Data Sources

### Historical Data Structure
The application uses 15 years of curated agricultural data:

```json
{
  "punjab": {
    "2023": {
      "january": {
        "avg_temp": 14.8,
        "rainfall": 48,
        "humidity": 72
      }
    }
  }
}
```

### Data Categories
1. **Weather Data**: Temperature, rainfall, humidity patterns
2. **Crop Yields**: Historical production data
3. **Soil Conditions**: Nutrient levels and soil health
4. **Regional Variations**: Location-specific farming patterns

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: React Native version
- **Voice Interface**: Voice commands for hands-free usage
- **Image Recognition**: Plant disease detection from photos
- **IoT Integration**: Sensor data from farming equipment
- **Marketplace**: Connect farmers with buyers
- **Community Features**: Farmer-to-farmer knowledge sharing

### Technical Improvements
- **Real-time Weather**: Live weather API integration
- **Advanced Analytics**: Machine learning predictions
- **Offline Support**: Service workers for offline usage
- **Push Notifications**: Farming alerts and reminders


## 📞 Support

### Documentation
- [GitHub Repository](https://github.com/yourusername/smartkisan)
- [API Documentation](#api-documentation)
- [User Guide](docs/user_guide.md)

### Community
- [Discussions Forum](https://github.com/yourusername/smartkisan/discussions)
- [Contributor Guidelines](CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🎯 Quick Start Recap

1. **Clone & Install**: `git clone && npm install`
2. **Configure**: Add OpenRouter API key to `.env.local`
3. **Run**: `npm run dev`
4. **Access**: Open `http://localhost:3000`
5. **Explore**: Start chatting with the AI farming assistant!

**[Screenshot: Complete Application Flow]**
*Placeholder: Create a collage showing dashboard → chat → analytics → settings flow*

---

**SmartKisan - Empowering Farmers with AI-Driven Agricultural Intelligence** 🌱

*Built with ❤️ for the farming community*
