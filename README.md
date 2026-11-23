# FLOWDECK — Creative Agency Operating System
> **"One project. One workspace. One communication history. Complete visibility."**

Built as a direct, production-grade implementation of the Creative Agency Operating System Product Blueprint.

Repository: [https://github.com/myselfrakib/flowdeck](https://github.com/myselfrakib/flowdeck)

---

## 🌟 Executive Summary & Product Principles

StudioFlow replaces fragmented agency coordination across messaging apps, spreadsheets, calendar tools, and file-sharing links. It coordinates the people, files, decisions, and deadlines around commercial creative production:

$$\text{Client Brief} \longrightarrow \text{Planning} \longrightarrow \text{Shoot \& Call Sheet} \longrightarrow \text{Footage Vault} \longrightarrow \text{Edit Cuts} \longrightarrow \text{Timestamp Review} \longrightarrow \text{Client Sign-Off} \longrightarrow \text{Master Delivery}$$

---

## 📐 Blueprint Implementation Coverage

| Blueprint Section | Implemented Feature in Application | Source Reference |
| :--- | :--- | :--- |
| **01. Vision & Principles** | Project-centric collaboration, role-aware experiences, cloud storage abstraction | `src/types/index.ts`, `src/context/AppContext.tsx` |
| **02. Personas & Roles** | Interactive Role & Persona Simulator in top bar: Owner, Head Manager, HR Manager, Social Media Manager, Photographer, Videographer, Video Editor, Graphic Designer, Model/Talent, and External Client | `src/components/layout/TopBar.tsx`, `src/data/mockData.ts` |
| **03. Mobile-First & Responsive** | 5-item mobile bottom bar (`Home`, `Projects`, `Inbox`, `Calendar`, `More` bottom sheet), 48px touch targets, mobile safe areas, desktop persistent sidebar | `src/components/layout/MobileBottomNav.tsx`, `DesktopSidebar.tsx` |
| **04. Information Architecture** | Multi-tenant agency switcher (`Apex Media Studios`, `Neon Peak Creative`), global search (`⌘K`), category notification center | `src/components/layout/TopBar.tsx`, `GlobalSearchModal.tsx` |
| **05. End-to-End Workflows** | **Workflow A** (Brand Video creation stepper), **Workflow B** (Meeting rooms & convert-to-task), **Workflow C** (Shoots & RSVP), **Workflow D** (Editing versions & timestamp review), **Workflow E** (Blocker resolution) | `src/modules/projects/`, `CreateProjectModal.tsx` |
| **06. Project Workspace & Rooms** | 7 dedicated workspace tabs (`Overview`, `Tasks`, `Rooms`, `Schedule`, `Assets`, `Approvals`, `Activity`). Strict room separation: **Client Discussion** vs **Internal Planning** (hidden from clients) | `ProjectDetailView.tsx`, `ProjectRoomsTab.tsx` |
| **07. Shoot Scheduling & Calendar** | Agenda & Week calendar, crew call time tracker, RSVP status (`Accepted`, `Pending`, `Suggested Alternative`), **Automated Mobile Call Sheet Generator** | `CalendarView.tsx`, `CallSheetModal.tsx`, `ProjectScheduleTab.tsx` |
| **08. Media & Version Approvals** | 8-folder standard taxonomy (`01_Brief` to `08_Final_Delivery`), external Google Drive link support, interactive video review player, timestamped feedback notes (`00:14`), digital client signature with confetti celebration | `ProjectAssetsTab.tsx`, `ProjectApprovalsTab.tsx`, `ClientPortalView.tsx` |
| **09. Screen Specifications** | 100% responsive implementations for all 22 required screens & view states | `src/modules/` |
| **10. Design System & Tokens** | Blueprint design tokens (`#2563EB` Primary, `#102A43` Navy, `#0EA5E9` Accent, `#F4F7FB` Canvas, `#D9E2EC` Border, WCAG 2.2 AA compliant) | `src/index.css`, `src/components/shared/` |
| **11. Application Architecture** | React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Canvas Confetti | `package.json`, `vite.config.ts` |
| **12. Firebase & Data Model** | Strongly-typed domain models matching the blueprint Firestore collection architecture | `src/types/index.ts` |
| **13. Security & Access Control** | **Live Role & Permission Matrix (Page 20 of blueprint)** in Settings, client privacy guards, HR confidentiality boundary | `src/modules/settings/SettingsView.tsx`, `HRView.tsx` |

---

## 🚀 Key Modules & How to Test

### 1. Persona & Role Simulator (Top Right Bar)
Switch between 10 live personas on the fly to test role-based access control:
- **Marcus Vance (Agency Owner)**: Full access to all business workspaces, financial reports, HR records, and settings.
- **Elena Rostova (Head of Production)**: Cross-project task coordinator and internal approval authority.
- **Sarah Jenkins (HR Manager)**: Access to confidential HR directory and leave scheduling.
- **Zoe Chen (Senior Video Editor)**: Assigned edit tasks, ProRes upload queue, timestamp feedback notes.
- **Liam O'Connor (Senior Videographer)**: On-shoot camera rushes, call sheet RSVP, schedule alternative proposals.
- **Chloe Bennett (Talent / Model)**: Mobile call sheet viewer, wardrobe notes, call times.
- **Claire Dupont (Client VP)**: Isolated Client Portal view—internal agency gossip, internal rooms, and margins are strictly stripped away!

### 2. Dedicated Client Approval Portal (`Client View` button or switch to Claire)
- Minimalist, client-focused review screener.
- Scrub the video timeline and leave timestamped comments (e.g., at `00:14`).
- Enter signee name and click **"Approve & Sign Off Version"** to trigger official audit record locking and celebratory confetti.

### 3. Mobile Production Call Sheet Generator
- Go to any project's **Shoot & Call Sheet** tab or **Shoot Calendar**.
- Click **"Open Call Sheet"** to launch the print-ready, mobile-optimized call sheet with:
  - Location address + Google Maps directions link
  - Nearest emergency hospital & on-set medic contact
  - General crew call (07:00 AM) and individualized call times
  - Day shooting schedule (Breakfast, First Shot Up, Catered Lunch, Wrap)
  - Wardrobe breakdown & camera/lighting gear package
  - One-click **Print** and **Share** link copying.

### 4. Meeting Rooms & "Convert to Task"
- Open **Rooms & Chat** tab in any project.
- Notice the **"Client Visible Room"** vs **"Agency Internal Only"** badges.
- Hover over any discussion message and click **"Convert to Task"** to immediately transform creative discussion into an assigned project task with due date!

---

## 🛠️ Technology Stack

- **Framework**: React 19 (TypeScript strict mode)
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 with custom StudioFlow semantic tokens
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, Tailwind transitions
- **Architecture**: Modular domain structure (`modules/`, `components/`, `context/`, `types/`)

---

## 💻 Local Development & Build

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview
```
