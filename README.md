# YAAKE

AI-powered recruitment intelligence platform with multi-agent architecture. Real-time resume ATS scoring, mock interviews, cover letter generation, and job matching. Serves applicants, recruiters, and training teams. Built with Node.js, Python, React, GPT-4/Claude. Enterprise-grade: GDPR compliant, scalable AWS deployment.

---

## Overview

YAAKE is a comprehensive recruitment platform that bridges the employment gap between candidates and opportunities through intelligent AI-powered features.

### Key Features

**For Applicants:**
- Resume ATS scoring with real-time compatibility analysis and formatting validation
- AI-powered mock interview generator with personalized questions and feedback
- Intelligent cover letter generation with multiple style variations
- Skills gap analysis with automated course recommendations

**For Recruiters:**
- AI-assisted job post creation with bias detection
- Automated interview scheduling with calendar integration
- Customizable question bank generation aligned with candidate backgrounds

**For Training Teams:**
- Skills gap analysis across candidate pools
- Course recommendation engine with engagement tracking

---

## Technology Stack

### Frontend
- React 18 with TypeScript
- React Router DOM
- Modern hooks-based architecture
- Component-based design

### Backend
- Node.js with Express framework
- RESTful API architecture
- Python AI services for LLM integration
- PostgreSQL database with normalized schema

### AI & Machine Learning
- OpenAI GPT-4 API
- Claude API
- Multi-agent architecture with 5 specialized agents
- Advanced prompt engineering and NLP processing

### Security & Authentication
- JWT-based authentication
- Role-based access control (RBAC) for applicants, recruiters, and trainers
- bcrypt password hashing
- Rate limiting and CORS protection
- Helmet security headers

---

## Multi-Agent Architecture

The platform leverages five specialized AI agents:

1. **Resume Intelligence Agent** - Deep resume analysis, ATS scoring, keyword extraction, and improvement suggestions
2. **Communication Agent** - Personalized cover letter and professional correspondence generation
3. **Career Guidance Agent** - Interview preparation, company research, and feedback provision
4. **Recruiter Agent** - Job post creation, interview question generation, and scheduling automation
5. **Training Agent** - Skills gap analysis and course recommendation

---

## Quick Start

### Backend Setup

Navigate to backend directory and install dependencies:
```bash
cd backend
npm install
```

Start the backend server:
```bash
npm run dev
```

Server runs on `http://localhost:5001`

### Frontend Setup

Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm start
```

Application runs on `http://localhost:3000`

### Default Test Account

- **Email**: `admin@yaake.com`
- **Password**: `Admin@123`
- **Role**: `admin`

---

## Features Implementation

### Authentication System
- Email/password registration with strong validation
- Email verification with token-based system
- OAuth integration placeholders (Google, GitHub)
- Duplicate email handling
- Secure session management

### Security Features
- JWT-based authentication with 24-hour token expiry
- Password hashing with bcrypt (10 salt rounds)
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- HTTPS support for production

### Non-Functional Requirements
- Response time < 2 seconds
- GDPR compliance for data protection
- Enterprise-grade scalability
- AWS deployment infrastructure


## Development Highlights

- **18 Feature Branches** with structured pull request workflow
- **Extensive UML Documentation** including use case, class, activity, sequence, and deployment diagrams
- **51+ Commits** demonstrating steady progress and incremental delivery
- **MVC Architecture** for maintainable and scalable codebase
- **Comprehensive Testing** with edge case handling and error management

---

## Contact

For questions or support regarding the YAAKE recruitment intelligence platform, please reach out to the development team.
