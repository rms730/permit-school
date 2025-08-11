# Learner Experience - Sprint 23

## Overview

Sprint 23 focuses on modernizing the learning, quiz, and exam experiences to be modern, fast, and friendly on mobile while ensuring CA seat-time compliance. This sprint introduces engagement tracking, improved accessibility, and modern UI components.

## Key Features

### 1. Engagement Tracking & Seat-Time Integrity

#### IdleTracker
- **Purpose**: Tracks user engagement and idle time for CA compliance
- **Features**:
  - Monitors mouse, keyboard, scroll, and touch events
  - Handles tab switching and window focus/blur
  - Configurable idle timeout and heartbeat intervals
  - React hook for easy integration

#### Heartbeat API
- **Endpoint**: `/api/progress/heartbeat`
- **Purpose**: Server-side engagement tracking
- **Features**:
  - Updates user's last activity timestamp
  - Logs engagement activity for analytics
  - Supports idle/active state tracking

### 2. Modern Learn v2 Components

#### UnitHeader
- **Features**:
  - Sticky header with progress bar
  - Unit information and navigation
  - Bookmark functionality
  - Mobile-responsive design

#### StickyActions
- **Features**:
  - Fixed bottom navigation
  - Previous/Next buttons
  - Play controls (optional)
  - Volume and fullscreen controls
  - Mobile-optimized layout

#### ReadingProgress
- **Features**:
  - Visual progress indicator
  - Section navigation
  - Time tracking
  - Mobile section navigation

### 3. QuizPlayer v2

#### Accessibility Features
- **Keyboard Navigation**:
  - Arrow keys for choice navigation
  - Enter to submit answers
  - Tab for focus management
- **Screen Reader Support**:
  - Proper ARIA labels
  - Live regions for feedback
  - Semantic HTML structure

#### Modern UI
- **Progress Tracking**: Visual progress bar with percentage
- **Feedback System**: Immediate feedback with explanations
- **Celebration**: Confetti animations (respects reduced motion)
- **Mobile-First**: Touch-friendly interface

#### Features
- Accessibility menu with keyboard shortcuts
- Mute/unmute functionality
- Fullscreen support
- Snackbar notifications

### 4. ExamPlayer v2

#### Advanced Features
- **Time Management**: Countdown timer with warnings
- **Question Flagging**: Mark questions for review
- **Review System**: Comprehensive question review dialog
- **Pause/Resume**: Exam pause functionality
- **Progress Tracking**: Detailed progress with answered/flagged counts

#### Accessibility
- **Keyboard Shortcuts**:
  - Arrow keys: Navigate choices
  - Enter: Submit answer
  - Space: Pause/Resume exam
  - F: Flag question
  - R: Review questions
- **Screen Reader Support**: Full accessibility compliance

### 5. Resume Helper

#### Features
- **Smart Resume**: Shows last accessed unit/quiz
- **Progress Summary**: Overall progress and time spent
- **Quick Actions**: Direct links to resume learning
- **Mobile Optimized**: Responsive design

#### Integration
- **AppBar CTA**: Resume button in navigation
- **Dashboard Integration**: Prominent placement on dashboard
- **Contextual**: Shows relevant information based on user state

### 6. Confetti Celebrations

#### Features
- **Lightweight**: Canvas-based animations
- **Accessible**: Respects `prefers-reduced-motion`
- **Customizable**: Configurable colors, shapes, and effects
- **Performance**: Optimized for smooth animations

#### Usage
- Correct answers in quizzes/exams
- Milestone achievements
- Course completions

## Technical Implementation

### Database Schema

```sql
-- Profile fields for engagement tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_tip timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_celebration_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allow_confetti boolean NOT NULL DEFAULT true;
```

### API Endpoints

#### Heartbeat API
```typescript
POST /api/progress/heartbeat
{
  userId: string;
  isIdle: boolean;
  lastActivity: string;
  currentPage?: string;
  sessionId?: string;
}
```

### Component Architecture

#### IdleTracker
```typescript
const { startTracking, stopTracking, getState } = useIdleTracker({
  idleTimeoutMs: 300000, // 5 minutes
  heartbeatIntervalMs: 30000, // 30 seconds
  onIdle: () => handleIdle(),
  onActive: () => handleActive(),
  onHeartbeat: () => sendHeartbeat(),
});
```

