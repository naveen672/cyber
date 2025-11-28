# Overview

CyberShield AI is a comprehensive cybersecurity threat detection and monitoring platform that provides real-time threat analysis, AI-powered insights, and automated security monitoring. The system combines advanced threat detection algorithms with an intuitive dashboard interface to help security teams identify, analyze, and respond to cyber threats effectively.

The platform features a complete 5-threat detection system including:
1. **DOS Attack Detection** - Real-time traffic monitoring with interactive controls and IP tracking
2. **Phishing Email Detection** - AI-powered email analysis with automatic quarantine
3. **USB Device Scanner** - Comprehensive malware scanning for connected devices  
4. **Network Intrusion Detection** - Advanced monitoring for unauthorized access attempts
5. **Malicious Website Blocker** - Real-time web protection against harmful sites

Each threat detection module provides visual alerts, progress animations, automated threat mitigation, and detailed threat information designed to create "wow factor" demonstrations while being educational and easy to understand.

## Recent Changes (November 2025)

### Dashboard Consolidation
- Merged Threat Center content into the main Dashboard page
- Dashboard now includes: Real-time Threat Monitoring stats, Threat Detection Center cards, System Health, and Today's Activity sections
- Removed the separate Threat Center navigation - all content accessible from one unified dashboard

### Cybersecurity Chatbot
- Added floating chatbot assistant for cybersecurity questions
- Uses intelligent pattern matching and keyword-based response system
- Covers topics: phishing, malware, ransomware, DDoS, passwords, 2FA, network security, social engineering, incident response
- Features quick question suggestions, chat history, and conversational follow-ups
- Backend service in `server/chatbotService.ts` with `/api/chat` endpoint
- Frontend component in `components/CyberSecurityBot.tsx`
- No external API required - works offline with built-in cybersecurity knowledge base

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using **React with TypeScript** and follows a component-based architecture. The frontend uses **Vite** as the build tool and development server, providing fast hot module replacement and optimized bundling.

**UI Framework**: The application leverages **shadcn/ui** components built on top of **Radix UI primitives** for consistent, accessible user interface elements. The design system uses **Tailwind CSS** for styling with a custom color scheme optimized for dark-themed cybersecurity dashboards.

**State Management**: The application uses **TanStack Query** (React Query) for server state management, providing efficient data fetching, caching, and synchronization. Client-side routing is handled by **wouter**, a lightweight routing library.

**Component Structure**: The frontend is organized into reusable components including threat visualization charts, real-time monitoring panels, AI insights displays, and interactive detection simulators. Key components include threat cards, status dashboards, network activity charts, and specialized detection panels for different threat types.

## Backend Architecture
The server-side application is built with **Express.js** running on **Node.js** with **TypeScript**. The backend follows a RESTful API design pattern with modular route handling and middleware-based request processing.

**API Design**: The API provides endpoints for threat management, system statistics, activity logging, and analytics. Routes are organized by functionality (/api/threats, /api/stats, /api/activities) with comprehensive error handling and request validation using **Zod** schemas.

**Development Integration**: The backend integrates with Vite's development server in development mode, providing seamless full-stack development experience with hot reloading and error overlays.

## Data Storage Solutions
The application uses **PostgreSQL** as the primary database, accessed through **Drizzle ORM** for type-safe database operations. The database schema is designed to handle complex threat intelligence data with relationships between threats, activities, and system statistics.

**Database Schema**: The system includes tables for users, threats, activities, and statistics. The threat table contains comprehensive fields for threat classification, confidence scoring, severity levels, mitigation status, and AI analysis results. The schema supports advanced features like behavioral indicators, geolocation tracking, and relationship mapping between threats.

**Connection Management**: Database connections are managed through **@neondatabase/serverless** for serverless PostgreSQL deployment, with connection pooling and automatic scaling capabilities.

## Authentication and Authorization
The system implements session-based authentication using **connect-pg-simple** for PostgreSQL session storage. User management includes secure password handling and role-based access control for different security clearance levels.

## External Dependencies

**Database**: PostgreSQL with Neon serverless hosting for scalable, managed database infrastructure.

**UI Components**: Radix UI primitives provide the foundation for accessible, composable UI components including dialogs, dropdowns, tooltips, and form controls.

**Charting and Visualization**: Chart.js integration for real-time threat visualization, network activity monitoring, and security analytics dashboards.

**Form Management**: React Hook Form with Hookform Resolvers for robust form handling and validation in threat reporting and configuration interfaces.

**Date Handling**: date-fns library for consistent date formatting and manipulation across threat timestamps and activity logs.

**Development Tools**: The project includes development-specific integrations like Replit-specific plugins for runtime error handling and cartographer for enhanced development experience.

**Validation**: Zod library provides runtime type checking and validation for API requests, database schemas, and form inputs, with zod-to-json-schema for API documentation generation.