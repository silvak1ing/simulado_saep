import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  clinics,
  tutors,
  patients,
  appointments,
  medicalRecords,
  vaccines,
  alerts,
  auditLogs,
  Tutor,
  Patient,
  Appointment,
  MedicalRecord,
  Vaccine,
  Alert,
  InsertTutor,
  InsertPatient,
  InsertAppointment,
  InsertMedicalRecord,
  InsertVaccine,
  InsertAlert,
  InsertAuditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= TUTOR QUERIES =============

export async function createTutor(data: InsertTutor): Promise<Tutor | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(tutors).values(data);
  const id = result[0].insertId as number;
  return getTutorById(id);
}

export async function getTutorById(id: number): Promise<Tutor | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tutors).where(eq(tutors.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTutorsByClinic(clinicId: number): Promise<Tutor[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tutors).where(eq(tutors.clinicId, clinicId));
}

export async function updateTutor(id: number, data: Partial<InsertTutor>): Promise<Tutor | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(tutors).set(data).where(eq(tutors.id, id));
  return getTutorById(id);
}

// ============= PATIENT QUERIES =============

export async function createPatient(data: InsertPatient): Promise<Patient | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(patients).values(data);
  const id = result[0].insertId as number;
  return getPatientById(id);
}

export async function getPatientById(id: number): Promise<Patient | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPatientsByTutor(tutorId: number): Promise<Patient[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(patients).where(eq(patients.tutorId, tutorId));
}

export async function getPatientsByClinic(clinicId: number): Promise<Patient[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(patients).where(eq(patients.clinicId, clinicId));
}

export async function updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(patients).set(data).where(eq(patients.id, id));
  return getPatientById(id);
}

// ============= APPOINTMENT QUERIES =============

export async function createAppointment(data: InsertAppointment): Promise<Appointment | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(appointments).values(data);
  const id = result[0].insertId as number;
  return getAppointmentById(id);
}

export async function getAppointmentById(id: number): Promise<Appointment | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAppointmentsByClinic(clinicId: number, startDate?: Date, endDate?: Date): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (startDate && endDate) {
    return db.select().from(appointments)
      .where(and(
        eq(appointments.clinicId, clinicId),
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate)
      ))
      .orderBy(asc(appointments.appointmentDate));
  }
  
  return db.select().from(appointments)
    .where(eq(appointments.clinicId, clinicId))
    .orderBy(asc(appointments.appointmentDate));
}

export async function getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(appointments).where(eq(appointments.patientId, patientId)).orderBy(desc(appointments.appointmentDate));
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(appointments).set(data).where(eq(appointments.id, id));
  return getAppointmentById(id);
}

// ============= MEDICAL RECORD QUERIES =============

export async function createMedicalRecord(data: InsertMedicalRecord): Promise<MedicalRecord | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(medicalRecords).values(data);
  const id = result[0].insertId as number;
  return getMedicalRecordById(id);
}

export async function getMedicalRecordById(id: number): Promise<MedicalRecord | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(medicalRecords).where(eq(medicalRecords.patientId, patientId)).orderBy(desc(medicalRecords.recordDate));
}

export async function updateMedicalRecord(id: number, data: Partial<InsertMedicalRecord>): Promise<MedicalRecord | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(medicalRecords).set(data).where(eq(medicalRecords.id, id));
  return getMedicalRecordById(id);
}

// ============= VACCINE QUERIES =============

export async function createVaccine(data: InsertVaccine): Promise<Vaccine | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(vaccines).values(data);
  const id = result[0].insertId as number;
  return getVaccineById(id);
}

export async function getVaccineById(id: number): Promise<Vaccine | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(vaccines).where(eq(vaccines.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getVaccinesByPatient(patientId: number): Promise<Vaccine[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(vaccines).where(eq(vaccines.patientId, patientId)).orderBy(desc(vaccines.vaccinationDate));
}

export async function getOverdueVaccines(clinicId: number): Promise<Vaccine[]> {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  return db.select().from(vaccines)
    .where(and(
      eq(vaccines.clinicId, clinicId),
      lte(vaccines.nextDueDate, today),
      eq(vaccines.isCompleted, false)
    ))
    .orderBy(asc(vaccines.nextDueDate));
}

export async function updateVaccine(id: number, data: Partial<InsertVaccine>): Promise<Vaccine | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(vaccines).set(data).where(eq(vaccines.id, id));
  return getVaccineById(id);
}

// ============= ALERT QUERIES =============

export async function createAlert(data: InsertAlert): Promise<Alert | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(alerts).values(data);
  const id = result[0].insertId as number;
  return getAlertById(id);
}

export async function getAlertById(id: number): Promise<Alert | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAlertsByClinic(clinicId: number, unresolved: boolean = true): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (unresolved) {
    return db.select().from(alerts)
      .where(and(
        eq(alerts.clinicId, clinicId),
        eq(alerts.isResolved, false)
      ))
      .orderBy(asc(alerts.dueDate));
  }
  
  return db.select().from(alerts)
    .where(eq(alerts.clinicId, clinicId))
    .orderBy(asc(alerts.dueDate));
}

export async function getAlertsByPatient(patientId: number): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(alerts).where(eq(alerts.patientId, patientId)).orderBy(asc(alerts.dueDate));
}

export async function updateAlert(id: number, data: Partial<InsertAlert>): Promise<Alert | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(alerts).set(data).where(eq(alerts.id, id));
  return getAlertById(id);
}

// ============= AUDIT LOG QUERIES =============

export async function createAuditLog(data: InsertAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogsByEntity(clinicId: number, entityType: string, entityId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(auditLogs)
    .where(and(
      eq(auditLogs.clinicId, clinicId),
      eq(auditLogs.entityType, entityType),
      eq(auditLogs.entityId, entityId)
    ))
    .orderBy(desc(auditLogs.createdAt));
}
