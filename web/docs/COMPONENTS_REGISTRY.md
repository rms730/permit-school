# Components Registry

This document provides a comprehensive overview of all Design System components in the Permit School application.

## Design Primitives (`src/components/ui/`)

### Section
A semantic wrapper for page sections with consistent spacing and max-width constraints.

```tsx
import { Section } from '@/components/ui/Section';

<Section maxWidth="lg" spacing="lg" sx={{ backgroundColor: 'grey.50' }}>
  {/* Section content */}
</Section>
```

**Props:**
- `maxWidth`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' - Controls container max-width
- `spacing`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' - Controls vertical padding
- `sx`: Custom styles object

### PageHeader
A standardized page header component with title, subtitle, and optional actions.

```tsx
import { PageHeader } from '@/components/ui/PageHeader';

<PageHeader
  title="Page Title"
  subtitle="Page description"
  actions={<Button>Action</Button>}
/>
```

**Props:**
- `title`: string - Main page title
- `subtitle?`: string - Optional subtitle
- `actions?`: ReactNode - Optional action buttons
- `sx?`: Custom styles

### Heading
Semantic heading component that ensures proper heading hierarchy and accessibility.

```tsx
import { Heading } from '@/components/ui/Heading';

<Heading level={1}>Main Title</Heading>
<Heading level={2}>Section Title</Heading>
```

**Props:**
- `level`: 1 | 2 | 3 | 4 | 5 | 6 - Heading level
- `component?`: ReactElementType - Override semantic element
- `sx?`: Custom styles

### CardX
Enhanced card component with consistent styling and variants.

```tsx
import { CardX } from '@/components/ui/CardX';

<CardX variant="elevated" sx={{ p: 3 }}>
  Card content
</CardX>
```

**Props:**
- `variant`: 'elevated' | 'outlined' - Card appearance
- `sx?`: Custom styles

### SkeletonX
Loading skeleton component with customizable variants.

```tsx
import { SkeletonX } from '@/components/ui/SkeletonX';

<SkeletonX variant="text" width="100%" />
<SkeletonX variant="circular" width={40} height={40} />
```

**Props:**
- `variant`: 'text' | 'circular' | 'rectangular' - Skeleton shape
- `width?`: number | string - Width
- `height?`: number | string - Height
- `sx?`: Custom styles

### EmptyState
Component for displaying empty states with optional actions.

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  title="No Data Found"
  description="There are no items to display"
  icon="📭"
  action={{
    label: 'Add Item',
    onClick: handleAdd,
  }}
/>
```

**Props:**
- `title`: string - Empty state title
- `description`: string - Empty state description
- `icon?`: string - Optional icon
- `action?`: { label: string; onClick: () => void } - Optional action
- `size?`: 'small' | 'medium' | 'large' - Component size
- `sx?`: Custom styles

### ErrorState
Component for displaying error states with retry functionality.

```tsx
import { ErrorState } from '@/components/ui/ErrorState';

<ErrorState
  title="Something went wrong"
  description="Failed to load data"
  onRetry={handleRetry}
/>
```

**Props:**
- `title`: string - Error title
- `description`: string - Error description
- `onRetry?`: () => void - Retry function
- `sx?`: Custom styles

### StatusChip
Consistent status indicator component with predefined colors.

```tsx
import { StatusChip } from '@/components/ui/StatusChip';

<StatusChip status="success" label="Active" />
<StatusChip status="error" label="Failed" />
<StatusChip status="warning" label="Pending" />
<StatusChip status="info" label="Processing" />
```

**Props:**
- `status`: 'success' | 'error' | 'warning' | 'info' | 'default' - Status type
- `label`: string - Status label
- `size?`: 'small' | 'medium' - Chip size
- `variant?`: 'filled' | 'outlined' - Chip variant
- `sx?`: Custom styles

### ResponsiveImage
Responsive image component with lazy loading and error handling.

```tsx
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
/>
```

**Props:**
- `src`: string - Image source
- `alt`: string - Alt text
- `width`: number - Image width
- `height`: number - Image height
- `sx?`: Custom styles

## Global UI Providers (`src/app/providers/`)

### SnackbarProvider
Global snackbar notifications provider using notistack.

```tsx
import { useSnack } from '@/app/providers/SnackbarProvider';

const { success, error, info, warning } = useSnack();

success('Operation completed successfully');
error('Something went wrong');
```

**Available methods:**
- `success(message: string)` - Success notification
- `error(message: string)` - Error notification
- `info(message: string)` - Info notification
- `warning(message: string)` - Warning notification

### DialogProvider
Global confirmation dialog provider.

```tsx
import { useDialog } from '@/app/providers/DialogProvider';

const { confirm } = useDialog();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    destructive: true,
  });
  
  if (confirmed) {
    // Proceed with deletion
  }
};
```

**Confirm options:**
- `title`: string - Dialog title
- `message`: string - Dialog message
- `confirmText?`: string - Confirm button text (default: 'Confirm')
- `cancelText?`: string - Cancel button text (default: 'Cancel')
- `destructive?`: boolean - Whether action is destructive

## Billing Components (`src/components/billing/`)

### CheckoutButton
Stripe checkout button component.

```tsx
import { CheckoutButton } from '@/components/billing/CheckoutButton';

<CheckoutButton
  priceId="price_123"
  variant="contained"
  size="large"
>
  Subscribe Now
