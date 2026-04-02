import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import debounce from 'lodash/debounce';

export interface MindMap {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  ownerId: string;
  updatedAt: any;
}

export const useMindMap = (userId: string | undefined) => {
  const [maps, setMaps] = useState<MindMap[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. マップ一覧のリアルタイム取得
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'maps'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mindMaps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MindMap[];
      
      setMaps(mindMaps);
      setLoading(false);
      
      // 最初の一つを自動選択
      if (mindMaps.length > 0 && !currentMapId) {
        setCurrentMapId(mindMaps[0].id);
      }
    });

    return unsubscribe;
  }, [userId]);

  // 2. マップの新規作成
  const createMap = async (name: string = 'New Mindmap') => {
    if (!userId) return;
    
    const initialNodes: any[] = [
      {
        id: 'root',
        type: 'mindmapNode',
        data: { label: 'Central Idea' },
        position: { x: 0, y: 0 },
      }
    ];

    const docRef = await addDoc(collection(db, 'maps'), {
      name,
      nodes: initialNodes,
      edges: [],
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    setCurrentMapId(docRef.id);
    return docRef.id;
  };

  // 3. マップの更新 (Debounced)
  const saveMapData = useMemo(
    () => debounce(async (mapId: string, nodes: any[], edges: any[]) => {
      if (!mapId || nodes.length === 0) return;
      
      const mapDoc = doc(db, 'maps', mapId);
      await updateDoc(mapDoc, {
        nodes,
        edges,
        updatedAt: serverTimestamp(),
      });
      console.log('Autosaved to Cloud');
    }, 2000),
    []
  );

  const updateMapName = async (mapId: string, newName: string) => {
    const mapDoc = doc(db, 'maps', mapId);
    await updateDoc(mapDoc, { name: newName, updatedAt: serverTimestamp() });
  };

  const deleteMap = async (mapId: string) => {
    await deleteDoc(doc(db, 'maps', mapId));
    if (currentMapId === mapId) setCurrentMapId(null);
  };

  const currentMap = maps.find(m => m.id === currentMapId) || null;

  return {
    maps,
    currentMap,
    currentMapId,
    setCurrentMapId,
    createMap,
    saveMapData,
    updateMapName,
    deleteMap,
    loading
  };
};
