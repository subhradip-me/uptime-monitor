import mongoose from 'mongoose';

const targetSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  monitorType: {
    type: String,
    enum: ['http', 'https', 'tcp', 'udp', 'keyword'],
    default: 'http'
  },
  port: {
    type: Number,
    required: false,
    min: 1,
    max: 65535
  },
  keyword: {
    settings: {
      text: {
        type: String,
        trim: true
      },
      shouldExist: {
        type: Boolean,
        default: true // true = keyword should exist, false = keyword should NOT exist
      }
    }
  },
  interval: {
    type: Number,
    required: true,
    default: 60000, // 60 seconds in milliseconds
    min: 30000      // Minimum 30 seconds
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  lastStatus: {
    type: String,
    enum: ['UP', 'DOWN', 'UNKNOWN', 'ERROR'],
    default: 'UNKNOWN'
  },
  lastChecked: {
    type: Date,
    default: null
  },
  responseTime: {
    type: Number,
    default: null // in milliseconds
  },
  uptimePercentage: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  totalChecks: {
    type: Number,
    default: 0
  },
  successfulChecks: {
    type: Number,
    default: 0
  },
  // False positive prevention fields
  consecutiveFailures: {
    type: Number,
    default: 0
  },
  consecutiveSuccesses: {
    type: Number,
    default: 0
  },
  failureThreshold: {
    type: Number,
    default: 2, // Alert after 2 consecutive failures
    min: 1
  },
  recoveryThreshold: {
    type: Number,
    default: 2, // Mark as recovered after 2 consecutive successes
    min: 1
  },
  // Alert settings
  alertSettings: {
    email: {
      enabled: { type: Boolean, default: false },
      addresses: [{ type: String, trim: true }]
    },
    sms: {
      enabled: { type: Boolean, default: false },
      phoneNumbers: [{ type: String, trim: true }]
    },
    slack: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String, trim: true }
    },
    discord: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String, trim: true }
    },
    teams: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String, trim: true }
    },
    telegram: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, trim: true },
      chatId: { type: String, trim: true }
    },
    webhook: {
      enabled: { type: Boolean, default: false },
      url: { type: String, trim: true },
      headers: { type: Map, of: String }
    }
  },
  // SSL Certificate Monitoring
  sslCheck: {
    enabled: { type: Boolean, default: true }, // Auto-enabled for https URLs
    alertDays: [{ type: Number, default: [30, 14, 7] }], // Alert at 30, 14, 7 days before expiry
    lastAlertDay: { type: Number, default: null } // Track which alert was last sent
  },
  certificateInfo: {
    valid: { type: Boolean, default: null },
    issuer: { type: String, default: null },
    validFrom: { type: Date, default: null },
    validTo: { type: Date, default: null },
    daysUntilExpiry: { type: Number, default: null },
    lastChecked: { type: Date, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
targetSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Method to update uptime percentage
targetSchema.methods.updateUptimePercentage = function() {
  if (this.totalChecks === 0) {
    this.uptimePercentage = 100;
  } else {
    this.uptimePercentage = Math.round((this.successfulChecks / this.totalChecks) * 100);
  }
};

const Target = mongoose.model('Target', targetSchema);

export default Target;