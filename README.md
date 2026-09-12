# BitBuzz

BitBuzz is a student built digital media and technology platform focused on science, technology, space, cybersecurity, aviation, and innovation.

The platform started as a student run newsroom and has evolved into a broader ecosystem combining publishing, community participation, cybersecurity awareness, research, opportunities, newsletters, authentication, administration, and student engagement.

**Website:** https://bitbuzz.app

**Repository:** https://github.com/hridhaan-s/The-BitBuzz-Site

## About

BitBuzz exists to make complex developments in science and technology easier for young people to understand while giving students a platform to participate in the process.

The platform focuses on five primary areas:

| Category      | Focus                                                             |
| ------------- | ----------------------------------------------------------------- |
| Space         | Astronomy, spaceflight, rockets, exploration and space technology |
| Cybersecurity | Digital safety, phishing, scams, privacy and security             |
| Technology    | AI, computing, software, hardware and emerging technology         |
| Aviation      | Aircraft, aerospace, aviation technology and transportation       |
| Innovations   | Engineering, inventions, research and new ideas                   |

The philosophy behind BitBuzz is simple:

> Students should not only consume technology. They should understand it, question it, report on it and build with it.

## Features

### Newsroom

The newsroom provides the main editorial experience of BitBuzz.

It includes:

* Featured stories
* Article cards
* Full article reader
* Category based discovery
* Reading time information
* Editorial metadata
* Article reactions
* Breaking news ticker
* Responsive layouts
* Light and dark themes

### Explore

The Explore system organizes BitBuzz content around its core categories.

Users can browse:

* Space
* Cybersecurity
* Technology
* Aviation
* Innovations

The navigation system provides both desktop and mobile experiences.

### Search

BitBuzz includes a dedicated search experience for discovering content across the platform.

The search architecture is separated from the main newsroom so it can evolve independently as the content library grows.

### Article Submission

BitBuzz allows contributors to submit articles through the platform.

The submission system provides the foundation for a complete editorial workflow without requiring contributors to have direct access to the source code.

### Markdown

Articles can be structured using Markdown.

The platform includes Markdown rendering and enhancement functionality for creating consistent editorial content.

### Breaking News

BitBuzz supports a live headline ticker powered through an API endpoint.

The frontend requests headlines from:

```text
/api/news
```

When headlines are available, they are displayed in a scrolling ticker with their source and a link to the original article.

The ticker is designed to fail gracefully if the external feed becomes unavailable.

### Flag It

Flag It is BitBuzz's cybersecurity and scam reporting initiative.

It provides a structured way for users to report suspicious online activity while giving administrators tools to review and manage reports.

The system includes:

* Scam reporting
* Report management
* Administrative review
* Cybersecurity awareness
* Structured report handling

The goal is to make cybersecurity practical and understandable for students.

### Chanakya Assist

Chanakya Assist is BitBuzz's AI oriented experience.

It is designed to help users interact with information and research while keeping the editorial layer under human control.

The AI functionality is modular so that it can evolve independently from the core newsroom.

### Opportunities

BitBuzz includes an Opportunities section designed to help students discover useful opportunities.

It supports:

* Opportunity listings
* Opportunity discovery
* Opportunity promotion
* Opportunity creation
* Administrative management

The objective is to connect information with action.

### Research Library

The Research Library provides a place for deeper material beyond conventional news articles.

It is intended for readers who want to investigate a subject in greater depth.

### Magazines

BitBuzz includes infrastructure for digital magazine publishing.

The magazine system contains:

* Magazine editor
* Magazine viewer
* Publication layouts
* Structured publication content

This allows BitBuzz to publish larger editorial projects in addition to individual articles.

### Newsletter

BitBuzz includes a dedicated newsletter system.

It supports:

* Newsletter signup
* Subscriber management
* Newsletter administration
* Newsletter drafting
* Unsubscribe functionality
* Branded email delivery

The production sending identity is:

```text
BitBuzz Squad
Onboard@bitbuzz.app
```

The email infrastructure uses Resend for delivery.

### Authentication

BitBuzz uses Supabase for authentication and backend services.

Authentication functionality includes:

* Account creation
* Login
* Authentication navigation
* Password reset
* User profiles
* Authenticated experiences
* Administrative access

Authentication allows public content to remain accessible while privileged functionality can be restricted.

### Profiles

Authenticated users can have profiles.

The profile system provides the foundation for future community functionality and personalized experiences.

### Ambassadors

BitBuzz includes infrastructure for a student ambassador program.

The system contains:

* Public ambassador profiles
* Ambassador submissions
* Ambassador dashboards
* Ambassador management
* Administrative controls

This allows BitBuzz to grow beyond a single publication into a distributed student community.

### Administration

BitBuzz contains a dedicated administrative layer rather than relying entirely on direct database management.

Administrative functionality includes:

