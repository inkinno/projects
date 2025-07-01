'use server';

import { revalidatePath } from 'next/cache';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { format } from 'date-fns'; // Import the 'format' function
import { db } from '@/lib/firebase';
import type { Service, TimelineEvent } from '@/lib/types';
import { highlightRelevantEvents } from '@/ai/flows/highlight-relevant-events';

const servicesCollection = collection(db, 'services');
const eventsCollection = collection(db, 'events');

export async function getServices(): Promise<Service[]> {
  try {
    const q = query(servicesCollection, orderBy('order'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Service)
    );
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
}

export async function addService() {
  try {
    const services = await getServices();
    const newOrder = services.length > 0 ? Math.max(...services.map(s => s.order)) + 1 : 0;
    
    const newServiceData = {
      name: 'New Service',
      emoji: '🚀',
      order: newOrder,
    };

    const docRef = await addDoc(servicesCollection, newServiceData);
    
    revalidatePath('/');
    
    return { success: true, newService: { id: docRef.id, ...newServiceData } };
  } catch (error) {
    console.error('Error adding service:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateService(
  id: string,
  data: { name: string; emoji: string }
) {
  try {
    const serviceDoc = doc(db, 'services', id);
    await updateDoc(serviceDoc, data);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating service:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteService(id: string) {
  try {
    const serviceDoc = doc(db, 'services', id);
    await deleteDoc(serviceDoc);
    const q = query(eventsCollection, where('serviceId', '==', id));
    const eventSnapshot = await getDocs(q);
    const deletePromises = eventSnapshot.docs.map(eventDoc => deleteDoc(eventDoc.ref));
    await Promise.all(deletePromises);
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getEvents(
  startDate?: Date,
  endDate?: Date
): Promise<TimelineEvent[]> {
  try {
    let q = query(eventsCollection);
    if (startDate && endDate) {
      const startString = format(startDate, 'yyyy-MM-dd');
      const endString = format(endDate, 'yyyy-MM-dd');
      q = query(eventsCollection, where('date', '>=', startString), where('date', '<=', endString), orderBy('date', 'asc'));
    } else {
      q = query(eventsCollection, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as TimelineEvent)
    );
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

export async function addEvent(data: {
 serviceId: string;
 date: string; 
 title: string;
 content: string;
}) {
  try {
    if (!data.title.trim()) throw new Error("Event title cannot be empty.");
    
    const aiResult = await highlightRelevantEvents({ eventData: data.content });

    const newEvent = {
      ...data,
      ...aiResult,
      createdAt: serverTimestamp(),
    };

    await addDoc(eventsCollection, newEvent);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding event:', error);
    return { success: false, error: (error as Error).message };
  }
}
