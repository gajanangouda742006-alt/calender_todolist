const mongoose = require('mongoose');

// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    // Retained for compatibility with existing account and client data.
    emailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerification: {
      codeHash: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      lastSentAt: { type: Date, default: null },
      resendAvailableAt: { type: Date, default: null },
      windowStartedAt: { type: Date, default: null },
      sendsInWindow: { type: Number, default: 0 },
    },

    passwordReset: {
      codeHash: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      lastSentAt: { type: Date, default: null },
      resendAvailableAt: { type: Date, default: null },
      windowStartedAt: { type: Date, default: null },
      sendsInWindow: { type: Number, default: 0 },
    },

    profile: {
      dateOfBirth: {
        type: Date,
        default: null,
      },

      gender: {
        type: String,
        default: null,
      },

      location: {
        type: String,
        default: null,
      },

      profileImage: {
        type: String,
        default: null,
      },

      phone: {
        type: String,
        default: null,
      },
    },

    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },

      goals: [
        {
          type: String,
        },
      ],

      interests: [
        {
          type: String,
        },
      ],
      timeZone: {
        type: String,
        default: 'Asia/Kolkata',
      },
      planningStyle: {
        type: String,
        default: '',
      },
      onboardingCompleted: {
        type: Boolean,
        default: false,
      },
      reminderSettings: {
        enabled: {
          type: Boolean,
          default: true,
        },
        eventsEnabled: {
          type: Boolean,
          default: true,
        },
        tasksEnabled: {
          type: Boolean,
          default: true,
        },
        defaultLeadMinutes: {
          type: Number,
          enum: [0, 5, 10, 15, 30, 60],
          default: 15,
        },
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'users',
  }
);


// ==========================================
// EVENT SCHEMA
// ==========================================

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      default: null,
    },

    endTime: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      default: 'General',
    },

    location: {
      type: String,
      default: '',
    },

    reminder: {
      type: String,
      default: '',
    },

    assistantRequestId: { type: String, default: undefined, select: false },

    reminderNotifiedAt: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'events',
  }
);


// ==========================================
// TASK SCHEMA
// ==========================================

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    date: {
      type: String,
      default: null,
    },

    time: {
      type: String,
      default: null,
    },

    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High'],
      default: 'Normal',
    },

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
      default: 'Pending',
    },

    completed: {
      type: Boolean,
      default: false,
    },

    reminder: {
      type: String,
      default: '',
    },

    assistantRequestId: { type: String, default: undefined, select: false },

    reminderNotifiedAt: {
      type: Date,
      default: null,
    },

    category: {
      type: String,
      default: 'General',
    },

    completedAt: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'tasks',
  }
);


// ==========================================
// MOOD SCHEMA
// ==========================================

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    mood: {
      type: String,
      required: true,
    },

    energy: {
      type: Number,
      default: 0,
    },

    note: {
      type: String,
      default: '',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'moods',
  }
);


// ==========================================
// HABIT SCHEMA
// ==========================================

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    goal: {
      type: Number,
      default: 1,
    },

    progress: {
      type: Number,
      default: 0,
    },

    frequency: {
      type: String,
      default: 'Daily',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'habits',
  }
);


// ==========================================
// HABIT LOG SCHEMA
// ==========================================

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'habitLogs',
  }
);


// ==========================================
// GOAL SCHEMA
// ==========================================

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    duration: {
      type: String,
      default: '30 days',
    },

    current: {
      type: Number,
      default: 0,
    },

    target: {
      type: Number,
      default: 30,
    },

    progress: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: 'Active',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'goals',
  }
);


// ==========================================
// REMINDER SCHEMA
// ==========================================

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      default: '',
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    note: {
      type: String,
      default: '',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'reminders',
  }
);


// ==========================================
// NOTE SCHEMA
// ==========================================

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      default: 'Note',
    },

    content: {
      type: String,
      default: '',
    },

    date: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'notes',
  }
);


// ==========================================
// FINANCE / TRANSACTION SCHEMA
// ==========================================

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      default: 'General',
      trim: true,
    },

    note: {
      type: String,
      default: '',
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank', 'Card', 'Cash'],
      default: 'Cash',
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
    assistantRequestId: { type: String, default: undefined, select: false },
  },
  {
    collection: 'transactions',
  }
);