* Content management
* Flag It management
* Ambassador management
* Opportunity management
* Opportunity creation
* Newsletter management
* Markdown tools
* Analytics
* Administrative tools
* Super administrator functionality

The repository contains separate components for many of these systems.

### Analytics

BitBuzz includes analytics interfaces for understanding platform activity and content performance.

Analytics can be used to evaluate:

* Content performance
* Platform activity
* Audience behavior
* Editorial performance
* Administrative metrics

## Technology Stack

BitBuzz is built using modern web technologies.

| Technology   | Purpose                             |
| ------------ | ----------------------------------- |
| React        | Frontend application                |
| TypeScript   | Type safe development               |
| Vite         | Development and build tooling       |
| Tailwind CSS | Styling                             |
| Supabase     | Authentication and backend services |
| Vercel       | Deployment                          |
| Resend       | Email infrastructure                |
| Cloudflare   | DNS and edge infrastructure         |
| GitHub       | Source control                      |

The current application uses React 19, TypeScript, Vite, Tailwind CSS and Supabase.

## Architecture

BitBuzz is structured as a modular React application.

A simplified representation of the platform is:

```text
BitBuzz
|
|-- Public Newsroom
|   |-- Home
|   |-- Articles
|   |-- Categories
|   |-- Search
|   |-- Research
|   |-- Magazines
|   `-- Opportunities
|
|-- Community
|   |-- Submit
|   |-- Profiles
|   `-- Ambassadors
|
|-- Cybersecurity
|   `-- Flag It
|
|-- AI
|   `-- Chanakya Assist
|
|-- Communications
|   |-- Newsletter
|   |-- Subscribers
|   `-- Email Delivery
|
|-- Administration
|   |-- Content
|   |-- Flag It
|   |-- Ambassadors
|   |-- Opportunities
|   |-- Newsletter
|   |-- Analytics
|   `-- Super Admin
|
`-- Infrastructure
    |-- Supabase
    |-- Resend
    |-- Vercel
    `-- Cloudflare
```

The repository is divided into dedicated React components for the newsroom, authentication, administration, ambassadors, Flag It, opportunities, newsletters, magazines, research, profiles, search, navigation and other platform functionality.

## Project Structure

```text
The-BitBuzz-Site/
|
|-- api/
|
|-- public/
|
|-- src/
|   |
|   |-- Admin.tsx
|   |-- AdminAmbassadors.tsx
|   |-- AdminFlagIt.tsx
|   |-- AdminOpportunities.tsx
|   |-- AdminOpportunityCreate.tsx
|   |-- AdminToolsTabs.tsx
|   |
|   |-- AmbassadorSubmit.tsx
|   |-- AmbassadorsDashboardFinal.tsx
|   |-- AmbassadorsPublic.tsx
|   |
|   |-- AnalyticsPanel.tsx
|   |-- ArticleReader.tsx
|   |-- ArticleReactions.tsx
|   |
|   |-- AuthNav.tsx
|   |-- AuthPage.tsx
|   |-- ResetPasswordPage.tsx
|   |
|   |-- Blog.tsx
|   |-- CategoriesPage.tsx
|   |-- HomeNewsroom.tsx
|   |-- LandingPage.tsx
|   |
|   |-- FlagItPage.tsx
|   |-- OpportunitiesPage.tsx
|   |
|   |-- ChanakyaAssist.tsx
|   |-- ResearchLibrary.tsx
|   |-- SpaceDispatches.tsx
|   |
|   |-- MagazineEditor.tsx
|   |-- MagazineViewer.tsx
|   |
|   |-- NewsletterAdminPanel.tsx
|   |-- NewsletterDesk.tsx
|   |-- NewsletterSignup.tsx
|   |-- UnsubscribePage.tsx
|   |
|   |-- ProfilePage.tsx
|   |-- SearchPage.tsx
|   |-- SubmitPage.tsx
|   |
|   |-- SuperAdminPanel.tsx
|   |-- UniversalNavbar.tsx
|   |-- SiteFooter.tsx
|   |
|   |-- lib/
|   |   |-- supabase.ts
|   |   `-- theme.ts
|   |
|   |-- App.tsx
|   |-- main.tsx
|   `-- index.css
|
|-- index.html
|-- package.json
|-- tailwind.config.ts
|-- vite.config.ts
|-- vercel.json
|-- wrangler.json
`-- tsconfig files
```

The current repository contains the components and configuration shown above, including dedicated backend API infrastructure and Cloudflare related configuration.

## Local Development

### Requirements

Install:

* Node.js
* npm
* Git

### Clone the repository

```bash
git clone https://github.com/hridhaan-s/The-BitBuzz-Site.git
cd The-BitBuzz-Site
```

### Install dependencies

```bash
npm install
```

### Environment configuration

Create a local environment file:

```text
.env.local
```

Configure the required Supabase and other service variables.

Never commit private credentials or service keys to the repository.

### Start development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

The current package configuration provides Vite development and preview commands and a production build that runs TypeScript checking before Vite builds the application.

## Deployment

BitBuzz is designed around a separated cloud architecture.

```text
Frontend
    |
    v
