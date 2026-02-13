# Trading Journal App - Design Plan

## Overview
A mobile trading journal app that allows traders to log trades and track performance metrics with visual analytics across different time periods.

## Screen List

1. **Home Screen** - Dashboard with quick stats and recent trades
2. **Trade Entry Screen** - Form to log new trades
3. **Trades List Screen** - Scrollable list of all trades with filters
4. **Trade Detail Screen** - View and edit individual trade details
5. **Analytics Screen** - Performance graphs and metrics (weekly, monthly, yearly)
6. **Settings Screen** - App preferences and configuration

## Primary Content and Functionality

### Home Screen (Dashboard)
- **Quick Stats Cards**: Display key metrics at a glance
  - Total P&L (profit/loss)
  - Win Rate percentage
  - Average Win/Loss ratio
  - Number of trades (today, this week)
- **Recent Trades List**: Last 5-10 trades with entry/exit prices and P&L
- **Quick Action Button**: Floating action button to add new trade

### Trade Entry Screen
- **Form Fields**:
  - Symbol/Ticker (text input)
  - Entry Date & Time (date/time picker)
  - Entry Price (decimal input)
  - Exit Date & Time (date/time picker)
  - Exit Price (decimal input)
  - Quantity/Shares (number input)
  - Trade Type (Long/Short - radio buttons)
  - Notes (text area)
  - Tags/Category (optional)
- **Auto-calculated Fields**:
  - P&L (profit/loss)
  - P&L % (percentage return)
  - Trade Duration
- **Action Buttons**: Save, Cancel, Delete (if editing)

### Trades List Screen
- **Filter Options**:
  - Date range selector
  - Trade type (Long/Short/All)
  - Profitable/Losing/All
- **Trade Cards**: Each showing:
  - Symbol, Entry/Exit prices
  - P&L amount and percentage
  - Entry date
  - Swipe actions: Edit, Delete
- **Empty State**: Message when no trades exist

### Trade Detail Screen
- **Read-only Display** of all trade information
- **Edit Button** to modify trade
- **Delete Button** with confirmation
- **Share Button** to export trade data

### Analytics Screen
- **Performance Metrics Section**:
  - Win Rate
  - Profit Factor
  - Average Win/Loss
  - Total P&L
  - Number of Trades
- **Time Period Selector**: Toggle between Weekly, Monthly, Yearly
- **Performance Graphs**:
  - Line chart: Cumulative P&L over time
  - Bar chart: P&L per period
  - Pie chart: Win/Loss distribution
- **Detailed Metrics Table**: Breakdown by period

### Settings Screen
- **Display Settings**:
  - Theme (Light/Dark)
  - Currency symbol
  - Decimal places
- **Data Management**:
  - Export trades (CSV)
  - Clear all data (with confirmation)
- **About**: App version and info

## Key User Flows

### Flow 1: Log a New Trade
1. User taps floating action button on Home
2. Trade Entry form appears
3. User fills in symbol, entry price, exit price, etc.
4. System auto-calculates P&L
5. User taps Save
6. Trade is stored, Home screen updates with new trade

### Flow 2: View Performance Analytics
1. User navigates to Analytics tab
2. Default view shows Weekly performance
3. User can toggle to Monthly or Yearly
4. Graphs and metrics update based on selected period
5. User can tap on graph points to see detailed trade info

### Flow 3: Edit Existing Trade
1. User navigates to Trades List
2. User swipes on a trade card or taps to view details
3. User taps Edit button
4. Trade Entry form opens with existing data
5. User modifies fields
6. User taps Save
7. Trade is updated, lists refresh

## Color Choices

- **Primary Brand Color**: #0a7ea4 (Professional Blue) - for CTAs and highlights
- **Success Color**: #22C55E (Green) - for profitable trades, positive metrics
- **Error Color**: #EF4444 (Red) - for losing trades, negative metrics
- **Background**: #ffffff (Light) / #151718 (Dark)
- **Surface**: #f5f5f5 (Light) / #1e2022 (Dark) - for cards and containers
- **Text Primary**: #11181C (Light) / #ECEDEE (Dark)
- **Text Secondary**: #687076 (Light) / #9BA1A6 (Dark) - for muted info
- **Border**: #E5E7EB (Light) / #334155 (Dark)

## Design Principles

- **Mobile-first**: All layouts optimized for portrait orientation (9:16)
- **One-handed usage**: Key actions accessible in thumb zone
- **Clarity**: Clear visual hierarchy with consistent spacing
- **Feedback**: Visual feedback for all interactions (press states, loading indicators)
- **Accessibility**: Sufficient color contrast, readable font sizes (minimum 16px for body text)
- **Performance**: Smooth scrolling, fast navigation between screens
