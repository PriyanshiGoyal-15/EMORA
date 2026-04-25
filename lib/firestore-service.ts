import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  getDoc,
  getCountFromServer,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Interfaces
export interface JournalEntry {
  id?: string;
  _id?: string; // For backward compatibility
  title: string;
  content: string;
  mood: string;
  intensity: number;
  tags: string[];
  status: 'published' | 'draft';
  createdAt: any;
  updatedAt: any;
  userId: string;
}

export interface MoodLog {
  id?: string;
  mood: string;
  label: string;
  note?: string;
  timestamp: any;
  userId: string;
}

// Journal Services
export const journalService = {
  async getEntries(userId: string) {
    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      _id: doc.id, // Compatibility
      ...doc.data()
    })) as JournalEntry[];
  },

  async addEntry(userId: string, entry: Partial<JournalEntry>) {
    const docRef = await addDoc(collection(db, 'journalEntries'), {
      ...entry,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateEntry(entryId: string, updates: Partial<JournalEntry>) {
    const docRef = doc(db, 'journalEntries', entryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteEntry(entryId: string) {
    await deleteDoc(doc(db, 'journalEntries', entryId));
  }
};

// Mood Services
const MOOD_INTENSITY: Record<string, number> = {
  'low': 40,
  'sad': 55,
  'okay': 72,
  'good': 85,
  'great': 100
};

export const moodService = {
  async addMood(userId: string, moodData: { mood: string, label: string, note?: string }) {
    const docRef = await addDoc(collection(db, 'moods'), {
      ...moodData,
      userId,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  },

  async getMoodData(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'moods'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    const moods = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toDate()
    }));

    // Replicate aggregation logic from API
    const breakdownMap: Record<string, { count: number, label: string }> = {};
    moods.forEach(m => {
      if (!breakdownMap[m.mood]) {
        breakdownMap[m.mood] = { count: 0, label: m.label };
      }
      breakdownMap[m.mood].count++;
    });

    const breakdown = Object.entries(breakdownMap).map(([mood, data]) => ({
      _id: mood,
      count: data.count,
      label: data.label
    }));

    const daysData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dayMoods = moods.filter(m =>
        m.timestamp >= startOfDay && m.timestamp <= endOfDay
      );

      if (dayMoods.length === 0) {
        daysData.push({
          day: dayName,
          height: '0%',
          active: false,
          segments: []
        });
        continue;
      }

      const moodCounts: Record<string, number> = {};
      let maxIntensity = 0;
      dayMoods.forEach(m => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
        maxIntensity = Math.max(maxIntensity, MOOD_INTENSITY[m.mood]);
      });

      const segments = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        percentage: (count / dayMoods.length) * 100
      })).sort((a, b) => MOOD_INTENSITY[b.mood] - MOOD_INTENSITY[a.mood]);

      daysData.push({
        day: dayName,
        height: `${maxIntensity}%`,
        active: date.toDateString() === new Date().toDateString(),
        segments
      });
    }

    // Get recent logs, total count, latest mood, and calendar data — all in parallel
    const logsQ = query(
      collection(db, 'moods'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(3)
    );
    const countQ = query(collection(db, 'moods'), where('userId', '==', userId));
    const latestQ = query(
      collection(db, 'moods'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const calQ = query(
      collection(db, 'moods'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startOfMonth))
    );

    const [logsSnapshot, totalLogsCount, latestSnapshot, calSnapshot] = await Promise.all([
      getDocs(logsQ),
      getCountFromServer(countQ).then(r => r.data().count),
      getDocs(latestQ),
      getDocs(calQ),
    ]);

    const recentLogs = logsSnapshot.docs.map(doc => {
      const data = doc.data();
      const ts = (data.timestamp as Timestamp)?.toDate() || new Date();
      return {
        text: data.note || `Feeling ${data.label}`,
        mood: data.label,
        timestamp: ts,
        type: data.mood
      };
    });

    const latestEntry = latestSnapshot.empty ? null : latestSnapshot.docs[0].data();

    const calendar: Record<number, string[]> = {};
    calSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const day = (data.timestamp as Timestamp).toDate().getDate();
      if (!calendar[day]) calendar[day] = [];
      calendar[day].push(data.mood);
    });

    return {
      currentMood: latestEntry?.mood || null,
      totalLogs: totalLogsCount,
      breakdown,
      history: daysData,
      logs: recentLogs,
      calendar
    };
  },

  subscribeMoodData(userId: string, callback: (data: any) => void) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'moods'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, async (snapshot) => {
      // Re-fetch all data when a change occurs to ensure consistency with the one-time fetch
      // but Firestore will trigger this as soon as the local write happens
      const moods = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          mood: data.mood,
          label: data.label,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
        } as any;
      });

      // Breakdown calculation
      const breakdownMap: Record<string, { count: number, label: string }> = {};
      moods.forEach(m => {
        if (!breakdownMap[m.mood]) {
          breakdownMap[m.mood] = { count: 0, label: m.label };
        }
        breakdownMap[m.mood].count++;
      });

      const breakdown = Object.entries(breakdownMap).map(([mood, data]) => ({
        _id: mood,
        count: data.count,
        label: data.label
      }));

      // Weekly History calculation
      const daysData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const dayMoods = moods.filter(m =>
          m.timestamp >= startOfDay && m.timestamp <= endOfDay
        );

        if (dayMoods.length === 0) {
          daysData.push({
            day: dayName,
            height: '0%',
            active: false,
            segments: []
          });
          continue;
        }

        const moodCounts: Record<string, number> = {};
        let maxIntensity = 0;
        dayMoods.forEach(m => {
          moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
          maxIntensity = Math.max(maxIntensity, MOOD_INTENSITY[m.mood]);
        });

        const segments = Object.entries(moodCounts).map(([mood, count]) => ({
          mood,
          percentage: (count / dayMoods.length) * 100
        })).sort((a, b) => MOOD_INTENSITY[b.mood] - MOOD_INTENSITY[a.mood]);

        daysData.push({
          day: dayName,
          height: `${maxIntensity}%`,
          active: date.toDateString() === new Date().toDateString(),
          segments
        });
      }

      // We also need the other bits (logs, total count, latest mood, calendar)
      // For simplicity in the subscriber, we'll re-fetch those since they are simple lookups
      // or we could query them too. 
      const logsQ = query(
        collection(db, 'moods'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(3)
      );
      const countQ = query(collection(db, 'moods'), where('userId', '==', userId));
      const latestQ = query(
        collection(db, 'moods'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const calQ = query(
        collection(db, 'moods'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startOfMonth))
      );

      const [logsSnapshot, totalLogsCount, latestSnapshot, calSnapshot] = await Promise.all([
        getDocs(logsQ),
        getCountFromServer(countQ).then(r => r.data().count),
        getDocs(latestQ),
        getDocs(calQ),
      ]);

      const recentLogs = logsSnapshot.docs.map(doc => {
        const data = doc.data();
        const ts = (data.timestamp as Timestamp)?.toDate() || new Date();
        return {
          text: data.note || `Feeling ${data.label}`,
          mood: data.label,
          timestamp: ts,
          type: data.mood
        };
      });

      const latestEntry = latestSnapshot.empty ? null : latestSnapshot.docs[0].data();

      const calendar: Record<number, string[]> = {};
      calSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const day = (data.timestamp as Timestamp).toDate().getDate();
        if (!calendar[day]) calendar[day] = [];
        calendar[day].push(data.mood);
      });

      callback({
        currentMood: latestEntry?.mood || null,
        totalLogs: totalLogsCount,
        breakdown,
        history: daysData,
        logs: recentLogs,
        calendar
      });
    });
  },

  subscribeGlobalStats(userId: string, callback: (data: any) => void) {
    // We'll listen to moods specifically since that's what changes most often
    const moodsQ = query(collection(db, 'moods'), where('userId', '==', userId));

    return onSnapshot(moodsQ, async () => {
      // Re-fetch all stats when moods change
      const data = await this.getGlobalStats(userId);
      callback(data);
    });
  },

  async getGlobalStats(userId: string) {
    // 1. Journal entries count
    const journalQ = query(collection(db, 'journalEntries'), where('userId', '==', userId));
    const journalCount = (await getCountFromServer(journalQ)).data().count;

    // 2. AI Chats count (total messages)
    const conversationsQ = query(collection(db, 'conversations'), where('userId', '==', userId));
    const conversationsSnapshot = await getDocs(conversationsQ);
    const chatCount = conversationsSnapshot.docs.reduce((acc, doc) => acc + (doc.data().messages?.length || 0), 0);

    // 3. Mood Stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moodsQ = query(
      collection(db, 'moods'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const moodsSnapshot = await getDocs(moodsQ);
    const moods = moodsSnapshot.docs.map(doc => doc.data());

    // Calculate Calm Days %
    const calmMoods = ['okay', 'good', 'great'];
    const calmDaysCount = moods.filter(m => calmMoods.includes(m.mood)).length;
    const calmPercentage = moods.length > 0 ? Math.round((calmDaysCount / moods.length) * 100) : 0;

    // Calculate Avg Mood Emoji
    const moodCounts: Record<string, number> = {};
    moods.forEach(m => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });

    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const dominantMood = sortedMoods.length > 0 ? sortedMoods[0][0] : 'okay';

    const emojiMap: Record<string, string> = {
      'low': '😞', 'sad': '😢', 'okay': '😐', 'good': '😊', 'great': '😁'
    };

    const labelMap: Record<string, string> = {
      'low': 'feeling low', 'sad': 'a bit down', 'okay': 'feeling okay', 'good': 'doing well', 'great': 'feeling great'
    };

    return {
      journalCount,
      chatCount,
      calmPercentage,
      avgMood: emojiMap[dominantMood] || '😐',
      avgMoodLabel: labelMap[dominantMood] || 'okay'
    };
  },

  async getMoodStats(userId: string) {
    try {
      const moodsSnapshot = await getDocs(query(
        collection(db, 'moods'),
        where('userId', '==', userId)
      ));

      const moods = moodsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
        };
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (moods.length === 0) {
        return { streak: 0, averageLabel: 'Neutral', totalEntries: 0 };
      }

      // Calculate streak
      const dates = Array.from(new Set(moods.map(m => m.timestamp.toDateString())))
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Start from the most recent date
      const mostRecent = dates[0];
      mostRecent.setHours(0, 0, 0, 0);

      // If the most recent log is older than yesterday, streak is broken
      if (mostRecent < yesterday) {
        streak = 0;
      } else {
        let currentCheck = mostRecent;
        for (const date of dates) {
          date.setHours(0, 0, 0, 0);
          const diff = Math.abs(currentCheck.getTime() - date.getTime());
          const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

          if (daysDiff <= 1) {
            streak++;
            currentCheck = date;
          } else {
            break;
          }
        }
      }

      // Average Mood
      const moodCounts: Record<string, number> = {};
      moods.forEach(m => {
        if (m.mood) moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
      });
      const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
      const dominantMood = sortedMoods.length > 0 ? sortedMoods[0][0] : 'okay';

      const labelMap: Record<string, string> = {
        'low': 'Low', 'sad': 'Sad', 'okay': 'Okay', 'good': 'Good', 'great': 'Great'
      };

      return {
        streak,
        averageLabel: labelMap[dominantMood] || 'Okay',
        totalEntries: moods.length
      };
    } catch (error) {
      console.error("Error in getMoodStats:", error);
      return { streak: 0, averageLabel: 'Neutral', totalEntries: 0 };
    }
  }
};

