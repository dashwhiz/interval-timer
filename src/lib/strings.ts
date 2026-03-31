/**
 * All user-facing strings in one place for future localization.
 */
const S = {
  // App
  appName: 'GRIND',
  appTagline: 'INTERVAL TIMER',

  // Home page
  yourWorkouts: 'YOUR WORKOUTS',
  presets: 'PRESETS',
  createFirstWorkout: 'Create your first workout',
  createFirstWorkoutSub: 'Tap here or the + button to get started',
  sessionsCompleted: (n: number) => `${n} session${n !== 1 ? 's' : ''} completed`,
  copyright: '© 2026 Grind',
  impressumLink: 'Impressum & Privacy',

  // Config page
  workoutName: 'WORKOUT NAME',
  intervals: 'INTERVALS',
  rounds: 'ROUNDS',
  addInterval: '+ ADD INTERVAL',
  total: (time: string) => `Total: ${time}`,
  saveToMyWorkouts: 'Save to my workouts',
  saveOnly: 'SAVE ONLY',
  update: 'UPDATE',
  deleteWorkout: 'Delete workout',
  linkCopied: 'Link copied!',

  // Timer page
  roundOf: (r: number, total: number) => `ROUND ${r} / ${total}`,
  next: (label: string) => `Next: ${label}`,

  // Complete page
  done: 'DONE',

  // Segment types
  work: 'WORK',
  rest: 'REST',
  getReady: 'GET READY',

  // Dialogs
  cancel: 'Cancel',
  deleteWorkoutTitle: 'Delete Workout?',
  deleteWorkoutMessage: (name: string) => `"${name}" will be removed from your saved workouts.`,
  deleteBtn: 'Delete',
  keepBtn: 'Keep',
  quitWorkoutTitle: 'Quit Workout?',
  quitWorkoutMessage: 'Your progress will be lost.',
  quitBtn: 'Quit',
  keepGoingBtn: 'Keep going',
  resetWorkoutTitle: 'Reset Workout?',
  resetWorkoutMessage: 'Timer will restart from the beginning.',
  resetBtn: 'Reset',
  continueBtn: 'Continue',
  unsavedChangesTitle: 'Unsaved Changes',
  unsavedChangesMessage: 'Save changes before starting?',
  justStart: 'Just start',
  saveAndStart: 'Save & start',
  gotIt: 'Got it',

  // Delete data
  deleteAllDataTitle: 'Delete all data?',
  deleteAllDataMessage: 'This will remove all your saved workouts, preferences, and session history. This cannot be undone.',
  deleteEverything: 'Delete everything',
  noDataStored: 'No data stored',
  deleteAllMyData: 'Delete all my data',

  // Legal / Impressum
  impressum: 'Impressum',
  privacyPolicy: 'Privacy Policy',
  feedbackWelcome: 'Feedback, bug reports, and feature ideas are always welcome! Reach out via LinkedIn or email.',
  privacyIntro: 'Grind takes your privacy seriously. Here is what you need to know:',
  privacyAnalytics: 'This app uses Google Analytics 4 to collect anonymous usage data such as page views, country of origin, and general device information. IP addresses are anonymized and no personally identifiable information is collected or stored. No advertising features are enabled. You can opt out by using a browser extension or disabling JavaScript.',
  privacyStorage: 'Your workouts and preferences are stored exclusively in your browser\'s local storage on your device. This data never leaves your device.',
  privacyNoAccounts: 'There is no user registration, login, or personal data collection of any kind.',
  privacySharing: 'If you choose to share a workout via link, the workout data is encoded in the URL itself. No data is stored on any server.',
  privacyRights: 'Since all data is stored locally on your device, you have full control. You can clear your data at any time using the button below.',
  personalProject: 'This is a personal, non-commercial project built with love and effort to make interval training easier — after not finding what I wanted on the market for free.',
  lastUpdated: 'Last updated: March 2026',

  // First-time welcome
  welcomeTitle: 'Welcome to Grind',
  welcomeBody: 'Build custom interval timers for HIIT, Tabata, CrossFit, or any workout.\n\nTap + to create your first workout, or pick a preset to get started. During a workout, tap the screen to pause or resume.\n\nShare any workout via link — perfect for coaches sending programs to clients remotely.\n\nAll your data stays on your device — no account needed.',
  welcomeBtn: 'Got it',

  // Aria labels
  ariaNewWorkout: 'New workout',
  ariaStartWorkout: 'Start workout',
  ariaDuplicateWorkout: 'Duplicate workout',
  ariaShareWorkout: 'Share workout',
  ariaGoHome: 'Go home',
  ariaDecrease: 'Decrease',
  ariaIncrease: 'Increase',
  ariaDecreaseRounds: 'Decrease rounds',
  ariaIncreaseRounds: 'Increase rounds',
  ariaRemoveInterval: 'Remove interval',
  ariaReset: 'Reset',
  ariaPause: 'Pause',
  ariaPlay: 'Play',
  ariaStop: 'Stop',
  ariaWorkoutInfo: 'Workout info',
} as const

export default S
