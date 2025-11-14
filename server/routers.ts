import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Validation schemas
const createTutorSchema = z.object({
  clinicId: z.number(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  cpf: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
});

const createPatientSchema = z.object({
  clinicId: z.number(),
  tutorId: z.number(),
  name: z.string().min(1),
  species: z.enum(["dog", "cat", "bird", "rabbit", "hamster", "other"]),
  breed: z.string().optional(),
  color: z.string().optional(),
  dateOfBirth: z.date().optional(),
  weight: z.string().optional(),
  microchipId: z.string().optional(),
  notes: z.string().optional(),
});

const createAppointmentSchema = z.object({
  clinicId: z.number(),
  patientId: z.number(),
  tutorId: z.number(),
  veterinarianId: z.number(),
  appointmentDate: z.date(),
  duration: z.number().default(30),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const createMedicalRecordSchema = z.object({
  clinicId: z.number(),
  patientId: z.number(),
  appointmentId: z.number().optional(),
  veterinarianId: z.number(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  observations: z.string().optional(),
  recordType: z.enum(["consultation", "procedure", "exam", "follow-up"]),
});

const createVaccineSchema = z.object({
  clinicId: z.number(),
  patientId: z.number(),
  vaccineName: z.string().min(1),
  vaccinationDate: z.date(),
  nextDueDate: z.date().optional(),
  veterinarianId: z.number(),
  batchNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= TUTOR PROCEDURES =============
  tutors: router({
    create: protectedProcedure
      .input(createTutorSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const tutor = await db.createTutor({
          ...input,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
        
        if (!tutor) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return tutor;
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const tutor = await db.getTutorById(input);
        if (!tutor) throw new TRPCError({ code: "NOT_FOUND" });
        return tutor;
      }),

    listByClinic: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getTutorsByClinic(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: createTutorSchema.partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const tutor = await db.updateTutor(input.id, {
          ...input.data,
          updatedBy: ctx.user.id,
        });
        
        if (!tutor) throw new TRPCError({ code: "NOT_FOUND" });
        return tutor;
      }),
  }),

  // ============= PATIENT PROCEDURES =============
  patients: router({
    create: protectedProcedure
      .input(createPatientSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const patient = await db.createPatient({
          ...input,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
        
        if (!patient) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return patient;
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const patient = await db.getPatientById(input);
        if (!patient) throw new TRPCError({ code: "NOT_FOUND" });
        return patient;
      }),

    listByTutor: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getPatientsByTutor(input);
      }),

    listByClinic: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getPatientsByClinic(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: createPatientSchema.partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const patient = await db.updatePatient(input.id, {
          ...input.data,
          updatedBy: ctx.user.id,
        });
        
        if (!patient) throw new TRPCError({ code: "NOT_FOUND" });
        return patient;
      }),
  }),

  // ============= APPOINTMENT PROCEDURES =============
  appointments: router({
    create: protectedProcedure
      .input(createAppointmentSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const appointment = await db.createAppointment({
          ...input,
          status: "scheduled",
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
        
        if (!appointment) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return appointment;
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const appointment = await db.getAppointmentById(input);
        if (!appointment) throw new TRPCError({ code: "NOT_FOUND" });
        return appointment;
      }),

    listByClinic: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return db.getAppointmentsByClinic(input.clinicId, input.startDate, input.endDate);
      }),

    listByPatient: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getAppointmentsByPatient(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
          notes: z.string().optional(),
          appointmentDate: z.date().optional(),
          duration: z.number().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const appointment = await db.updateAppointment(input.id, {
          ...input.data,
          updatedBy: ctx.user.id,
        });
        
        if (!appointment) throw new TRPCError({ code: "NOT_FOUND" });
        return appointment;
      }),
  }),

  // ============= MEDICAL RECORD PROCEDURES =============
  medicalRecords: router({
    create: protectedProcedure
      .input(createMedicalRecordSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const record = await db.createMedicalRecord({
          ...input,
          recordDate: new Date(),
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
        
        if (!record) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return record;
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const record = await db.getMedicalRecordById(input);
        if (!record) throw new TRPCError({ code: "NOT_FOUND" });
        return record;
      }),

    listByPatient: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getMedicalRecordsByPatient(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: createMedicalRecordSchema.partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const record = await db.updateMedicalRecord(input.id, {
          ...input.data,
          updatedBy: ctx.user.id,
        });
        
        if (!record) throw new TRPCError({ code: "NOT_FOUND" });
        return record;
      }),
  }),

  // ============= VACCINE PROCEDURES =============
  vaccines: router({
    create: protectedProcedure
      .input(createVaccineSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const vaccine = await db.createVaccine({
          ...input,
          isCompleted: true,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
        
        if (!vaccine) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return vaccine;
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const vaccine = await db.getVaccineById(input);
        if (!vaccine) throw new TRPCError({ code: "NOT_FOUND" });
        return vaccine;
      }),

    listByPatient: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getVaccinesByPatient(input);
      }),

    listOverdue: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getOverdueVaccines(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: createVaccineSchema.partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const vaccine = await db.updateVaccine(input.id, {
          ...input.data,
          updatedBy: ctx.user.id,
        });
        
        if (!vaccine) throw new TRPCError({ code: "NOT_FOUND" });
        return vaccine;
      }),
  }),

  // ============= ALERT PROCEDURES =============
  alerts: router({
    listByClinic: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        unresolved: z.boolean().default(true),
      }))
      .query(async ({ input }) => {
        return db.getAlertsByClinic(input.clinicId, input.unresolved);
      }),

    listByPatient: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getAlertsByPatient(input);
      }),

    markAsResolved: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const alert = await db.updateAlert(input, {
          isResolved: true,
          resolvedAt: new Date(),
        });
        
        if (!alert) throw new TRPCError({ code: "NOT_FOUND" });
        return alert;
      }),
  }),
});

export type AppRouter = typeof appRouter;
