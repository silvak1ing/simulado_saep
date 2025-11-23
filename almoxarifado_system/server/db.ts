import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, movements, InsertProduct, InsertMovement } from "../drizzle/schema";
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

/**
 * Obter usuário por ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Obter todos os produtos
 */
export async function getAllProducts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get products: database not available");
    return [];
  }

  try {
    return await db.select().from(products).orderBy(products.name);
  } catch (error) {
    console.error("[Database] Failed to get products:", error);
    throw error;
  }
}

/**
 * Buscar produtos por termo
 */
export async function searchProducts(term: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search products: database not available");
    return [];
  }

  try {
    const { like } = await import("drizzle-orm");
    return await db
      .select()
      .from(products)
      .where(like(products.name, `%${term}%`))
      .orderBy(products.name);
  } catch (error) {
    console.error("[Database] Failed to search products:", error);
    throw error;
  }
}

/**
 * Criar novo produto
 */
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(products).values(product);
    // Drizzle returns the result with insertId in different formats
    // For MySQL, it's usually in result.insertId or result[0]
    let insertedId: number | undefined;
    
    if (typeof result === 'object' && result !== null) {
      insertedId = (result as any).insertId || (result as any)[0]?.id;
    }

    if (!insertedId) {
      // If we can't get the ID, fetch the most recently created product
      const recent = await db
        .select()
        .from(products)
        .orderBy(products.createdAt)
        .limit(1);
      return recent[0];
    }

    return await db
      .select()
      .from(products)
      .where(eq(products.id, insertedId))
      .limit(1)
      .then((rows) => rows[0]);
  } catch (error) {
    console.error("[Database] Failed to create product:", error);
    throw error;
  }
}

/**
 * Atualizar produto
 */
export async function updateProduct(
  id: number,
  product: Partial<InsertProduct>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(products).set(product).where(eq(products.id, id));
    return await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .then((rows) => rows[0]);
  } catch (error) {
    console.error("[Database] Failed to update product:", error);
    throw error;
  }
}

/**
 * Deletar produto
 */
export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(products).where(eq(products.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete product:", error);
    throw error;
  }
}

/**
 * Registrar movimentação de estoque
 */
export async function createMovement(movement: InsertMovement) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(movements).values(movement);
    const insertedId = (result as any).insertId;

    // Atualizar quantidade do produto
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, movement.productId))
      .limit(1)
      .then((rows) => rows[0]);

    if (product) {
      const newQuantity =
        movement.type === "entrada"
          ? product.quantity + movement.quantity
          : product.quantity - movement.quantity;

      await db
        .update(products)
        .set({ quantity: newQuantity })
        .where(eq(products.id, movement.productId));
    }

    return await db
      .select()
      .from(movements)
      .where(eq(movements.id, insertedId))
      .limit(1)
      .then((rows) => rows[0]);
  } catch (error) {
    console.error("[Database] Failed to create movement:", error);
    throw error;
  }
}

/**
 * Obter histórico de movimentações de um produto
 */
export async function getProductMovements(productId: number) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get movements: database not available"
    );
    return [];
  }

  try {
    return await db
      .select()
      .from(movements)
      .where(eq(movements.productId, productId))
      .orderBy(movements.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get movements:", error);
    throw error;
  }
}

/**
 * Obter produtos com estoque abaixo do mínimo
 */
export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get low stock products: database not available"
    );
    return [];
  }

  try {
    const { lt } = await import("drizzle-orm");
    return await db
      .select()
      .from(products)
      .where(lt(products.quantity, products.minStock))
      .orderBy(products.name);
  } catch (error) {
    console.error(
      "[Database] Failed to get low stock products:",
      error
    );
    throw error;
  }
}