// User Settings Service
export const userService = {
  async getSettings(userId: string) {
    const docRef = doc(db, 'users', userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  },

  async updateSettings(userId: string, data: any) {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, data, { merge: true });
  },

  async deleteAccountData(userId: string) {
    // Delete all user data from collections
    // Note: Batch deletion would be better here
    const collections = ['journalEntries', 'moods', 'conversations'];
    for (const collName of collections) {
      const q = query(collection(db, collName), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, collName, d.id));
      }
    }
    // Delete user profile
    await deleteDoc(doc(db, 'users', userId));
  }
};

// Conversation/Chat History Service
export const chatService = {
  async getConversations(userId: string) {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const messages: any[] = data.messages || [];

      // Derive a title from the first user message (truncated)
      const firstUserMsg = messages.find((m: any) => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '…' : '')
        : 'New conversation';

      // Preview = last message content
      const lastMsg = messages[messages.length - 1];
      const preview = lastMsg ? lastMsg.content.slice(0, 60) : 'No messages yet';

      // Convert Firestore Timestamp → ISO string so new Date() works in the sidebar
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString();

      return {
        id: docSnap.id,
        title,
        preview,
        date: updatedAt,
        messages,
      };
    });
  },
  async deleteConversation(convoId: string) {
    await deleteDoc(doc(db, 'conversations', convoId));
  }
};
