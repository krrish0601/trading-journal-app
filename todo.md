# Trading Journal App - TODO

## Core Features

- [x] Database schema for trades (entry, exit, symbol, P&L, etc.)
- [x] Trade entry form with auto-calculated P&L
- [x] Trade list screen with filtering
- [ ] Trade detail view and edit functionality
- [x] Home dashboard with quick stats
- [x] Analytics screen with performance metrics
- [x] Weekly performance graph and meter
- [x] Monthly performance graph and meter
- [x] Yearly performance graph and meter
- [x] Settings screen with theme toggle
- [ ] Data persistence with AsyncStorage

## UI Components

- [x] Trade card component
- [x] Stats card component
- [ ] Performance chart component (line, bar, pie)
- [ ] Date/time picker integration
- [x] Filter controls
- [x] Empty state screens

## Polish & Testing

- [ ] App icon and branding
- [ ] Responsive design validation
- [ ] End-to-end user flow testing
- [ ] Performance optimization
- [x] Dark mode support

## New Features - Phase 2

- [x] Remove authentication requirement - use local-only mode
- [x] Trade detail view screen with edit/delete functionality
- [x] Date picker integration for entry and exit dates
- [x] Visual chart component for performance trends
- [x] Search/filter by date range functionality
- [x] INR currency support alongside USD
- [x] CSV export functionality
- [x] PDF/Report export functionality
- [x] Update home screen to remove sign-in prompt

## Bug Fixes - Phase 3

- [x] Fix 10001 login error when creating trades
- [x] Remove all authentication/login/sign-in UI elements
- [x] Fix keyboard overlap issue on trade entry form
- [x] Adjust dialog positioning to avoid keyboard obscuring content

## New Features - Phase 3

- [x] Add trade editing capability with save functionality
- [x] Implement risk/reward ratio calculations
- [x] Create trade statistics dashboard with streaks and analysis

## New Features - Phase 4

- [x] Add trade filtering by symbol screen
- [x] Implement trade templates for frequently used setups
- [x] Create calendar heatmap view for trading activity
- [x] Fix CSV/PDF download functionality
- [x] Add image upload capability for trade screenshots
- [x] Create winning trades vs losing trades grouped view

## Bug Fixes - Phase 4

- [x] Fix image picker modal - implement proper image selection
- [x] Fix trade downloads - CSV/PDF export not working
- [x] Add rich text editor for trade journaling notes
- [x] Implement time-of-day performance metrics
- [x] Add trade comparison tool

## Phase 5 - Additional Features & Fixes

- [x] Fix image picker for native platforms (iOS/Android)
- [x] Add symbol-based statistics screen
- [x] Add monthly performance summary report

## Phase 6 - Dark Mode Fix & Equity Curve

- [x] Fix dark mode toggle not working
- [x] Implement equity curve visualization chart

## Phase 7 - Additional Features & Download Fix

- [x] Add trade notes persistence for each trade
- [x] Implement win/loss streak tracking on dashboard
- [x] Add performance comparison (week-over-week, month-over-month)
- [x] Add time entry option in trade entry form
- [x] Fix trades download functionality (CSV/PDF)

## Bug Fixes - Phase 8

- [x] Fix analytics screen crash in EquityCurve component