</CheckoutButton>
```

**Props:**
- `priceId`: string - Stripe price ID
- `variant?`: Button variant
- `size?`: Button size
- `sx?`: Custom styles

### ManageSubscriptionButton
Stripe customer portal button.

```tsx
import { ManageSubscriptionButton } from '@/components/billing/ManageSubscriptionButton';

<ManageSubscriptionButton variant="outlined">
  Manage Subscription
</ManageSubscriptionButton>
```

### InvoiceList
Component for displaying a list of invoices.

```tsx
import { InvoiceList } from '@/components/billing/InvoiceList';

<InvoiceList />
```

### PaymentStatusChip
Payment status indicator using StatusChip.

```tsx
import { PaymentStatusChip } from '@/components/billing/PaymentStatusChip';

<PaymentStatusChip status="paid" />
<PaymentStatusChip status="pending" />
<PaymentStatusChip status="failed" />
```

### SuccessBanner & CancelBanner
Banner components for payment result pages.

```tsx
import { SuccessBanner, CancelBanner } from '@/components/billing';

<SuccessBanner />
<CancelBanner />
```

## Notifications Components (`src/components/notifications/`)

### NotificationsDrawer
Full-featured notifications drawer with read/unread functionality.

```tsx
import { NotificationsDrawer } from '@/components/notifications/NotificationsDrawer';

<NotificationsDrawer open={open} onClose={handleClose} />
```

### NotificationBell
Updated notification bell that opens the NotificationsDrawer.

```tsx
import { NotificationBell } from '@/components/NotificationBell';

<NotificationBell />
```

## Certificates Components (`src/components/certificates/`)

### CertificatePreview
Certificate preview component with responsive design.

```tsx
import { CertificatePreview } from '@/components/certificates/CertificatePreview';

<CertificatePreview
  certificate={certificateData}
  onDownload={handleDownload}
/>
```

### CertificateStatusChip
Certificate status indicator using StatusChip.

```tsx
import { CertificateStatusChip } from '@/components/certificates/CertificateStatusChip';

<CertificateStatusChip status="issued" />
<CertificateStatusChip status="draft" />
<CertificateStatusChip status="voided" />
```

## Guardian Components (`src/components/guardian/`)

### ChildList
Component for displaying a list of children with consent status.

```tsx
import { ChildList } from '@/components/guardian/ChildList';

<ChildList children={childrenData} onRefresh={handleRefresh} />
```

### ConsentStatusTimeline
Timeline component for displaying consent events.

```tsx
import { ConsentStatusTimeline } from '@/components/guardian/ConsentStatusTimeline';

<ConsentStatusTimeline events={consentEvents} />
```

### ResendConsentButton
Button for resending consent emails.

```tsx
import { ResendConsentButton } from '@/components/guardian/ResendConsentButton';

<ResendConsentButton
  studentId="123"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

### AddChildDialog
Dialog for adding a child to an account.

```tsx
import { AddChildDialog } from '@/components/guardian/AddChildDialog';

<AddChildDialog
  open={open}
  onClose={handleClose}
  onSuccess={handleSuccess}
/>
```

## Admin Table Components (`src/components/admin/table/`)

### DataTable
Generic data table using MUI X DataGrid with server-side operations.

```tsx
import { DataTable } from '@/components/admin/table/DataTable';

<DataTable
  columns={columns}
  rows={rows}
  loading={loading}
  pagination={{
    page: 0,
    pageSize: 10,
    rowCount: 100,
  }}
  onPaginationChange={handlePaginationChange}
  onSortChange={handleSortChange}
  onFilterChange={handleFilterChange}
/>
```

**Props:**
- `columns`: GridColDef[] - Column definitions
- `rows`: any[] - Row data
- `loading`: boolean - Loading state
- `pagination`: PaginationState - Pagination state
- `onPaginationChange`: (state: PaginationState) => void - Pagination handler
- `onSortChange`: (state: SortingState) => void - Sorting handler
- `onFilterChange`: (state: FilterState) => void - Filter handler

## PWA Components (`src/components/pwa/`)

### AddToHomeScreenPrompt
PWA "Add to Home Screen" prompt component.

```tsx
import { AddToHomeScreenPrompt } from '@/components/pwa/AddToHomeScreenPrompt';

<AddToHomeScreenPrompt />
```

### OfflinePage
Offline fallback page component.

```tsx
import { OfflinePage } from '@/components/pwa/OfflinePage';

<OfflinePage />
```

## Usage Guidelines

### Accessibility
- All components follow WCAG 2.1 AA guidelines
- Proper ARIA attributes and keyboard navigation
- Semantic HTML structure
- Color contrast compliance

### Internationalization
- All text content supports i18n
- Use translation keys for dynamic content
- RTL language support where applicable

### Responsive Design
- Mobile-first approach
- Consistent breakpoints
- Touch-friendly interactions (≥44px targets)

### Performance
- Lazy loading for images and heavy components
- Optimized bundle splitting
- SSR-safe implementation
- Minimal re-renders

### Error Handling
- Graceful error states
- User-friendly error messages
- Retry mechanisms where appropriate
- Fallback content

## Best Practices

1. **Consistent Spacing**: Use the spacing system defined in the theme
2. **Semantic Structure**: Use proper heading hierarchy and landmarks
3. **State Management**: Use appropriate state management patterns
4. **Testing**: Write unit tests for all components
5. **Documentation**: Keep component documentation up to date
6. **Performance**: Monitor bundle size and runtime performance
7. **Accessibility**: Regular a11y audits and testing
