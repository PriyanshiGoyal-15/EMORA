import mongoose from 'mongoose';

const MoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: String,
    enum: ['low', 'sad', 'okay', 'good', 'great'],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient querying by user and date
MoodSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.Mood || mongoose.model('Mood', MoodSchema);
