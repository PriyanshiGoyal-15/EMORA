import mongoose from 'mongoose';
// Mocking the connection since I can't easily import from the app's lib without setup
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/emora";

async function debug() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        const entries = await db.collection('journalentries').find({}).toArray();
        console.log('TOTAL ENTRIES:', entries.length);
        if (entries.length > 0) {
            console.log('SAMPLE ENTRY:', JSON.stringify(entries[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
