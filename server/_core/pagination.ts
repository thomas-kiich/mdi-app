/**
 * PAGINATION UTILITY
 *
 * Standardisierte Pagination für große Datenmengen
 * Verhindert Memory-Probleme bei 5.000+ Nutzern
 */

import { z } from "zod";

/**
 * Pagination Input Schema
 */
export const paginationInputSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationInputSchema>;

/**
 * Pagination Output
 */
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Berechne Offset für SQL LIMIT/OFFSET
 */
export function calculateOffset(page: number, pageSize: number): number {
  return page * pageSize;
}

/**
 * Erstelle Pagination-Response
 */
export function createPaginationResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages - 1,
    hasPrevPage: page > 0,
  };
}

/**
 * Cursor-basierte Pagination (für sehr große Datenmengen)
 * Effizienter als Offset-basierte Pagination bei großen Offsets
 */
export interface CursorPaginationInput {
  cursor?: string; // Base64-encoded ID des letzten Items
  limit: number;
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor?: string; // Cursor für nächste Seite
  hasMore: boolean;
}

/**
 * Encode Cursor (Base64)
 */
export function encodeCursor(id: number | string): string {
  return Buffer.from(String(id)).toString("base64");
}

/**
 * Decode Cursor (Base64)
 */
export function decodeCursor(cursor: string): string {
  try {
    return Buffer.from(cursor, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/**
 * Erstelle Cursor-Pagination-Response
 */
export function createCursorPaginationResult<T extends { id: number | string }>(
  items: T[],
  limit: number
): CursorPaginationResult<T> {
  const hasMore = items.length > limit;
  const result = items.slice(0, limit);
  const nextCursor = hasMore && result.length > 0 ? encodeCursor(result[result.length - 1].id) : undefined;

  return {
    items: result,
    nextCursor,
    hasMore,
  };
}
