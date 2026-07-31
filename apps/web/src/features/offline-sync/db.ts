import Dexie, { type EntityTable } from 'dexie';

export type DraftObservation = {
  id?: number;
  clientUuid: string;
  type: 'MESS' | 'NON_MESS';
  payload: Record<string, unknown>;
  createdAt: string;
};

export type SyncQueueItem = {
  id?: number;
  clientUuid: string;
  type: 'MESS' | 'NON_MESS';
  payload: Record<string, unknown>;
  retryCount: number;
  lastError?: string;
  createdAt: string;
};

export type StoredPhoto = {
  id?: number;
  blob: Blob;
  observationClientUuid: string;
  createdAt: string;
};

class ObservasiDb extends Dexie {
  drafts!: EntityTable<DraftObservation, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  photos!: EntityTable<StoredPhoto, 'id'>;

  constructor() {
    super('observasi');
    this.version(1).stores({
      drafts: '++id, clientUuid, type, createdAt',
      syncQueue: '++id, clientUuid, type, retryCount, createdAt',
      photos: '++id, observationClientUuid, createdAt',
    });
  }
}

export const db = new ObservasiDb();