transactionSchema.index({
  userId: 1,
  date: -1,
});


// ==========================================
// ASSET / NOTEPAD SCHEMA
// ==========================================

const assetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      default: 'Note',
    },

    content: {
      type: String,
      default: '',
    },

    tags: {
      type: String,
      default: 'Note',
    },

    assistantRequestId: { type: String, default: undefined, select: false },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'assets',
  }
);

// Short-lived receipt used to make signed Sahra assistant confirmations
// single-use. A TTL index removes receipts after the signed proposal expires.
const assistantActionReceiptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actionId: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { collection: 'assistantActionReceipts' }
);


// ==========================================
// CREATE MODELS
// ==========================================

const User = mongoose.model('User', userSchema);

const Event = mongoose.model('Event', eventSchema);

const Task = mongoose.model('Task', taskSchema);

const Mood = mongoose.model('Mood', moodSchema);

const Habit = mongoose.model('Habit', habitSchema);

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

const Goal = mongoose.model('Goal', goalSchema);

// Goal & Achievements is distinct from the Progress Tracker Goal model.
// Keep the complete client object as a Mixed payload to preserve future metadata.
const goalAchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: String, required: true, trim: true, maxlength: 160 },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'goalAchievements', minimize: false });
goalAchievementSchema.index({ userId: 1, goalId: 1 }, { unique: true });
const GoalAchievement = mongoose.models.GoalAchievement || mongoose.model('GoalAchievement', goalAchievementSchema);

const Reminder = mongoose.model('Reminder', reminderSchema);

const Note = mongoose.model('Note', noteSchema);

const Transaction = mongoose.model('Transaction', transactionSchema);

const Asset = mongoose.model('Asset', assetSchema);

const AssistantActionReceipt = mongoose.model('AssistantActionReceipt', assistantActionReceiptSchema);


// ==========================================
// INDEXES
// ==========================================

eventSchema.index({
  userId: 1,
  date: 1,
});
eventSchema.index({ userId: 1, assistantRequestId: 1 }, { unique: true, partialFilterExpression: { assistantRequestId: { $type: 'string' } } });

taskSchema.index({
  userId: 1,
  date: 1,
});
taskSchema.index({ userId: 1, assistantRequestId: 1 }, { unique: true, partialFilterExpression: { assistantRequestId: { $type: 'string' } } });
assetSchema.index({ userId: 1, assistantRequestId: 1 }, { unique: true, partialFilterExpression: { assistantRequestId: { $type: 'string' } } });
transactionSchema.index({ userId: 1, assistantRequestId: 1 }, { unique: true, partialFilterExpression: { assistantRequestId: { $type: 'string' } } });

moodSchema.index({
  userId: 1,
  date: 1,
});

habitLogSchema.index({
  userId: 1,
  date: 1,
});

// One completion per person, habit, and calendar day. This is the database
// guard in addition to the upsert used by the API.
habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });


// Idempotency receipts prevent duplicate creates when mobile connectivity drops
// after the server commits a mutation but before the client receives its response.
const mutationReceiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  key: { type: String, required: true },
  requestHash: { type: String, required: true },
  statusCode: { type: Number, default: 202 },
  responseBody: { type: mongoose.Schema.Types.Mixed, default: null },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 14 },
}, { collection: 'mutation_receipts' });
mutationReceiptSchema.index({ userId: 1, key: 1 }, { unique: true });
const MutationReceipt = mongoose.models.MutationReceipt || mongoose.model('MutationReceipt', mutationReceiptSchema);


// Focus sessions support for Pomodoro / study statistics.
const focusSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  plannedMinutes: { type: Number, required: true, min: 1, max: 240 },
  completed: { type: Boolean, default: false },
  label: { type: String, default: 'Focus session', maxlength: 120 },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'focusSessions' });
focusSessionSchema.index({ userId: 1, startedAt: -1 });
const FocusSession = mongoose.models.FocusSession || mongoose.model('FocusSession', focusSessionSchema);

// ==========================================
// EXPORT ALL MODELS
// ==========================================
module.exports = {
  User,
  Event,
  Task,
  Mood,
  Habit,
  HabitLog,
  Goal,
  GoalAchievement,
  Reminder,
  Note,
  Asset,
  Transaction,
  AssistantActionReceipt,
  MutationReceipt,
  FocusSession
};
