import type { PostgrestError } from '@supabase/supabase-js'

// PostgREST returns at most the project's max rows (1,000) per request and
// silently drops the rest, so totals built from one request stop counting at
// 1,000. This pages through a query until a short page comes back.
//
// `page` must apply .range(from, to) to a query ordered by an append-only key
// (e.g. created_at, then a unique column), so rows added while paging land on
// later pages instead of shifting earlier ones. Rows are deduplicated by `key`
// in case one is seen twice anyway.
const PAGE_SIZE = 1000

export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
  key: (row: T) => string,
): Promise<{ data: T[] | null; error: PostgrestError | null }> {
  const rows = new Map<string, T>()
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1)
    if (error) return { data: null, error }
    for (const row of data ?? []) rows.set(key(row), row)
    if ((data ?? []).length < PAGE_SIZE) return { data: [...rows.values()], error: null }
  }
}
