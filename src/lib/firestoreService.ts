import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ChatSession, Message } from '../types';

export async function syncUserProfile(
  user: User,
  currentBalance: number
): Promise<number> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  try {
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();

    if (snap.exists()) {
      const data = snap.data();
      // Update basic fields, retain existing cloud balance or fallback
      await updateDoc(userRef, {
        displayName: user.displayName || 'চেতনার শুভাকাঙ্ক্ষী',
        email: user.email || '',
        photoURL: user.photoURL || '',
        updatedAt: now,
      });
      return typeof data.chetanaBalance === 'number' ? data.chetanaBalance : currentBalance;
    } else {
      // Create new user profile with starting balance
      await setDoc(userRef, {
        displayName: user.displayName || 'চেতনার শুভাকাঙ্ক্ষী',
        email: user.email || '',
        photoURL: user.photoURL || '',
        chetanaBalance: currentBalance,
        createdAt: now,
        updatedAt: now,
      });
      return currentBalance;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateCloudBalance(
  userId: string,
  newBalance: number
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const path = `users/${userId}`;
  try {
    await updateDoc(userRef, {
      chetanaBalance: newBalance,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchCloudSessions(userId: string): Promise<ChatSession[]> {
  const sessionsRef = collection(db, 'chatSessions');
  const path = 'chatSessions';

  try {
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const sessions: ChatSession[] = [];

    for (const docSnap of snapshot.docs) {
      const sData = docSnap.data();
      const messagesPath = `chatSessions/${docSnap.id}/messages`;
      
      const messagesRef = collection(db, 'chatSessions', docSnap.id, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      const messagesSnap = await getDocs(messagesQuery);

      const msgs: Message[] = messagesSnap.docs.map((mSnap) => {
        const m = mSnap.data();
        return {
          id: mSnap.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        };
      });

      sessions.push({
        id: docSnap.id,
        title: sData.title || 'নামহীন আলোচনা',
        updatedAt: new Date(sData.updatedAt).getTime() || Date.now(),
        messages: msgs,
      });
    }

    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveCloudSession(
  userId: string,
  session: ChatSession
): Promise<void> {
  const sessionRef = doc(db, 'chatSessions', session.id);
  const path = `chatSessions/${session.id}`;
  const now = new Date(session.updatedAt || Date.now()).toISOString();

  try {
    await setDoc(
      sessionRef,
      {
        userId,
        title: session.title.slice(0, 180),
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    // Save individual messages
    for (const msg of session.messages) {
      const msgRef = doc(db, 'chatSessions', session.id, 'messages', msg.id);
      const msgPath = `chatSessions/${session.id}/messages/${msg.id}`;
      try {
        await setDoc(
          msgRef,
          {
            userId,
            role: msg.role,
            content: msg.content.slice(0, 9500),
            timestamp: msg.timestamp || Date.now(),
            createdAt: new Date(msg.timestamp || Date.now()).toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, msgPath);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCloudSession(
  userId: string,
  sessionId: string
): Promise<void> {
  const sessionRef = doc(db, 'chatSessions', sessionId);
  const path = `chatSessions/${sessionId}`;

  try {
    await deleteDoc(sessionRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
