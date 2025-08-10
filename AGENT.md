# AGENT.md - Development Guidelines for nice-auto-expense-tracker

## Commands
- **Dev**: `npm run dev` or `pnpm dev` - Start development server
- **Build**: `npm run build` or `pnpm build` - Build for production  
- **Lint**: `npm run lint` or `pnpm lint` - Run ESLint
- **Preview**: `npm run preview` or `pnpm preview` - Preview production build
- **Type check**: `npx tsc --noEmit` - TypeScript type checking

## Architecture
- **Stack**: React 18 + TypeScript + Vite + TailwindCSS
- **State**: Local state with localStorage persistence via `utils/storage.ts`
- **Structure**: Feature-based components in `src/components/` (Auth/, Layout/, Reports/)
- **Types**: Centralized in `src/types/index.ts` (Expense, User, CategoryData, MonthlyData)
- **Utils**: PDF generation (`pdfGenerator.ts`) and storage management (`storage.ts`)

## Code Style
- **Imports**: Named imports preferred, organize by external → internal → relative
- **Components**: PascalCase function components with TypeScript interfaces
- **Files**: camelCase for utils, PascalCase for components
- **Styling**: TailwindCSS classes, mobile-first responsive design
- **State**: useState hooks with proper TypeScript typing, no global state management
- **Error handling**: Try/catch where needed, graceful fallbacks for localStorage
