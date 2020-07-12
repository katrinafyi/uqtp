import { firestore, auth } from "./firebase";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createContainer } from 'unstated-next';


import type firebase from 'firebase';
import { TimetablesState } from "./types";

type DocRef = firebase.firestore.DocumentReference;
type Firestore = firebase.firestore.Firestore;
type Collection = firebase.firestore.CollectionReference;

export const useFirestoreCollection = (path: string | null) => {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<string[] | null>(null);

  // reattach listener when docRef changes.
  useEffect(() => {
    if (!path) {
      setLoading(false);
      setKeys(null);
      return;
    };
    
    setLoading(true);

    return firestore.collection(path).onSnapshot(entries => {
      setLoading(false);
      const keys: string[] = [];
      entries.forEach(doc => keys.push(doc.id));
      setKeys(keys);
    });
  }, [path]);

  return {keys, loading, path};
};

export const useFirestoreDocument = <T>(collection: string, documentName: string | null) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);

  const path = documentName ? collection + '/' + documentName : null;
 
  // reattach listener when docRef changes.
  useEffect(() => {
    if (!path) {
      setLoading(false);
      setData(null);
      return;
    };
    
    setLoading(true);

    return firestore.doc(path).onSnapshot(doc => {
      setLoading(false);
      setData(doc.data() as T);
    });
  }, [path]);

  const setFirebaseData = useCallback((data: T | null) => {
    if (!path) return;

    const docRef = firestore.doc(path);
    if (data)
      docRef?.set(data);
    else
      docRef?.delete();
  }, [path]);

  return {data, setData: setFirebaseData, loading, path};
}

export type UserDocument = {
  selectedTimetable: string
};

export const useUserFirestore = (user?: firebase.User) => {
  const uid = (user ?? auth.currentUser)?.uid ?? null;
  return useFirestoreDocument<UserDocument>('user', uid);
};

export const UserContainer = createContainer(useUserFirestore);


export const useTimetablesFirestore = () => {
  return useFirestoreDocument<TimetablesState>('', 'timetables')
};
