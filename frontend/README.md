# 🎓 Local Language Learning Web App

A modern, gamified language-learning platform for Uganda's local languages, designed for students in classes S1-S4.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-frontend_complete-green.svg)

---

## 🌟 Features

### ✨ Modern, Beautiful UI

- **Duolingo-inspired design** with playful animations
- **Candy Crush-style level ladder** for intuitive navigation
- **Fully responsive** across all devices
- **Smooth animations** and micro-interactions
- **Gradient-rich interface** with floating vector shapes

### 🎮 Gamified Learning Experience

- Progress tracking with visual indicators
- Streak counter and achievements
- Unlock system for lessons
- Interactive learning path
- Completion celebrations

### 🤖 AI-Powered (Ready for Integration)

- Chatbot dock for instant help
- Adaptive learning paths (placeholder)
- Personalized quiz generation (placeholder)
- Real-time feedback system (placeholder)

### 📚 Curriculum-Aligned

- Based on Uganda NCDC syllabus
- Classes S1-S4 coverage
- Term and week structure
- Comprehensive topic coverage

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool
- **CSS3** - Styling with CSS variables

### Design System

- **Fonts:** Poppins, Quicksand
- **Colors:** Custom gradient palette
- **Animations:** Custom keyframes + Framer Motion
- **Components:** Fully modular and reusable

---

## 📁 Project Structure

```
LLAi project/
├── docs/
│   └── SYLLABUS_STRUCTURE.md    # Curriculum data structure
├── src/
│   ├── components/
│   │   ├── landing/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── SignupCard.jsx
│   │   │   └── InfoSection.jsx
│   │   └── dashboard/
│   │       ├── Sidebar.jsx
│   │       ├── LevelLadder.jsx
│   │       ├── WeekModal.jsx
│   │       └── ChatbotDock.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   └── Dashboard.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── CHECKLIST.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**

```powershell
cd "c:\Users\DELL\Desktop\LLAi project"
```

2. **Install dependencies**

```powershell
npm install
```

3. **Start development server**

```powershell
npm run dev
```

4. **Open in browser**
   The app will automatically open at `http://localhost:3000`

### Build for Production

```powershell
npm run build
```

### Preview Production Build

```powershell
npm run preview
```

---

## 📖 Usage Guide

### Landing Page

1. View the hero section with project introduction
2. Scroll to see "How It Works" and benefits
3. Fill out the signup form to create an account
4. Click "Get Started" to access the dashboard

### Dashboard

1. **Sidebar:** Navigate between different sections

   - Toggle expand/collapse with the arrow button
   - Click menu items to navigate (placeholder functionality)

2. **Level Ladder:** Main learning interface

   - Select your class (S1-S4)
   - Choose a term (Term 1-3)
   - Click unlocked week nodes to open learning content
   - Hover over nodes to see tooltips with details

3. **Week Modal:** Learning content viewer

   - Overview tab shows what you'll learn
   - Lecture, Quiz, and Practice tabs (placeholders)
   - Close modal to return to ladder

4. **Chatbot:** AI assistant
   - Click floating button to open chat
   - Send messages for help (placeholder responses)
   - Use quick action buttons
   - Minimize or close as needed

---

## 🎨 Design Principles

### Visual Hierarchy

- Clear information architecture
- Intuitive navigation flow
- Visual feedback on all interactions

### Color System

- **Primary:** Indigo gradient (#667eea → #764ba2)
- **Secondary:** Pink gradient (#f093fb → #f5576c)
- **Success:** Teal/blue gradient
- **Neutrals:** Comprehensive gray scale

### Typography

- **Headings:** Quicksand (rounded, friendly)
- **Body:** Poppins (clean, readable)
- **Weights:** 300-800 range for hierarchy

### Spacing

- Consistent spacing scale (xs to 2xl)
- Generous whitespace
- Clear component separation

---

## 📚 Curriculum Structure

The app follows the Uganda NCDC local language syllabus:

### Coverage

- **Classes:** S1, S2, S3, S4
- **Terms:** 3 terms per class
- **Weeks:** 4-12 weeks per term
- **Topics:** Multiple topics per week

### Example (S1, Term 1)

1. **Week 1:** Greetings & Introductions
2. **Week 2:** Family & Relations
3. **Week 3:** Numbers & Counting
4. **Week 4:** Colors & Objects
5. **Week 5:** Days & Time

See `docs/SYLLABUS_STRUCTURE.md` for complete curriculum breakdown.

---

## 🔄 Current Status

### ✅ Completed

- Complete frontend UI/UX
- Landing page with signup
- Dashboard with sidebar
- Level ladder navigation
- Week modal system
- Chatbot dock interface
- Syllabus documentation
- Responsive design
- Animation system

### 🚧 In Progress

- Backend API development
- User authentication
- Database setup

### 📋 Planned

- AI lesson generation
- Quiz engine
- Audio pronunciation
- Speech recognition
- Achievement system
- Progress analytics
- Offline support

---

## 🤝 Contributing

This is a personal/educational project. Contributions, ideas, and feedback are welcome!

### Development Guidelines

1. Follow existing code style
2. Use meaningful component names
3. Keep components modular and reusable
4. Write clean, commented code
5. Test responsiveness on multiple devices

---

## 📝 License

This project is for educational purposes. All rights reserved.

---

## 👤 Author

Created with ❤️ for Uganda's students

---

## 🙏 Acknowledgments

- **Duolingo** - UI/UX inspiration
- **Uganda NCDC** - Curriculum standards
- **Framer Motion** - Animation library
- **Lucide** - Beautiful icons

---

## 📞 Support

For issues or questions, please check:

1. `CHECKLIST.md` - Current project status
2. `docs/SYLLABUS_STRUCTURE.md` - Curriculum details
3. Component comments - Implementation details

---

## 🔮 Future Vision

This platform aims to:

- **Preserve** Uganda's linguistic heritage
- **Empower** students with cultural knowledge
- **Innovate** education through AI and gamification
- **Bridge** traditional and modern learning methods

---

**Built with modern web technologies and a passion for education** 🚀
