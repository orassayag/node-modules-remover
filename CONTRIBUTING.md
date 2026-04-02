# Contributing to Node Modules Remover

First off, thank you for considering contributing to Node Modules Remover! It's people like you that make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by a simple principle: **Be respectful and constructive**. By participating, you are expected to uphold this standard.

## Getting Started

- Make sure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed
- Fork the repository on GitHub
- Clone your fork locally
- Create a branch for your contribution

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, command output)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, Node version, pnpm version)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **A clear and descriptive title**
- **A detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Provide examples** of how it would work

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Improvements to documentation

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/node-modules-remover.git
   cd node-modules-remover
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Run tests**
   ```bash
   pnpm test
   ```

5. **Run linting**
   ```bash
   pnpm lint
   ```

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all code
- **Explicit typing** - Avoid `any` unless absolutely necessary
- **Functional approach** - Prefer pure functions and immutability
- **Clear naming** - Use descriptive variable and function names

### Code Style

- **Formatting** - Run `pnpm prettier:fix` before committing
- **Linting** - Run `pnpm lint:fix` to fix linting issues
- **No console.log** - Use proper error handling instead (except for user-facing output)
- **Comments** - Add comments for non-obvious logic, not what the code does

### File Organization

```
src/
├── core/           # Core business logic
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── __tests__/      # Test files (colocated with source)
```

### Example Code Style

```typescript
// Good
export function shouldIgnorePath(fullPath: string, ignorePatterns: string[]): boolean {
  if (ignorePatterns.length === 0) {
    return false;
  }
  const lowerPath = fullPath.toLowerCase();
  return ignorePatterns.some((pattern) => lowerPath.includes(pattern.toLowerCase()));
}

// Avoid
export function shouldIgnorePath(fullPath: any, ignorePatterns: any) {
  if (!ignorePatterns.length) return false;
  return ignorePatterns.some((pattern: any) => fullPath.toLowerCase().includes(pattern.toLowerCase()));
}
```

## Testing Guidelines

### Writing Tests

- **Test files** - Place in `__tests__` directories next to source files
- **Naming** - Use `.test.ts` suffix (e.g., `scanner.test.ts`)
- **Coverage** - Aim for high test coverage of business logic
- **Unit tests** - Test individual functions in isolation
- **Mock external dependencies** - Use Vitest mocks for file system operations

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scanner } from '../scanner';

describe('Scanner', () => {
  let scanner: Scanner;

  beforeEach(() => {
    scanner = new Scanner();
    vi.clearAllMocks();
  });

  describe('scan', () => {
    it('should find node_modules directories', async () => {
      // Arrange
      const mockPath = '/test/path';
      
      // Act
      const result = await scanner.scan(mockPath, []);
      
      // Assert
      expect(result.directories).toBeDefined();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage (if enabled)
pnpm test -- --coverage
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```
feat(scanner): add progress callback for real-time updates

Added optional callback parameter to Scanner.scan() method that
reports scanning progress every 500ms. This enables real-time
UI updates showing current path and found count.

Closes #123
```

```
fix(remover): handle permission errors gracefully

Changed error handling to suppress common EACCES/EPERM errors
while still logging unexpected errors.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update tests** - Add/update tests for your changes
2. **Run the test suite** - `pnpm test`
3. **Run linting** - `pnpm lint:fix`
4. **Run formatting** - `pnpm prettier:fix`
5. **Update documentation** - If you changed functionality
6. **Test manually** - Run the tool with your changes

### Submitting

1. **Push your branch** to your fork
2. **Open a Pull Request** against the `main` branch
3. **Fill in the PR template** with all relevant details
4. **Link related issues** using "Fixes #123" or "Closes #456"

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added/updated tests
- [ ] Tested manually

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

- **Code review** - Maintainers will review your PR
- **Feedback** - Address any requested changes
- **Approval** - Once approved, your PR will be merged
- **Credit** - You'll be credited in the release notes!

## Development Tips

### Debugging

```bash
# Run with debugging
node --inspect-brk node_modules/.bin/tsx src/main.ts
```

### Testing Locally

```bash
# Test in dry-run mode
pnpm start

# Test actual deletion (be careful!)
# Edit src/settings.ts: dryRun = false
pnpm start
```

### Performance Testing

```bash
# Use time command to measure performance
time pnpm start
```

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing!

## Recognition

Contributors will be recognized in:
- Release notes
- README.md (if significant contribution)
- GitHub contributors page

Thank you for making Node Modules Remover better! 🎉