#### Confetti
```typescript
const { fire, stop } = useConfetti();

// Fire confetti on correct answer
fire({
  particleCount: 30,
  spread: 60,
  origin: { x: 0.5, y: 0.3 },
});
```

## Accessibility Features

### WCAG 2.2 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and live regions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets AA standards
- **Reduced Motion**: Respects user preferences

### Keyboard Shortcuts

#### Quiz Navigation
- `↑↓` Arrow keys: Navigate choices
- `←→` Arrow keys: Previous/Next question
- `Enter`: Submit answer

#### Exam Navigation
- `↑↓` Arrow keys: Navigate choices
- `←→` Arrow keys: Previous/Next question
- `Enter`: Submit answer
- `Space`: Pause/Resume exam
- `F`: Flag question
- `R`: Review questions

## Mobile Experience

### Responsive Design
- **Mobile-First**: Designed for mobile devices first
- **Touch-Friendly**: Minimum 44px touch targets
- **Gesture Support**: Swipe navigation where appropriate
- **Performance**: Optimized for mobile performance

### Mobile-Specific Features
- **Sticky Navigation**: Always accessible navigation
- **Section Navigation**: Horizontal scroll for sections
- **Touch Feedback**: Visual feedback for touch interactions
- **Viewport Optimization**: Proper viewport handling

## Internationalization

### Supported Languages
- **English (EN)**: Primary language
- **Spanish (ES)**: Secondary language

### Key Translation Categories
- **Navigation**: Previous, Next, Submit, etc.
- **Feedback**: Correct, Incorrect, Loading, etc.
- **Accessibility**: Keyboard shortcuts, ARIA labels
- **Progress**: Time tracking, completion status
- **Celebrations**: Success messages and animations

## Testing

### Unit Tests
- **IdleTracker**: Engagement tracking functionality
- **Confetti**: Animation and accessibility features
- **Components**: Individual component behavior

### E2E Tests
- **Learner Flow**: Complete learning experience
- **Quiz Experience**: Quiz interaction and feedback
- **Exam Experience**: Exam functionality and features
- **Accessibility**: Keyboard navigation and screen reader support
- **Mobile**: Responsive design and touch interactions

## Performance Considerations

### Optimization
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Debouncing**: User input debouncing
- **Virtual Scrolling**: For large lists (future)

### Monitoring
- **Engagement Metrics**: Track user engagement patterns
- **Performance Metrics**: Monitor component performance
- **Accessibility Metrics**: Track accessibility usage
- **Error Tracking**: Monitor and report errors

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed learning analytics
- **Personalization**: Adaptive learning paths
- **Offline Support**: Offline learning capabilities
- **Advanced Accessibility**: More accessibility features

### Technical Improvements
- **Performance**: Further optimization
- **Scalability**: Handle larger user bases
- **Integration**: Better integration with existing systems
- **Monitoring**: Enhanced monitoring and alerting

## Configuration

### Environment Variables
```bash
# Engagement tracking
NEXT_PUBLIC_IDLE_TIMEOUT_MS=300000
NEXT_PUBLIC_HEARTBEAT_INTERVAL_MS=30000

# Accessibility
NEXT_PUBLIC_ENABLE_CONFETTI=true
NEXT_PUBLIC_REDUCED_MOTION=false
```

### Feature Flags
```typescript
// Enable/disable features
const FEATURES = {
  ENGAGEMENT_TRACKING: true,
  CONFETTI_CELEBRATIONS: true,
  ADVANCED_ACCESSIBILITY: true,
  MOBILE_OPTIMIZATIONS: true,
};
```

## Troubleshooting

### Common Issues
1. **IdleTracker not working**: Check event listener setup
2. **Confetti not showing**: Check reduced motion preferences
3. **Keyboard navigation issues**: Verify focus management
4. **Mobile performance**: Check component optimization

### Debug Tools
- **React DevTools**: Component state inspection
- **Accessibility Tools**: Screen reader testing
- **Performance Tools**: Performance monitoring
- **Mobile Testing**: Device testing tools

## Support

### Documentation
- **Component API**: Detailed component documentation
- **Accessibility Guide**: Accessibility implementation guide
- **Performance Guide**: Performance optimization guide
- **Mobile Guide**: Mobile development guide

### Resources
- **Design System**: Component design specifications
- **Accessibility Standards**: WCAG 2.2 guidelines
- **Performance Best Practices**: Performance optimization
- **Mobile Best Practices**: Mobile development guidelines
