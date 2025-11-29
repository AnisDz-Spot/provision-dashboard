# Component Usage Guide

This guide provides detailed information on how to use the components in the Provision Dashboard template.

## UI Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button";

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Input

Form input field with consistent styling.

```tsx
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

### Card

Container component for grouping content.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
</Card>
```

### Badge

Status and label badges with variants.

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="secondary">Secondary</Badge>
```

### Avatar

User avatar with initials fallback.

```tsx
import { Avatar } from "@/components/ui/avatar";

<Avatar name="John Doe" size="sm" />
<Avatar name="Jane Smith" size="md" />
<Avatar name="Bob Johnson" src="/avatar.jpg" size="lg" />
```

## Chart Components

### Bar Chart

```tsx
import { BarChartComponent } from "@/components/charts";

const data = [
  { name: "Jan", value: 100 },
  { name: "Feb", value: 200 },
];

<BarChartComponent
  data={data}
  dataKey="value"
  xKey="name"
  color="hsl(var(--primary))"
/>
```

### Line Chart

```tsx
import { LineChartComponent } from "@/components/charts";

<LineChartComponent
  data={data}
  dataKey="value"
  xKey="name"
/>
```

### Pie Chart

```tsx
import { PieChartComponent } from "@/components/charts";

const data = [
  { name: "Category A", value: 30 },
  { name: "Category B", value: 70 },
];

<PieChartComponent data={data} />
```

### Doughnut Chart

```tsx
import { DoughnutChartComponent } from "@/components/charts";

<DoughnutChartComponent data={data} />
```

### Area Chart

```tsx
import { AreaChartComponent } from "@/components/charts";

<AreaChartComponent
  data={data}
  dataKey="value"
  xKey="name"
/>
```

### Radar Chart

```tsx
import { RadarChartComponent } from "@/components/charts";

<RadarChartComponent
  data={data}
  dataKey="value"
  angleKey="category"
/>
```

### Scatter Chart

```tsx
import { ScatterChartComponent } from "@/components/charts";

const data = [
  { x: 10, y: 20 },
  { x: 15, y: 25 },
];

<ScatterChartComponent data={data} />
```

### Treemap Chart

```tsx
import { TreemapChartComponent } from "@/components/charts";

<TreemapChartComponent data={data} />
```

## Form Components

### Project Form

Form for creating or editing projects with validation.

```tsx
import { ProjectForm } from "@/components/forms/project-form";

<ProjectForm
  onSubmit={(data) => {
    console.log("Project data:", data);
    // Handle submission
  }}
  initialData={existingProject} // Optional, for editing
  onCancel={() => {
    // Handle cancel
  }}
/>
```

## Table Components

### Data Table

Responsive data table with pagination and search.

```tsx
import { DataTable } from "@/components/tables/data-table";

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  {
    key: "status",
    header: "Status",
    render: (value) => <Badge>{value}</Badge>,
  },
];

<DataTable
  data={users}
  columns={columns}
  searchable={true}
  pagination={true}
  pageSize={10}
/>
```

## Modal Components

### Modal

Base modal component.

```tsx
import { Modal } from "@/components/modals/modal";

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md" // "sm" | "md" | "lg" | "xl"
>
  {/* Modal content */}
</Modal>
```

### Create Task Modal

Pre-built modal for creating tasks.

```tsx
import { CreateTaskModal } from "@/components/modals/create-task-modal";

<CreateTaskModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={(taskData) => {
    console.log("New task:", taskData);
    // Handle task creation
  }}
/>
```

## Layout Components

### Main Layout

Main layout wrapper with sidebar and header.

```tsx
import { MainLayout } from "@/components/layout/main-layout";

export default function MyPage() {
  return (
    <MainLayout>
      {/* Your page content */}
    </MainLayout>
  );
}
```

## Utilities

### Format Date

```tsx
import { formatDate } from "@/lib/utils";

formatDate(new Date()); // "Dec 1, 2024"
formatDate("2024-12-01"); // "Dec 1, 2024"
```

### Format Currency

```tsx
import { formatCurrency } from "@/lib/utils";

formatCurrency(1000); // "$1,000.00"
```

### Get Initials

```tsx
import { getInitials } from "@/lib/utils";

getInitials("John Doe"); // "JD"
```

### CN Utility

Merge class names with Tailwind.

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />
```

## State Management

### Theme Store

Manage theme state with Zustand.

```tsx
import { useThemeStore } from "@/stores/theme-store";

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useThemeStore();

  return (
    <button onClick={() => setTheme("dark")}>
      Current theme: {resolvedTheme}
    </button>
  );
}
```

## Best Practices

1. **Always use TypeScript types** - All components are fully typed
2. **Follow the component structure** - Keep components modular and reusable
3. **Use the utility functions** - Leverage existing utilities for common operations
4. **Maintain consistency** - Use the provided UI components for consistent styling
5. **Handle loading states** - Add loading indicators for async operations
6. **Error handling** - Implement proper error handling for API calls

