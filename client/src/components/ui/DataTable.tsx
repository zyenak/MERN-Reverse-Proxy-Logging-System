import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChevronUp, ChevronDown, Search, Filter, Download } from 'lucide-react';
import { TableColumn, PaginatedTableProps } from '@/types';
import { debounce } from '@/utils';

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  sortable?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount?: number;
  };
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }[];
  onSearch?: (query: string) => void;
  onFilter?: (key: string, value: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number; _id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available.',
  searchable = false,
  searchPlaceholder = 'Search...',
  filterable = false,
  filters = [],
  sortable = false,
  pagination,
  actions = [],
  onSearch,
  onFilter,
  onSort,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => onSearch?.(query), 300),
    [onSearch]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleFilter = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
    onFilter?.(key, value);
  };

  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const renderCell = (item: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return (item as any)[column.accessor] || '';
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Search and Filters */}
      {(searchable || filterable || actions.length > 0) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}

            {filterable && filters.map((filter) => (
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || ''}
                onValueChange={(value) => handleFilter(filter.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  size="sm"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  <div className="flex items-center gap-2">
                    {sortable && column.sortable !== false ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.header)}
                        className="h-auto p-0 font-medium"
                      >
                        {column.header}
                        {getSortIcon(column.header)}
                      </Button>
                    ) : (
                      <span className="font-medium">{column.header}</span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <LoadingSpinner text="Loading data..." />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow key={item.id || item._id || rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {pagination.totalCount && (
              <span>
                Showing {((pagination.page - 1) * 10) + 1} to{' '}
                {Math.min(pagination.page * 10, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 