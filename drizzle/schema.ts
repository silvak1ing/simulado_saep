import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  boolean,
  decimal,
  date,
  foreignKey
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for veterinary clinic.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "veterinarian", "receptionist"]).default("user").notNull(),
  clinicId: int("clinicId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clinics table - stores information about each veterinary clinic unit
 */
export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;

/**
 * Tutors table - stores information about pet owners
 */
export const tutors = mysqlTable("tutors", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).unique(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedBy: int("updatedBy").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id],
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
  }),
]);

export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = typeof tutors.$inferInsert;

/**
 * Patients table - stores information about animals (pets)
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  tutorId: int("tutorId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  species: mysqlEnum("species", ["dog", "cat", "bird", "rabbit", "hamster", "other"]).notNull(),
  breed: varchar("breed", { length: 100 }),
  color: varchar("color", { length: 100 }),
  dateOfBirth: date("dateOfBirth"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  microchipId: varchar("microchipId", { length: 50 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedBy: int("updatedBy").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id],
  }),
  foreignKey({
    columns: [table.tutorId],
    foreignColumns: [tutors.id],
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
  }),
]);

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Appointments table - stores appointment information
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  tutorId: int("tutorId").notNull(),
  veterinarianId: int("veterinarianId").notNull(),
  appointmentDate: timestamp("appointmentDate").notNull(),
  duration: int("duration").default(30).notNull(), // in minutes
  reason: text("reason"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedBy: int("updatedBy").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id],
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id],
  }),
  foreignKey({
    columns: [table.tutorId],
    foreignColumns: [tutors.id],
  }),
  foreignKey({
    columns: [table.veterinarianId],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
  }),
]);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Medical Records table - stores consultation and treatment information
 */
export const medicalRecords = mysqlTable("medicalRecords", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  appointmentId: int("appointmentId"),
  veterinarianId: int("veterinarianId").notNull(),
  recordDate: timestamp("recordDate").defaultNow().notNull(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  prescription: text("prescription"),
  observations: text("observations"),
  recordType: mysqlEnum("recordType", ["consultation", "procedure", "exam", "follow-up"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedBy: int("updatedBy").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id],
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id],
  }),
  foreignKey({
    columns: [table.appointmentId],
    foreignColumns: [appointments.id],
  }),
  foreignKey({
    columns: [table.veterinarianId],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
  }),
]);

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;

/**
 * Vaccines table - stores vaccine information and schedules
 */
export const vaccines = mysqlTable("vaccines", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  vaccineName: varchar("vaccineName", { length: 255 }).notNull(),
  vaccinationDate: date("vaccinationDate").notNull(),
  nextDueDate: date("nextDueDate"),
  veterinarianId: int("veterinarianId").notNull(),
  batchNumber: varchar("batchNumber", { length: 100 }),
  notes: text("notes"),
  isCompleted: boolean("isCompleted").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedBy: int("updatedBy").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id],
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id],
  }),
  foreignKey({
    columns: [table.veterinarianId],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id],
  }),
]);

export type Vaccine = typeof vaccines.$inferSelect;
export type InsertVaccine = typeof vaccines.$inferInsert;

/**
 * Alerts table - stores vaccine and return appointment alerts
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  tutorId: int("tutorId").notNull(),
  alertType: mysqlEnum("alertType", ["vaccine", "return", "appointment"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("dueDate").notNull(),
  isResolved: boolean("isResolved").default(false).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  notificationSent: boolean("notificationSent").default(false).notNull(),
  notificationSentAt: timestamp("notificationSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id],
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id],
  }),
  foreignKey({
    columns: [table.tutorId],
    foreignColumns: [tutors.id],
  }),
]);

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Audit Log table - tracks all changes to critical records
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId").notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "patient", "appointment", "medicalRecord"
  entityId: int("entityId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  oldValues: text("oldValues"), // JSON string
  newValues: text("newValues"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id],
  }),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
