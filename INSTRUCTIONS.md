# Node Modules Remover - Developer Instructions

This document provides detailed instructions for developers working on the Node Modules Remover project.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
- [Module Documentation](#module-documentation)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Project Overview

### Purpose

Node Modules Remover is a TypeScript CLI tool designed to help developers reclaim disk space by finding and removing `node_modules` directories across their projects. The tool provides:

- Recursive directory scanning
- Real-time progress updates
- Safe dry-run mode by default
- Intelligent path filtering
- Comprehensive statistics

### Target Users

- Developers with multiple Node.js projects
- Teams managing monorepos
- Anyone needing to free up disk space quickly
- CI/CD systems for cleanup tasks

### Key Goals

1. **Safety First** - Dry-run mode prevents accidental deletions
2. **User Feedback** - Real-time progress during operations
3. **Flexibility** - Configurable ignore patterns
4. **Performance** - Efficient parallel processing
5. **Cross-Platform** - Works on Windows, macOS, and Linux

## Architecture

### High-Level Design

```
User Input (settings.ts)
        ↓
    main.ts (Orchestrator)
        ↓
    ┌───────┴────────┐
    ↓                ↓
Scanner          Remover
    ↓                ↓
Statistics ←────────┘
    ↓
Console Output
```

### Module Responsibilities

| Module | Responsibility | Key Functions |
|--------|---------------|---------------|
| `main.ts` | Entry point and orchestration | Coordinates scanning, deletion, and reporting |
| `scanner.ts` | Directory traversal | Recursively finds `node_modules` directories |
| `remover.ts` | File deletion | Safely removes directories |
| `statistics.ts` | Data aggregation | Collects and displays statistics |
| `pathUtils.ts` | Path operations | Filtering, size calculation |
| `formatUtils.ts` | Data formatting | Number and byte formatting |

### Data Flow

1. **Configuration Loading** (`settings.ts`)
   - Load user configuration
   - Validate settings

2. **Scanning Phase** (`scanner.ts`)
   - Traverse directory tree
   - Apply ignore filters
   - Calculate directory sizes
   - Report progress (500ms intervals)

3. **Deletion Phase** (`remover.ts`)
   - Delete found directories (if not dry-run)
   - Handle errors gracefully
   - Report progress (2s intervals)

4. **Reporting Phase** (`statistics.ts`)
   - Aggregate results
   - Format output
   - Display final statistics

## Setup Instructions

### Prerequisites

- **Node.js** v18.0.0 or higher
- **pnpm** v8.0.0 or higher
- **Git** for version control

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd node-modules-remover

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm build

# 4. Verify setup
pnpm test
pnpm lint
```

### IDE Configuration

#### VS Code (Recommended)

Install recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes
# ... edit files ...

# 4. Run tests continuously
pnpm test:watch

# 5. Build and test
pnpm build
pnpm test
pnpm lint

# 6. Commit changes
git add .
git commit -m "feat: your feature description"

# 7. Push and create PR
git push origin feature/your-feature-name
```

### Adding a New Feature

1. **Design Phase**
   - Document the feature requirement
   - Design the API/interface
   - Consider edge cases

2. **Implementation Phase**
   - Write types first (`src/types/index.ts`)
   - Implement core logic
   - Add error handling

3. **Testing Phase**
   - Write unit tests
   - Test edge cases
   - Manual testing

4. **Documentation Phase**
   - Update JSDoc comments
   - Update README if needed
   - Add examples

### Making a Bug Fix

1. **Reproduce** - Create a test case that fails
2. **Fix** - Implement the fix
3. **Verify** - Ensure test passes
4. **Regress** - Run full test suite

## Module Documentation

### Scanner Module (`src/core/scanner.ts`)

**Purpose**: Recursively scan directories to find `node_modules` folders.

**Key Methods**:

```typescript
async scan(
  rootPath: string,
  ignorePaths: string[],
  onProgress?: ScanProgressCallback
): Promise<{ directories: ScanResult[]; ignoredCount: number }>
```

**Algorithm**:
1. Start at `rootPath`
2. Read directory entries
3. For each entry:
   - If directory name is `node_modules`: calculate size and add to results
   - If regular directory: recurse into it
   - If matches ignore pattern: skip entire subtree
4. Call progress callback every 500ms

**Performance Considerations**:
- Uses `fs.promises` for async I/O
- Parallel size calculations
- Early exit on ignored paths

### Remover Module (`src/core/remover.ts`)

**Purpose**: Safely delete directories with progress reporting.

**Key Methods**:

```typescript
async delete(
  directories: ScanResult[],
  onProgress?: ProgressCallback
): Promise<DeleteResult[]>
```

**Safety Features**:
- Only deletes if `dryRun` is false
- Handles permission errors
- Continues on individual failures
- Reports all results

### Statistics Module (`src/core/statistics.ts`)

**Purpose**: Aggregate and display statistics.

**Key Methods**:

```typescript
aggregate(
  scanResults: ScanResult[],
  deleteResults: DeleteResult[],
  ignoredCount: number
): Statistics

displayProgress(
  scanResults: ScanResult[],
  deleteResults: DeleteResult[],
  ignoredCount: number,
  completed: number,
  total: number
): void
```

**Display Format**:
```
Progress: 35/58 (60%) | Deleted: 35 | Size: 4.12GB | Files: 48,234,123
```

### Path Utilities (`src/utils/pathUtils.ts`)

**Purpose**: Path-related operations.

**Key Functions**:

```typescript
// Check if path should be ignored
shouldIgnorePath(fullPath: string, ignorePatterns: string[]): boolean

// Calculate directory size recursively
getDirectorySize(path: string): Promise<DirectorySizeResult>
```

**Ignore Logic**:
- Case-insensitive substring matching
- Checks full absolute path
- Short-circuits on first match

### Format Utilities (`src/utils/formatUtils.ts`)

**Purpose**: Format numbers and bytes for display.

**Key Functions**:

```typescript
// Format number with thousand separators
formatNumber(num: number): string  // 1234567 → "1,234,567"

// Format bytes to human-readable
formatBytes(bytes: number): string  // 1073741824 → "1.00GB"
```

## Testing Strategy

### Test Organization

```
src/
├── core/
│   ├── scanner.ts
│   ├── remover.ts
│   ├── statistics.ts
│   └── __tests__/
│       ├── scanner.test.ts
│       ├── remover.test.ts
│       └── statistics.test.ts
└── utils/
    ├── pathUtils.ts
    ├── formatUtils.ts
    └── __tests__/
        ├── pathUtils.test.ts
        └── formatUtils.test.ts
```

### Test Categories

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test module interactions
3. **Edge Cases** - Test boundary conditions

### Writing Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  describe('functionName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      // Test edge case
    });

    it('should handle error case', () => {
      // Test error handling
    });
  });
});
```

### Mocking Guidelines

```typescript
// Mock file system
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  rm: vi.fn(),
  stat: vi.fn(),
}));

