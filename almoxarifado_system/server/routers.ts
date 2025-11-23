import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductMovements,
  createMovement,
  getLowStockProducts,
} from "./db";

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

  products: router({
    list: publicProcedure.query(async () => {
      return await getAllProducts();
    }),
    search: publicProcedure
      .input(z.object({ term: z.string() }))
      .query(async ({ input }) => {
        return await searchProducts(input.term);
      }),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Nome é obrigatório"),
          description: z.string().optional(),
          minStock: z.number().int().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return await createProduct({
          name: input.name,
          description: input.description,
          quantity: 0,
          minStock: input.minStock,
        });
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          minStock: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateProduct(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        return await deleteProduct(input.id);
      }),
    movements: publicProcedure
      .input(z.object({ productId: z.number().int() }))
      .query(async ({ input }) => {
        return await getProductMovements(input.productId);
      }),
  }),
  stock: router({
    recordMovement: publicProcedure
      .input(
        z.object({
          productId: z.number().int(),
          type: z.enum(["entrada", "saída"]),
          quantity: z.number().int().min(1, "Quantidade deve ser maior que 0"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Não autenticado");
        return await createMovement({
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          userId: ctx.user.id,
        });
      }),
    lowStockProducts: publicProcedure.query(async () => {
      return await getLowStockProducts();
    }),
  }),
});

export type AppRouter = typeof appRouter;
