# Translatoo

A modern translation management platform built with Angular 20, Material Design, and Nx monorepo architecture. Translatoo helps teams manage their application translations efficiently with support for multiple file formats, collaborative features, and real-time progress tracking.

## 🚀 Features

- **Multi-format Support**: Import/export translations in JSON, i18next, CSV, XML, ARB, XLIFF, iOS Strings, PO, and more
- **Project Management**: Organize translations by projects and languages
- **Progress Tracking**: Real-time translation progress visualization
- **Collaboration**: Team-based translation management
- **File Import/Export**: Seamless import from existing translation files
- **Modern UI**: Built with Angular Material and Tailwind CSS
- **Type Safety**: Full TypeScript support with shared type definitions

## 🏗️ Architecture

This is an Nx monorepo containing:

- **Frontend App** (`apps/frontend`): Angular 20 application with Material Design
- **Backend API** (`apps/api`): Express.js API server
- **Shared Types** (`shared-types`): Common TypeScript definitions
- **E2E Tests** (`e2e`): End-to-end testing with Playwright

## 📋 Prerequisites

- Node.js (18+ recommended)
- npm or yarn
- Supabase account (for backend database)

## 🚦 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd translatoo

# Install dependencies
npm install
```

### Development

#### Start the frontend application:

```bash
npm start
# or
nx serve translatoo
```

The application will be available at `http://localhost:4200/`

#### Start the backend API:

```bash
npm run start:api
# or
nx serve api
```

The API will be available at `http://localhost:3333/`

### Environment Setup

Create environment files for your Supabase configuration:

- `apps/frontend/src/environments/environment.development.ts`
- `apps/frontend/src/environments/environment.ts`

## 🧪 Testing

### Unit Tests

Run unit tests with Jest:

```bash
npm test
# or
npm run test:watch  # Watch mode
npm run test:ci     # CI mode
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

## 🔧 Building

### Development Build

```bash
npm run build
# or
nx build
```

### Production Build

```bash
nx build --configuration=production
```

Build artifacts will be stored in the `dist/` directory.

## 📁 Project Structure

```
translatoo/
├── apps/
│   ├── frontend/          # Angular frontend application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/     # Core services, guards, models
│   │   │   │   ├── features/ # Feature modules (projects, languages, etc.)
│   │   │   │   └── shared/   # Shared components
│   │   │   └── environments/ # Environment configurations
│   │   └── public/        # Static assets
│   ├── api/               # Express.js backend API
│   └── e2e/              # End-to-end tests
├── shared-types/          # Shared TypeScript definitions
└── tests/                # Additional test files
```

## 🛠️ Tech Stack

### Frontend

- **Angular 20** - Modern web framework
- **Angular Material** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Lucide Angular** - Beautiful icons

### Backend

- **Supabase** - Backend-as-a-Service (Database, Auth, API)
- **Express.js** - Web application framework
- **TypeScript** - Server-side type safety

### Development

- **Nx** - Monorepo development platform
- **Jest** - Testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
