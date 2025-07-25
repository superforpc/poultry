# ERP Management System

## Overview

This is a comprehensive ERP (Enterprise Resource Planning) management system specifically designed for poultry/livestock business management. The system handles delivery challans, invoices, ledger entries, customers, and vendors with SQLite persistence and Express API.

**Current Status**: ✅ Backend setup is COMPLETE and fully functional
- SQLite database with persistent storage (erp.db)
- Express API with comprehensive CRUD operations
- Automatic ledger management with purchase/invoice/payment tracking  
- Auto-vendor creation from delivery challans
- Complete data validation and error handling
- All endpoints tested and working

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 25, 2025)

✅ **Complete Backend Implementation**:
- Updated database schema to match exact requirements: customers, vendors, delivery_challans, invoices, ledger_entries
- Implemented full Express API with all CRUD endpoints
- Added automatic ledger entry creation for DC and Invoice operations
- Added auto-vendor creation when creating DCs with vendorName
- Created comprehensive seed data for testing
- All API endpoints tested and working correctly
- Database persists data between restarts in erp.db file

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: Configured for PostgreSQL (via Neon) but includes SQLite setup
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reload with tsx

## Key Components

### Database Schema
The system manages the following core entities:
- **Users**: Authentication and user management
- **Customers**: Client information with GST details
- **Cages**: Physical storage units with capacity tracking
- **Delivery Challans**: Shipping documents with line items
- **Invoices**: Billing documents with customer references
- **Ledger Entries**: Financial transaction records

### API Structure
RESTful API endpoints for:
- CRUD operations for all entities
- Status-based filtering (active/inactive customers, available/occupied cages)
- Relationship queries (cages by customer, challans by customer)
- Test endpoint for system health checks

### Frontend Components
- Comprehensive UI component library from Shadcn/ui
- Form components with validation
- Data display components (tables, cards, dialogs)
- Navigation and layout components
- Mobile-responsive design patterns

## Data Flow

1. **Client Requests**: React frontend makes API calls using TanStack Query
2. **API Processing**: Express routes handle validation and business logic
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: JSON responses with proper error handling
5. **UI Updates**: React Query manages cache invalidation and UI updates

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL for production, better-sqlite3 for development
- **UI Framework**: React 18+ with TypeScript support
- **Build Tools**: Vite with React plugin and error overlay
- **Development**: Replit-specific plugins for enhanced development experience

### Key Libraries
- **ORM**: Drizzle with PostgreSQL and SQLite adapters
- **Validation**: Zod for schema validation
- **UI Components**: Radix UI primitives with Tailwind styling
- **HTTP Client**: Native fetch with TanStack Query wrapper
- **Date Handling**: date-fns for date manipulation

## Deployment Strategy

### Development Setup
- Replit-based development environment
- Hot reload for both frontend and backend
- SQLite database for local development
- Environment variable configuration

### Production Considerations
- PostgreSQL database via Neon
- Build process creates optimized static assets
- Express server serves both API and static files
- Database migrations handled via Drizzle Kit

### Environment Configuration
- Development: SQLite database, local file system
- Production: PostgreSQL connection, cloud deployment
- Environment variables for database URLs and configuration
- Separate build processes for client and server code

The architecture supports both development and production environments with appropriate database backends and build optimizations for each context.