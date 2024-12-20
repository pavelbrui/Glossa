import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
  password_hash: string;
  is_admin: boolean;
  created_at: string;
}

export interface Service {
  id?: String;
  title: string;
  date: string;
  time: string;
  is_live: boolean;
  created_by: string;
  created_at: string;
  languages: string[];
  attendees: number;
}

export interface ServiceAttendee {
  id?: number;
  service_id: number;
  session_id: string;
  joined_at: string;
}

class GlossaDB extends Dexie {
  users!: Table<User>;
  services!: Table<Service>;
  attendees!: Table<ServiceAttendee>;

  constructor() {
    super('glossaDB');
    this.version(1).stores({
      users: '++id, username',
      services: '++id, created_by',
      attendees: '++id, service_id, session_id'
    });
  }
}

const db = new GlossaDB();

// Initialize with default admin user
db.users.count().then(count => {
  if (count === 0) {
    db.users.add({
      username: 'admin',
      password_hash: '123',
      is_admin: true,
      created_at: new Date().toISOString()
    });
  }
});

export const initializeDb = async () => {
  return db;
};

export const getServices = async (): Promise<Service[]> => {
  const services = await db.services.toArray();
  const attendees = await db.attendees.toArray();

  return services.map(service => ({
    ...service,
    attendees: attendees.filter(a => a.service_id.toString() === service.id).length
  }));
};

export const createService = async (
  service: Omit<Service, 'id' | 'created_at' | 'attendees'>
): Promise<Service> => {
  const id = await db.services.add({
    ...service,
    created_at: new Date().toISOString(),
    attendees: 0
  });
  return (await db.services.get(id))!;
};

export const updateServiceLiveStatus = async (id: number, is_live: boolean): Promise<void> => {
  await db.services.update(id, { is_live });
};

export const trackAttendee = async (service_id: number, session_id: string): Promise<void> => {
  await db.attendees.add({
    service_id,
    session_id,
    joined_at: new Date().toISOString()
  });
};

export const removeAttendee = async (service_id: number, session_id: string): Promise<void> => {
  await db.attendees
    .where({ service_id, session_id })
    .delete();
};

export const verifyUser = async (username: string, password: string): Promise<User | null> => {
  const user = await db.users
    .where({ username })
    .first();
  
  if (!user) return null;
  
  // In production, use proper password hashing
  if (password === '123' && username === 'admin') {
    return user;
  }
  
  return null;
};