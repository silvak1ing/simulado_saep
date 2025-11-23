import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("stock router", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("stock.recordMovement", () => {
    it("should record an entrada (entry) movement", async () => {
      // Create a product first
      const product = await caller.products.create({
        name: "Test Product for Movement",
        description: "Test",
        minStock: 5,
      });

      if (!product?.id) {
        throw new Error("Failed to create product");
      }

      // Record an entrada
      const movement = await caller.stock.recordMovement({
        productId: product.id,
        type: "entrada",
        quantity: 10,
      });

      expect(movement).toBeDefined();
      expect(movement?.type).toBe("entrada");
      expect(movement?.quantity).toBe(10);
      expect(movement?.productId).toBe(product.id);
      expect(movement?.userId).toBe(ctx.user?.id);
    });

    it("should record a saida (exit) movement", async () => {
      // Create a product with initial stock
      const product = await caller.products.create({
        name: "Test Product for Exit",
        description: "Test",
        minStock: 5,
      });

      if (!product?.id) {
        throw new Error("Failed to create product");
      }

      // First add stock
      await caller.stock.recordMovement({
        productId: product.id,
        type: "entrada",
        quantity: 20,
      });

      // Then remove stock
      const movement = await caller.stock.recordMovement({
        productId: product.id,
        type: "saída",
        quantity: 5,
      });

      expect(movement).toBeDefined();
      expect(movement?.type).toBe("saída");
      expect(movement?.quantity).toBe(5);
      expect(movement?.productId).toBe(product.id);
    });

    it("should validate quantity is positive", async () => {
      const product = await caller.products.create({
        name: "Test Product Qty",
        description: "Test",
        minStock: 0,
      });

      if (!product?.id) {
        throw new Error("Failed to create product");
      }

      try {
        await caller.stock.recordMovement({
          productId: product.id,
          type: "entrada",
          quantity: 0,
        });
        expect.fail("Should have thrown an error for zero quantity");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("stock.lowStockProducts", () => {
    it("should return products list", async () => {
      // Get low stock products
      const lowStockProducts = await caller.stock.lowStockProducts();

      expect(Array.isArray(lowStockProducts)).toBe(true);
    });

    it("should identify low stock products", async () => {
      // Create a product with low stock
      const product = await caller.products.create({
        name: "Low Stock Product Test",
        description: "Test",
        minStock: 10,
      });

      if (!product?.id) {
        throw new Error("Failed to create product");
      }

      // Add only 5 units (below minimum of 10)
      await caller.stock.recordMovement({
        productId: product.id,
        type: "entrada",
        quantity: 5,
      });

      // Get low stock products
      const lowStockProducts = await caller.stock.lowStockProducts();

      expect(Array.isArray(lowStockProducts)).toBe(true);
      expect(lowStockProducts.length).toBeGreaterThan(0);
    });
  });

  describe("products.movements", () => {
    it("should retrieve movement history for a product", async () => {
      // Create a product
      const product = await caller.products.create({
        name: "Product with History",
        description: "Test",
        minStock: 0,
      });

      if (!product?.id) {
        throw new Error("Failed to create product");
      }

      // Record multiple movements
      await caller.stock.recordMovement({
        productId: product.id,
        type: "entrada",
        quantity: 10,
      });

      await caller.stock.recordMovement({
        productId: product.id,
        type: "saída",
        quantity: 3,
      });

      // Get movement history
      const movements = await caller.products.movements({
        productId: product.id,
      });

      expect(Array.isArray(movements)).toBe(true);
      expect(movements.length).toBeGreaterThanOrEqual(2);
      
      // Verify that we have entrada and saida movements
      const hasEntrada = movements.some((m: any) => m.type === "entrada");
      const hasSaida = movements.some((m: any) => m.type === "saída");
      expect(hasEntrada).toBe(true);
      expect(hasSaida).toBe(true);
    });
  });
});
