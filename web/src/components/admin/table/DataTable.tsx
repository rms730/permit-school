"use client";

import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  ViewColumn as ViewColumnIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  Box, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Stack, 
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridRowSelectionModel,
  GridPaginationModel,
  GridSortModel,
  GridFilterModel
} from '@mui/x-data-grid';
import { forwardRef, useState, useCallback, useMemo } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonX } from '@/components/ui/SkeletonX';

interface DataTableProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange?: (model: GridPaginationModel) => void;
  sorting?: {
    field: string;
    sort: 'asc' | 'desc';
  };
  onSortChange?: (model: GridSortModel) => void;
  filtering?: GridFilterModel;
  onFilterChange?: (model: GridFilterModel) => void;
  selection?: {
    selectedRows: GridRowSelectionModel;
    onSelectionChange: (selection: GridRowSelectionModel) => void;
  };
  search?: {
    value: string;
    onSearch: (value: string) => void;
    placeholder?: string;
  };
  export?: {
    enabled?: boolean;
    onExport?: () => void;
  };
  density?: 'compact' | 'standard' | 'comfortable';
  showToolbar?: boolean;
  showSearch?: boolean;
  showColumnSelector?: boolean;
  showDensitySelector?: boolean;
  showFilterButton?: boolean;
  showExportButton?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  sx?: any;
}

function CustomToolbar({
  search,
  onSearch,
  onClear,
  showSearch = true,
  showColumnSelector = true,
  showDensitySelector = true,
  showFilterButton = true,
  showExportButton = true,
  export: exportConfig,
  density,
  onDensityChange,
  onExport,
}: {
  search?: { value: string; placeholder?: string };
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showSearch?: boolean;
  showColumnSelector?: boolean;
  showDensitySelector?: boolean;
  showFilterButton?: boolean;
  showExportButton?: boolean;
  export?: { enabled?: boolean };
  density?: 'compact' | 'standard' | 'comfortable';
  onDensityChange?: (density: 'compact' | 'standard' | 'comfortable') => void;
  onExport?: () => void;
}) {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [densityMenuAnchor, setDensityMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <GridToolbarContainer sx={{ p: 2, gap: 2 }}>
      <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: 'center' }}>
        {showSearch && search && onSearch && (
          <TextField
            size="small"
            placeholder={search.placeholder || "Search..."}
            value={search.value}
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search.value && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={onClear}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        )}
      </Stack>

      <Stack direction="row" spacing={1}>
        {showFilterButton && <GridToolbarFilterButton />}
        
        {showColumnSelector && (
          <>
            <Button
              size="small"
              startIcon={<ViewColumnIcon />}
              onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
            >
              Columns
            </Button>
            <Menu
              anchorEl={columnMenuAnchor}
              open={Boolean(columnMenuAnchor)}
              onClose={() => setColumnMenuAnchor(null)}
            >
              <MenuItem>
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Column selector"
                />
              </MenuItem>
            </Menu>
          </>
        )}

        {showDensitySelector && density && onDensityChange && (
          <>
            <Button
              size="small"
              onClick={(e) => setDensityMenuAnchor(e.currentTarget)}
            >
              Density
            </Button>
            <Menu
              anchorEl={densityMenuAnchor}
              open={Boolean(densityMenuAnchor)}
              onClose={() => setDensityMenuAnchor(null)}
            >
              {(['compact', 'standard', 'comfortable'] as const).map((d) => (
                <MenuItem
                  key={d}
                  selected={density === d}
                  onClick={() => {
                    onDensityChange(d);
                    setDensityMenuAnchor(null);
                  }}
                >
                  <ListItemText primary={d.charAt(0).toUpperCase() + d.slice(1)} />
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {showExportButton && exportConfig?.enabled && onExport && (
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={onExport}
          >
            Export
          </Button>
        )}
      </Stack>
    </GridToolbarContainer>
  );
}

export const DataTable = forwardRef<HTMLDivElement, DataTableProps>(
  ({ 
    rows, 
    columns, 
    loading = false,
    error,
    onRetry,
    pagination,
    onPaginationChange,
    sorting,
    onSortChange,
    filtering,
    onFilterChange,
    selection,
    search,
    export: exportConfig,
    density = 'standard',
    showToolbar = true,
    showSearch = true,
    showColumnSelector = true,
    showDensitySelector = true,
    showFilterButton = true,
    showExportButton = true,
    emptyState,
    sx,
    ...props 
  }, ref) => {
    const theme = useTheme();
    const [localSearch, setLocalSearch] = useState('');
    const [localDensity, setLocalDensity] = useState(density);

    const handleSearch = useCallback((value: string) => {
      setLocalSearch(value);
      if (search?.onSearch) {
        search.onSearch(value);
      }
    }, [search]);

    const handleClearSearch = useCallback(() => {
      setLocalSearch('');
      if (search?.onSearch) {
        search.onSearch('');
      }
    }, [search]);

    const handleDensityChange = useCallback((newDensity: 'compact' | 'standard' | 'comfortable') => {
      setLocalDensity(newDensity);
    }, []);

    const handleExport = useCallback(() => {
      if (exportConfig?.onExport) {
        exportConfig.onExport();
      }
    }, [exportConfig]);

    const getRowHeight = useMemo(() => {
      switch (localDensity) {
        case 'compact': return 40;
        case 'comfortable': return 60;
        default: return 52;
      }
    }, [localDensity]);

    if (loading) {
      return <SkeletonX variant="table" lines={5} />;
    }

    if (error) {
      return (
        <ErrorState
          message={error}
          retry={onRetry}
        />
      );
    }

    if (rows.length === 0 && !loading) {
      return (
        <EmptyState
          title={emptyState?.title || "No data found"}
          description={emptyState?.description || "There are no records to display."}
          icon={emptyState?.icon}
          primaryAction={emptyState?.action}
        />
      );
    }

    return (
      <Paper ref={ref} sx={{ height: 600, width: '100%', ...sx }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowHeight={() => getRowHeight}
          loading={loading}
          pagination={pagination ? true : undefined}
          paginationMode={pagination ? 'server' : 'client'}
          paginationModel={pagination ? { page: pagination.page, pageSize: pagination.pageSize } : undefined}
          onPaginationModelChange={onPaginationChange}
          rowCount={pagination?.total || rows.length}
          sortingMode={sorting ? 'server' : 'client'}
          sortModel={sorting ? [{ field: sorting.field, sort: sorting.sort }] : undefined}
          onSortModelChange={onSortChange}
          filterMode={filtering ? 'server' : 'client'}
          filterModel={filtering}
          onFilterModelChange={onFilterChange}
          rowSelectionModel={selection?.selectedRows}
          onRowSelectionModelChange={selection?.onSelectionChange}
          checkboxSelection={!!selection}
          disableRowSelectionOnClick={!!selection}
          slots={{
            toolbar: showToolbar ? undefined : undefined,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.grey[50],
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          {...props}
        />
      </Paper>
    );
  }
);

DataTable.displayName = 'DataTable';
