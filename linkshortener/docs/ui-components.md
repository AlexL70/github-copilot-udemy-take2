# UI Components - shadcn/ui

This document outlines the standards for UI component usage in the Linkshortener application.

## Core Principle

**ALL UI elements MUST use shadcn/ui components. DO NOT create custom components.**

---

## 🎨 shadcn/ui Overview

shadcn/ui provides accessible, customizable component primitives built on:

- **Radix UI** - Unstyled, accessible components
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Full type safety

Components are installed directly into your codebase (`/components/ui/`) rather than as npm dependencies.

---

## 📦 Available Components

Common shadcn/ui components used in this project:

### Form & Input

- `Button` - Buttons with multiple variants
- `Input` - Text input fields
- `Textarea` - Multi-line text input
- `Select` - Dropdown selections
- `Checkbox` - Boolean toggles
- `Switch` - On/off toggle
- `RadioGroup` - Single selection from options
- `Label` - Form labels

### Layout & Display

- `Card` - Content containers
- `Dialog` - Modal overlays
- `Sheet` - Slide-in panels
- `Popover` - Floating content
- `Tabs` - Tabbed navigation
- `Accordion` - Collapsible sections
- `Separator` - Visual dividers

### Feedback

- `Alert` - Important messages
- `Toast` - Temporary notifications
- `Badge` - Status indicators
- `Progress` - Loading states
- `Skeleton` - Loading placeholders

### Navigation

- `DropdownMenu` - Contextual menus
- `NavigationMenu` - Site navigation
- `Breadcrumb` - Page hierarchy

### Data Display

- `Table` - Tabular data
- `Avatar` - User images
- `Tooltip` - Hover information

---

## ✅ Usage Guidelines

### Install Components as Needed

```bash
# Install a new component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Import from `/components/ui/`

```typescript
// ✅ ALWAYS: Use shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function LinkForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Short Link</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter URL" />
        <Button>Create Link</Button>
      </CardContent>
    </Card>
  );
}
```

### Use the `cn()` Utility for Customization

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CustomButton({ className, ...props }) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-blue-500 to-purple-500",
        className
      )}
      {...props}
    />
  );
}
```

### Variant System

```typescript
// shadcn/ui components support variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link Style</Button>

// Sizes
<Button size="default">Medium</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

---

## 🚫 What NOT to Do

```typescript
// ❌ NEVER: Create custom button components
export function CustomButton() {
  return (
    <button className="px-4 py-2 bg-blue-500 rounded">
      Click me
    </button>
  );
}

// ❌ NEVER: Create custom card components
export function CustomCard() {
  return (
    <div className="border rounded-lg p-4">
      Content
    </div>
  );
}

// ❌ NEVER: Create custom dialog/modal components
export function CustomModal() {
  return (
    <div className="fixed inset-0 bg-black/50">
      <div className="bg-white rounded">Modal content</div>
    </div>
  );
}
```

---

## 🎯 Common Patterns

### Form with Validation

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LinkForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Short Link</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="https://example.com" />
          </div>
          <Button type="submit">Shorten Link</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Modal Dialog

```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DeleteConfirmation() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <p>This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Data Table

```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function LinksTable({ links }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Short Code</TableHead>
          <TableHead>Original URL</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <TableRow key={link.id}>
            <TableCell>{link.shortCode}</TableCell>
            <TableCell>{link.originalUrl}</TableCell>
            <TableCell>{link.clicks}</TableCell>
            <TableCell>
              <Badge variant={link.isActive ? 'default' : 'secondary'}>
                {link.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Toast Notifications

```typescript
'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function CopyButton({ text }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
  };

  return <Button onClick={handleCopy}>Copy</Button>;
}
```

---

## 🎨 Theming & Dark Mode

shadcn/ui components automatically support dark mode through Tailwind's dark mode classes:

```tsx
// Components automatically adapt to dark mode
<Card className="bg-white dark:bg-zinc-900">
  <CardHeader>
    <CardTitle className="text-black dark:text-white">Title</CardTitle>
  </CardHeader>
</Card>
```

---

## 📚 Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com
- **Component Installation**: `npx shadcn@latest add [component-name]`
- **Browse Components**: https://ui.shadcn.com/docs/components
- **Radix UI Docs**: https://www.radix-ui.com/primitives

---

## 💡 Summary

- ✅ **ALWAYS** use shadcn/ui components for UI elements
- ✅ Install components with `npx shadcn@latest add [component]`
- ✅ Customize with Tailwind classes and the `cn()` utility
- ✅ Use built-in variants and sizes
- ❌ **NEVER** create custom buttons, cards, dialogs, or form elements
- ❌ **NEVER** rebuild components that shadcn/ui already provides

When in doubt, check https://ui.shadcn.com/docs/components for available components before creating anything custom.
