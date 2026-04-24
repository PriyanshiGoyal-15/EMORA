import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    mood: {
        type: String,
        enum: ['Low', 'Sad', 'Okay', 'Good', 'Great'],
        required: true,
    },
    intensity: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
    },
    tags: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published',
    },
    metadata: {
        weather: String,
        location: String,
        visibility: {
            type: String,
            enum: ['Private', 'Public'],
            default: 'Private',
        },
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    collection: 'journalentries'
});

// Index for efficient querying by user and date
JournalEntrySchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
