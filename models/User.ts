import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  bio: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  notifications: {
    dailyReminder: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
    moodInsights: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
  },
  appearance: {
    theme: { type: String, default: 'light' },
    fontSize: { type: String, default: 'medium' },
    compactMode: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
  collection: 'users'
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
