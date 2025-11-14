// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
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
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var tutors = mysqlTable("tutors", {
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
  updatedBy: int("updatedBy").notNull()
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id]
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id]
  })
]);
var patients = mysqlTable("patients", {
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
  updatedBy: int("updatedBy").notNull()
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id]
  }),
  foreignKey({
    columns: [table.tutorId],
    foreignColumns: [tutors.id]
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id]
  })
]);
var appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  tutorId: int("tutorId").notNull(),
  veterinarianId: int("veterinarianId").notNull(),
  appointmentDate: timestamp("appointmentDate").notNull(),
  duration: int("duration").default(30).notNull(),
  // in minutes
  reason: text("reason"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedBy: int("updatedBy").notNull()
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id]
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id]
  }),
  foreignKey({
    columns: [table.tutorId],
    foreignColumns: [tutors.id]
  }),
  foreignKey({
    columns: [table.veterinarianId],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id]
  })
]);
var medicalRecords = mysqlTable("medicalRecords", {
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
  updatedBy: int("updatedBy").notNull()
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id]
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id]
  }),
  foreignKey({
    columns: [table.appointmentId],
    foreignColumns: [appointments.id]
  }),
  foreignKey({
    columns: [table.veterinarianId],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id]
  })
]);
var vaccines = mysqlTable("vaccines", {
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
  updatedBy: int("updatedBy").notNull()
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id]
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id]
  }),
  foreignKey({
    columns: [table.veterinarianId],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id]
  }),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.id]
  })
]);
var alerts = mysqlTable("alerts", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id]
  }),
  foreignKey({
    columns: [table.patientId],
    foreignColumns: [patients.id]
  }),
  foreignKey({
    columns: [table.tutorId],
    foreignColumns: [tutors.id]
  })
]);
var auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId").notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  // e.g., "patient", "appointment", "medicalRecord"
  entityId: int("entityId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  oldValues: text("oldValues"),
  // JSON string
  newValues: text("newValues"),
  // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (table) => [
  foreignKey({
    columns: [table.clinicId],
    foreignColumns: [clinics.id]
  }),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id]
  })
]);

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createTutor(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(tutors).values(data);
  const id = result[0].insertId;
  return getTutorById(id);
}
async function getTutorById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tutors).where(eq(tutors.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getTutorsByClinic(clinicId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutors).where(eq(tutors.clinicId, clinicId));
}
async function updateTutor(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(tutors).set(data).where(eq(tutors.id, id));
  return getTutorById(id);
}
async function createPatient(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(patients).values(data);
  const id = result[0].insertId;
  return getPatientById(id);
}
async function getPatientById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getPatientsByTutor(tutorId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patients).where(eq(patients.tutorId, tutorId));
}
async function getPatientsByClinic(clinicId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patients).where(eq(patients.clinicId, clinicId));
}
async function updatePatient(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(patients).set(data).where(eq(patients.id, id));
  return getPatientById(id);
}
async function createAppointment(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(appointments).values(data);
  const id = result[0].insertId;
  return getAppointmentById(id);
}
async function getAppointmentById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getAppointmentsByClinic(clinicId, startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  if (startDate && endDate) {
    return db.select().from(appointments).where(and(
      eq(appointments.clinicId, clinicId),
      gte(appointments.appointmentDate, startDate),
      lte(appointments.appointmentDate, endDate)
    )).orderBy(asc(appointments.appointmentDate));
  }
  return db.select().from(appointments).where(eq(appointments.clinicId, clinicId)).orderBy(asc(appointments.appointmentDate));
}
async function getAppointmentsByPatient(patientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.patientId, patientId)).orderBy(desc(appointments.appointmentDate));
}
async function updateAppointment(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(appointments).set(data).where(eq(appointments.id, id));
  return getAppointmentById(id);
}
async function createMedicalRecord(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(medicalRecords).values(data);
  const id = result[0].insertId;
  return getMedicalRecordById(id);
}
async function getMedicalRecordById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getMedicalRecordsByPatient(patientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(medicalRecords).where(eq(medicalRecords.patientId, patientId)).orderBy(desc(medicalRecords.recordDate));
}
async function updateMedicalRecord(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(medicalRecords).set(data).where(eq(medicalRecords.id, id));
  return getMedicalRecordById(id);
}
async function createVaccine(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(vaccines).values(data);
  const id = result[0].insertId;
  return getVaccineById(id);
}
async function getVaccineById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(vaccines).where(eq(vaccines.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getVaccinesByPatient(patientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vaccines).where(eq(vaccines.patientId, patientId)).orderBy(desc(vaccines.vaccinationDate));
}
async function getOverdueVaccines(clinicId) {
  const db = await getDb();
  if (!db) return [];
  const today = /* @__PURE__ */ new Date();
  return db.select().from(vaccines).where(and(
    eq(vaccines.clinicId, clinicId),
    lte(vaccines.nextDueDate, today),
    eq(vaccines.isCompleted, false)
  )).orderBy(asc(vaccines.nextDueDate));
}
async function updateVaccine(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(vaccines).set(data).where(eq(vaccines.id, id));
  return getVaccineById(id);
}
async function getAlertById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getAlertsByClinic(clinicId, unresolved = true) {
  const db = await getDb();
  if (!db) return [];
  if (unresolved) {
    return db.select().from(alerts).where(and(
      eq(alerts.clinicId, clinicId),
      eq(alerts.isResolved, false)
    )).orderBy(asc(alerts.dueDate));
  }
  return db.select().from(alerts).where(eq(alerts.clinicId, clinicId)).orderBy(asc(alerts.dueDate));
}
async function getAlertsByPatient(patientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).where(eq(alerts.patientId, patientId)).orderBy(asc(alerts.dueDate));
}
async function updateAlert(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(alerts).set(data).where(eq(alerts.id, id));
  return getAlertById(id);
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
var createTutorSchema = z2.object({
  clinicId: z2.number(),
  name: z2.string().min(1),
  email: z2.string().email().optional(),
  phone: z2.string().min(1),
  cpf: z2.string().optional(),
  address: z2.string().optional(),
  city: z2.string().optional(),
  state: z2.string().optional(),
  zipCode: z2.string().optional(),
  notes: z2.string().optional()
});
var createPatientSchema = z2.object({
  clinicId: z2.number(),
  tutorId: z2.number(),
  name: z2.string().min(1),
  species: z2.enum(["dog", "cat", "bird", "rabbit", "hamster", "other"]),
  breed: z2.string().optional(),
  color: z2.string().optional(),
  dateOfBirth: z2.date().optional(),
  weight: z2.string().optional(),
  microchipId: z2.string().optional(),
  notes: z2.string().optional()
});
var createAppointmentSchema = z2.object({
  clinicId: z2.number(),
  patientId: z2.number(),
  tutorId: z2.number(),
  veterinarianId: z2.number(),
  appointmentDate: z2.date(),
  duration: z2.number().default(30),
  reason: z2.string().optional(),
  notes: z2.string().optional()
});
var createMedicalRecordSchema = z2.object({
  clinicId: z2.number(),
  patientId: z2.number(),
  appointmentId: z2.number().optional(),
  veterinarianId: z2.number(),
  diagnosis: z2.string().optional(),
  treatment: z2.string().optional(),
  prescription: z2.string().optional(),
  observations: z2.string().optional(),
  recordType: z2.enum(["consultation", "procedure", "exam", "follow-up"])
});
var createVaccineSchema = z2.object({
  clinicId: z2.number(),
  patientId: z2.number(),
  vaccineName: z2.string().min(1),
  vaccinationDate: z2.date(),
  nextDueDate: z2.date().optional(),
  veterinarianId: z2.number(),
  batchNumber: z2.string().optional(),
  notes: z2.string().optional()
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // ============= TUTOR PROCEDURES =============
  tutors: router({
    create: protectedProcedure.input(createTutorSchema).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const tutor = await createTutor({
        ...input,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id
      });
      if (!tutor) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return tutor;
    }),
    getById: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      const tutor = await getTutorById(input);
      if (!tutor) throw new TRPCError3({ code: "NOT_FOUND" });
      return tutor;
    }),
    listByClinic: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getTutorsByClinic(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      data: createTutorSchema.partial()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const tutor = await updateTutor(input.id, {
        ...input.data,
        updatedBy: ctx.user.id
      });
      if (!tutor) throw new TRPCError3({ code: "NOT_FOUND" });
      return tutor;
    })
  }),
  // ============= PATIENT PROCEDURES =============
  patients: router({
    create: protectedProcedure.input(createPatientSchema).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const patient = await createPatient({
        ...input,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id
      });
      if (!patient) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return patient;
    }),
    getById: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      const patient = await getPatientById(input);
      if (!patient) throw new TRPCError3({ code: "NOT_FOUND" });
      return patient;
    }),
    listByTutor: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getPatientsByTutor(input);
    }),
    listByClinic: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getPatientsByClinic(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      data: createPatientSchema.partial()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const patient = await updatePatient(input.id, {
        ...input.data,
        updatedBy: ctx.user.id
      });
      if (!patient) throw new TRPCError3({ code: "NOT_FOUND" });
      return patient;
    })
  }),
  // ============= APPOINTMENT PROCEDURES =============
  appointments: router({
    create: protectedProcedure.input(createAppointmentSchema).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const appointment = await createAppointment({
        ...input,
        status: "scheduled",
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id
      });
      if (!appointment) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return appointment;
    }),
    getById: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      const appointment = await getAppointmentById(input);
      if (!appointment) throw new TRPCError3({ code: "NOT_FOUND" });
      return appointment;
    }),
    listByClinic: protectedProcedure.input(z2.object({
      clinicId: z2.number(),
      startDate: z2.date().optional(),
      endDate: z2.date().optional()
    })).query(async ({ input }) => {
      return getAppointmentsByClinic(input.clinicId, input.startDate, input.endDate);
    }),
    listByPatient: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getAppointmentsByPatient(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      data: z2.object({
        status: z2.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        notes: z2.string().optional(),
        appointmentDate: z2.date().optional(),
        duration: z2.number().optional()
      })
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const appointment = await updateAppointment(input.id, {
        ...input.data,
        updatedBy: ctx.user.id
      });
      if (!appointment) throw new TRPCError3({ code: "NOT_FOUND" });
      return appointment;
    })
  }),
  // ============= MEDICAL RECORD PROCEDURES =============
  medicalRecords: router({
    create: protectedProcedure.input(createMedicalRecordSchema).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const record = await createMedicalRecord({
        ...input,
        recordDate: /* @__PURE__ */ new Date(),
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id
      });
      if (!record) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return record;
    }),
    getById: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      const record = await getMedicalRecordById(input);
      if (!record) throw new TRPCError3({ code: "NOT_FOUND" });
      return record;
    }),
    listByPatient: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getMedicalRecordsByPatient(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      data: createMedicalRecordSchema.partial()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const record = await updateMedicalRecord(input.id, {
        ...input.data,
        updatedBy: ctx.user.id
      });
      if (!record) throw new TRPCError3({ code: "NOT_FOUND" });
      return record;
    })
  }),
  // ============= VACCINE PROCEDURES =============
  vaccines: router({
    create: protectedProcedure.input(createVaccineSchema).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const vaccine = await createVaccine({
        ...input,
        isCompleted: true,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id
      });
      if (!vaccine) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return vaccine;
    }),
    getById: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      const vaccine = await getVaccineById(input);
      if (!vaccine) throw new TRPCError3({ code: "NOT_FOUND" });
      return vaccine;
    }),
    listByPatient: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getVaccinesByPatient(input);
    }),
    listOverdue: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getOverdueVaccines(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      data: createVaccineSchema.partial()
    })).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const vaccine = await updateVaccine(input.id, {
        ...input.data,
        updatedBy: ctx.user.id
      });
      if (!vaccine) throw new TRPCError3({ code: "NOT_FOUND" });
      return vaccine;
    })
  }),
  // ============= ALERT PROCEDURES =============
  alerts: router({
    listByClinic: protectedProcedure.input(z2.object({
      clinicId: z2.number(),
      unresolved: z2.boolean().default(true)
    })).query(async ({ input }) => {
      return getAlertsByClinic(input.clinicId, input.unresolved);
    }),
    listByPatient: protectedProcedure.input(z2.number()).query(async ({ input }) => {
      return getAlertsByPatient(input);
    }),
    markAsResolved: protectedProcedure.input(z2.number()).mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const alert = await updateAlert(input, {
        isResolved: true,
        resolvedAt: /* @__PURE__ */ new Date()
      });
      if (!alert) throw new TRPCError3({ code: "NOT_FOUND" });
      return alert;
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