Vercel

Backend
    |
    v
Supabase

Email
    |
    v
Resend

DNS
    |
    v
Cloudflare
```

This separation allows individual infrastructure components to evolve without requiring the entire platform to be rebuilt.

## Domain Architecture

The primary BitBuzz domain is:

```text
bitbuzz.app
```

The platform can use dedicated subdomains for individual services.

The authentication infrastructure uses:

```text
auth.bitbuzz.app
```

This allows authentication and other services to remain logically separated from the public newsroom.

## Email Infrastructure

BitBuzz's email architecture is designed around Resend.

The system supports:

```text
Authentication
    |
    |-- OTP
    |-- Verification
    `-- Account emails

Newsletter
    |
    |-- Subscriber lists
    |-- Campaigns
    `-- Unsubscribe

Transactional Email
    |
    `-- Platform notifications
```

Domain email authentication includes SPF, DKIM and DMARC configuration.

Existing mail records should be preserved when modifying DNS configuration.

## Security

BitBuzz handles authentication, user submissions, reports and administrative functionality, making security an important part of the architecture.

Core principles include:

* Never expose private API keys
* Never expose Supabase service role credentials
* Protect administrative functionality
* Validate user generated content
* Use backend authorization for privileged operations
* Keep public and private functionality separated
* Treat inbound email as untrusted input
* Validate webhook requests
* Avoid trusting client side role information
* Store secrets only in appropriate environment configuration

## Accessibility

Accessibility is considered throughout the interface.

The application includes features such as:

* Semantic navigation
* Keyboard accessible controls
* Focus states
* Accessible labels
* Responsive navigation
* Skip to main content functionality

## Responsive Design

BitBuzz is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The navigation system includes a dedicated mobile interface with a mobile menu, responsive controls and touch friendly layouts.

## Theme System

BitBuzz supports:

* Light mode
* Dark mode

Theme handling is centralized through the application's theme utilities.

This keeps theme behavior consistent across the platform.

## Design Philosophy

BitBuzz is intentionally designed to avoid the appearance of a generic school project.

The design direction emphasizes:

* Editorial clarity
* Strong typography
* Minimal interfaces
* High contrast
* Technology focused visual language
* Responsive layouts
* Content first design

The interface is designed to make information feel modern without sacrificing readability.

## Product Philosophy

BitBuzz is built around a simple progression:

```text
Discover
   |
   v
Learn
   |
   v
Question
   |
   v
Build
   |
   v
Share
```

The objective is not to create another generic news feed.

The objective is to build a platform where young people can discover important developments, understand them and participate in the technology ecosystem around them.

## History

BitBuzz began as a student run digital news and awareness platform in 2025.

The original publication focused on science, space, technology, aviation, biology and innovation.

The project later expanded into a broader platform with:

* Community submissions
* Flag It
* Opportunities
* Ambassadors
* Authentication
* Profiles
* Newsletters
* Research
* Magazines
* AI functionality
* Analytics
* Administrative infrastructure

The current project therefore represents a transition from a simple publication into a broader student technology platform.

## Development Principles

BitBuzz follows several engineering principles.

### Modular architecture

Features should be implemented as reusable components rather than creating a monolithic application.

### Preserve existing functionality

New features should not break established workflows.

### Responsive by default

Every significant interface should work across different screen sizes.

### Security first

Credentials, permissions and user generated content must be handled carefully.

### Progressive enhancement

External services should improve the experience without making the entire platform unusable when they fail.

### Editorial quality

BitBuzz should prioritize useful information and strong journalism over clickbait.

## Contributing

BitBuzz is a student led project.

Before contributing:

1. Understand the existing architecture.
2. Keep components modular.
3. Avoid unnecessary dependencies.
4. Test responsive layouts.
5. Check authentication boundaries.
6. Never commit secrets.
7. Preserve existing functionality.
8. Keep new interfaces consistent with the BitBuzz design system.

For major architectural changes, discuss the change with the maintainers before implementation.

## Responsible Disclosure

If you discover a security vulnerability, please report it privately rather than publicly publishing sensitive details.

Include:

* Description of the issue
* Steps to reproduce
* Potential impact
* Relevant screenshots or logs

## Project Status

BitBuzz is an actively evolving project.

The platform contains both production infrastructure and systems that continue to be developed.

The architecture is intentionally designed to support additional publishing, community, cybersecurity, AI and student focused functionality without requiring a complete rewrite.

## Maintainer

BitBuzz is founded and maintained by **Hridhaan Sahay** with contributions from students and collaborators.

## License

Unless a separate license file exists in this repository, the source code should not be assumed to be freely reusable.

Contact the maintainers before redistributing substantial portions of the project.

## BitBuzz

BitBuzz is built around one idea:

**The future is being built. We report on it.**
