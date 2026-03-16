# Frontend Cursor Pagination Library

A comprehensive, type-safe pagination library for Next.js applications that works seamlessly with the backend cursor pagination API.

## Features

- ✨ **Type-Safe**: Full TypeScript support with generic types
- 🔄 **Cursor Navigation**: Forward and backward pagination with HMAC-signed cursors
- 🔍 **Filtering**: Add, remove, and manage filters with type safety
- 📊 **Sorting**: Toggle, add, and remove sorts with automatic URL sync
- 🔗 **URL Synchronization**: Automatic query parameter management with Next.js router
- ⚡ **Debounced Search**: Built-in debouncing for search inputs
- 🎯 **Simple DX**: Clean API designed for developer experience

## Installation

The library is located at `frontend/src/lib/pagination` and is already integrated into the project.

## Quick Start

### Basic Usage

```tsx
'use client';

import { usePagination } from '@/lib/pagination';
import type { CursorPaginationResponse } from '@/lib/pagination';

export default function MyComponent({
  response,
}: {
  response: CursorPaginationResponse<MyDto>;
}) {
  const pagination = usePagination<'name' | 'createdAt'>({
    basePath: '/my-route',
    defaultLimit: 20,
    defaultSorts: [{ key: 'createdAt', dir: 'desc' }],
    includeTotal: true,
  });

  return (
    <div>
      <button onClick={() => pagination.goToNext(response)}>Next Page</button>
      <button onClick={() => pagination.toggleSort('name')}>
        Sort by Name
      </button>
    </div>
  );
}
```

### Server Component (Fetching Data)

```tsx
import { backendClient } from '@/lib/backend/client';
import { extractFromSearchParams } from '@/lib/pagination';
import type { CursorPaginationResponse } from '@/lib/pagination';

export default async function Page({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams);

  // Convert to URLSearchParams
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value !== undefined) {
      urlSearchParams.set(key, Array.isArray(value) ? value.join(',') : value);
    }
  }

  // Extract pagination params
  const params = extractFromSearchParams(urlSearchParams);

  // Build query for backend
  const queryParams: Record<string, unknown> = {
    cursor: params.cursor,
    cursorDir: params.cursorDir,
    limit: params.limit || 20,
    sort: params.sort,
    includeTotal: params.includeTotal,
  };

  // Add filters
  for (const [key, value] of Object.entries(params)) {
    if (
      !['cursor', 'cursorDir', 'limit', 'sort', 'includeTotal'].includes(key)
    ) {
      queryParams[key] = value;
    }
  }

  // Fetch from backend
  const { data, error } = await backendClient.GET('/my-endpoint', {
    params: { query: queryParams },
  });

  const response = data as unknown as CursorPaginationResponse<MyDto>;

  return <MyClient response={response} />;
}
```

## API Reference

### `usePagination<K>(config)`

Main hook for managing pagination state.

**Config Options:**

- `basePath: string` - Base URL path (e.g., '/repositories')
- `defaultLimit?: number` - Default page size (default: 20)
- `defaultSorts?: SortValue<K>[]` - Initial sort configuration
- `includeTotal?: boolean` - Include total count in requests
- `includeRemaining?: boolean` - Include remaining count in requests

**Returns:**

- `state: PaginationState<K>` - Current pagination state
- `goToNext(response)` - Navigate to next page
- `goToPrev(response)` - Navigate to previous page
- `goToFirst()` - Go to first page (clear cursor)
- `addSort(field, dir)` - Add or update a sort
- `removeSort(field)` - Remove a sort
- `toggleSort(field)` - Toggle sort direction (asc -> desc -> none)
- `addFilter(field, op, value, type?)` - Add or update a filter
- `removeFilter(field, op, type?)` - Remove a specific filter
- `removeFieldFilters(field)` - Remove all filters for a field
- `clearFilters()` - Clear all filters
- `reset()` - Reset to default state
- `setLimit(limit)` - Set page size
- `isPending: boolean` - Whether navigation is in progress

### Filter Operations

Available filter operations:

- `eq` - Equal to
- `neq` - Not equal to
- `gt` - Greater than
- `gte` - Greater than or equal to
- `lt` - Less than
- `lte` - Less than or equal to
- `contains` - String contains
- `startsWith` - String starts with
- `endsWith` - String ends with
- `in` - Value in array
- `notIn` - Value not in array
- `isNull` - Is NULL
- `isNotNull` - Is NOT NULL
- `like` - SQL LIKE (case-sensitive)
- `ilike` - SQL ILIKE (case-insensitive)

