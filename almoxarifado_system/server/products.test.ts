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

describe("products router", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("products.list", () => {
    it("should return a list of products", async () => {
      const result = await caller.products.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("products.create", () => {
    it("should create a new product with valid data", async () => {
      const result = await caller.products.create({
        name: "Test Product",
        description: "A test product",
        minStock: 5,
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe("Test Product");
      expect(result?.description).toBe("A test product");
      expect(result?.minStock).toBe(5);
    });

    it("should fail with empty name", async () => {
      try {
        await caller.products.create({
          name: "",
          description: "A test product",
          minStock: 5,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("products.search", () => {
    it("should search products by name", async () => {
      // First create a product
      await caller.products.create({
        name: "Searchable Product",
        description: "Test",
        minStock: 0,
      });

      // Then search for it
      const result = await caller.products.search({
        term: "Searchable",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for non-matching search", async () => {
      const result = await caller.products.search({
        term: "NonExistentProduct12345",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("products.update", () => {
    it("should update an existing product", async () => {
      // Create a product first
      const created = await caller.products.create({
        name: "Original Name",
        description: "Original description",
        minStock: 5,
      });

      if (!created?.id) {
        throw new Error("Failed to create product");
      }

      // Update it
      const updated = await caller.products.update({
        id: created.id,
        name: "Updated Name",
        minStock: 10,
      });

      expect(updated?.name).toBe("Updated Name");
      expect(updated?.minStock).toBe(10);
      expect(updated?.id).toBe(created.id);
    });
  });

  describe("products.delete", () => {
    it("should delete a product", async () => {
      // Create a product first
      const created = await caller.products.create({
        name: "Product to Delete",
        description: "Test",
        minStock: 0,
      });

      if (!created?.id) {
        throw new Error("Failed to create product");
      }

      // Delete it
      const result = await caller.products.delete({
        id: created.id,
      });

      expect(result).toBe(true);
    });
  });
});
