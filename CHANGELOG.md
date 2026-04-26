# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-04-26

### Added
- **TypeScript Migration**: Full codebase migration from JavaScript to TypeScript for improved type safety.
- **SOLID Architecture**: Refactored components and created scalable `BaseService` architecture.
- **Security Enhancements**: 
  - JWT middleware for all `/api/*` routes.
  - Express-validator for API input sanitization.
  - Helmet configured with strict Content Security Policy.
  - Rate limiting (IP and session-based).
  - Winston logger for comprehensive auditing.
- **Performance & PWA**: 
  - Integrated `vite-plugin-pwa` for offline capabilities and caching.
  - Web Worker (`quizScorer.worker.ts`) implemented for off-main-thread quiz scoring.
  - IndexedDB caching for Gemini responses.
  - React.lazy and Suspense for code splitting.
- **Testing Capabilities**: 
  - Configured Jest and Playwright for unit, integration, and E2E testing.
  - Reached target coverage (branches: 80, functions: 85, lines: 85, statements: 85).
  - Accessibility testing integrated using `jest-axe`.
- **Accessibility Improvements**: 
  - Full WCAG 2.1 AA compliance.
  - Focus trap integration and skip-to-content links.
  - ARIA live regions and appropriate roles.
- **Google API Integrations**: 
  - Google Civic Information API for authentic polling place data.
  - Gemini Structured Tool Outputs (Function Calling) for dynamic quiz generation.
  - Google Cloud Logging in Express server.
- **Documentation**: New `docs/ARCHITECTURE.md` to map data flow and project layout.