### Utility Functions

#### Cursor Utils

- `getNextCursor(response)` - Get next page cursor
- `getPrevCursor(response)` - Get previous page cursor
- `hasNextPage(response)` - Check if next page exists
- `hasPrevPage(response)` - Check if previous page exists
- `getTotalCount(response)` - Get total item count
- `getRemainingCount(response)` - Get remaining item count

#### Sort Utils

- `addSort(sorts, field, dir)` - Add sort to array
- `removeSort(sorts, field)` - Remove sort from array
- `toggleSort(sorts, field)` - Toggle sort direction
- `getSortDir(sorts, field)` - Get current sort direction
- `isSorted(sorts, field)` - Check if field is sorted
- `sortsToString(sorts)` - Convert to backend format
- `parseSortString(string)` - Parse from backend format

#### Filter Utils

- `addFilter(filters, field, op, value, type)` - Add filter
- `removeFilter(filters, field, op, type)` - Remove filter
- `removeFieldFilters(filters, field)` - Remove all filters for field
- `getFilter(filters, field, op, type)` - Get filter value
- `hasFilter(filters, field, op, type)` - Check if filter exists
- `filtersToQueryParams(filters)` - Convert to query params

#### Query Builder

- `buildQueryParams(state)` - Build query params from state
- `buildUrl(basePath, state)` - Build full URL with query string
- `queryParamsToSearchParams(params)` - Convert to URLSearchParams
- `extractFromSearchParams(searchParams)` - Parse from URL

## Example: Sortable Table

```tsx
'use client';

import { usePagination } from '@/lib/pagination';

export default function MyTable({ response }) {
  const pagination = usePagination({
    basePath: '/my-route',
    defaultLimit: 20,
  });

  const getSortIcon = (field) => {
    const sort = pagination.state.sorts.find((s) => s.key === field);
    if (!sort) return null;
    return sort.dir === 'asc' ? '↑' : '↓';
  };

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => pagination.toggleSort('name')}>
            Name {getSortIcon('name')}
          </th>
          <th onClick={() => pagination.toggleSort('createdAt')}>
            Created {getSortIcon('createdAt')}
          </th>
        </tr>
      </thead>
      <tbody>
        {response.data.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Example: Debounced Search

```tsx
'use client';

import { usePagination } from '@/lib/pagination';
import { useEffect, useState } from 'react';

export default function SearchableTable({ response }) {
  const pagination = usePagination({ basePath: '/my-route' });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim()) {
        pagination.addFilter('name', 'contains', searchInput.trim());
      } else {
        pagination.removeFieldFilters('name');
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <input
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Example: Navigation Controls

```tsx
<div>
  <button
    disabled={!response.meta.hasPrev}
    onClick={() => pagination.goToPrev(response)}
  >
    Previous
  </button>

  <button
    disabled={!response.meta.hasNext}
    onClick={() => pagination.goToNext(response)}
  >
    Next
  </button>

  <button onClick={() => pagination.goToFirst()}>First Page</button>

  {response.meta.total && (
    <span>
      Showing {response.meta.count} of {response.meta.total}
    </span>
  )}
</div>
```

## Type Safety

The library is fully typed with TypeScript generics:

```typescript
// Define your sortable/filterable fields
type MyFields = 'name' | 'email' | 'createdAt';

// Use with pagination
const pagination = usePagination<MyFields>({
  basePath: '/users',
});

// Now field parameters are type-checked!
pagination.toggleSort('name'); // ✅ OK
pagination.toggleSort('invalid'); // ❌ Type error!
```

## Integration with HeroUI

The library works seamlessly with HeroUI components:

```tsx
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';

<Table>
  <TableHeader>
    <TableColumn>
      <button onClick={() => pagination.toggleSort('name')}>
        Name {getSortIcon('name')}
      </button>
    </TableColumn>
  </TableHeader>
  <TableBody items={response.data}>
    {(item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>;
```

## See Also

- [Backend Pagination Library](../../../backend/src/lib/pagination/README.md)
- [Sample Implementation](../../app/sample-pagination/)
- [Repository Route Example](../../app/repositories/)