// Mock module
vi.mock('../utils/pathUtils', () => ({
  shouldIgnorePath: vi.fn(),
  getDirectorySize: vi.fn(),
}));
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test scanner.test.ts

# Run tests in watch mode
pnpm test:watch

# Run with coverage (if configured)
pnpm test -- --coverage
```

## Deployment

### Building for Production

```bash
# Clean build
rm -rf dist/
pnpm build

# Verify build
node dist/main.js
```

### Release Process

1. **Version Bump**
   ```bash
   npm version patch  # or minor, major
   ```

2. **Build and Test**
   ```bash
   pnpm build
   pnpm test
   pnpm lint
   ```

3. **Commit and Tag**
   ```bash
   git add .
   git commit -m "chore: release v1.x.x"
   git tag v1.x.x
   git push origin main --tags
   ```

4. **Create Release Notes**
   - Document new features
   - List bug fixes
   - Note breaking changes

## Troubleshooting

### Common Issues

#### TypeScript Errors

**Problem**: Type errors after updating dependencies

**Solution**:
```bash
rm -rf node_modules
pnpm install
pnpm build
```

#### Test Failures

**Problem**: Tests fail after refactoring

**Solution**:
1. Check if mocks need updating
2. Verify test data is still valid
3. Run tests individually to isolate issues

#### Performance Issues

**Problem**: Scanning is slow

**Solution**:
1. Check if ignore patterns are too broad
2. Verify parallel processing is working
3. Profile with Node.js profiler

### Debug Mode

```typescript
// Add to settings.ts for debug output
export const DEBUG = true;

// In code
if (DEBUG) {
  console.log('Debug info:', data);
}
```

### Logging

```bash
# Enable verbose logging
NODE_DEBUG=fs pnpm start

# Redirect output to file
pnpm start > output.log 2>&1
```

## Best Practices

### Code Quality

1. **Type Safety** - Use strict TypeScript
2. **Error Handling** - Always handle errors
3. **Documentation** - Comment non-obvious code
4. **Testing** - Test all public APIs
5. **Performance** - Profile critical paths

### Security

1. **Input Validation** - Validate all user inputs
2. **Path Safety** - Use `path.join()` for paths
3. **Permission Checks** - Handle EACCES gracefully
4. **No Secrets** - Never commit secrets

### Maintenance

1. **Dependencies** - Keep dependencies updated
2. **Deprecations** - Address deprecation warnings
3. **Tech Debt** - Refactor regularly
4. **Documentation** - Keep docs in sync with code

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [pnpm Documentation](https://pnpm.io/)
- [Node.js File System API](https://nodejs.org/api/fs.html)

## Questions?

If you have questions not covered in this document:
1. Check existing issues on GitHub
2. Open a new issue with the `question` label
3. Reach out to maintainers

Happy coding! 🚀
