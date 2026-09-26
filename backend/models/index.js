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
        default: 'dark',
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

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'assets',
  }
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

const Reminder = mongoose.model('Reminder', reminderSchema);

const Note = mongoose.model('Note', noteSchema);

const Transaction = mongoose.model('Transaction', transactionSchema);

const Asset = mongoose.model('Asset', assetSchema);


// ==========================================
// INDEXES
// ==========================================

eventSchema.index({
  userId: 1,
  date: 1,
});

taskSchema.index({
  userId: 1,
  date: 1,
});

moodSchema.index({
  userId: 1,
  date: 1,
});

habitLogSchema.index({
  userId: 1,
  date: 1,
});


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
  Reminder,
  Note,
  Asset,
  Transaction
};