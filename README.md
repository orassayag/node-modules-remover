# Node Modules Remover

Node Modules Remover is a powerful TypeScript CLI utility designed to recursively scan directories and safely delete node_modules folders to reclaim disk space.

Built in March 2026, it features intelligent path filtering, dry-run protection, live progress tracking, and detailed statistics reporting. The tool efficiently traverses large directory trees, calculates folder sizes, supports ignore patterns for critical projects, and provides real-time scanning and deletion updates for safe, automated dependency cleanup across development environments.

## 🎯 Why Node Modules Remover?

Are you tired of `node_modules` directories consuming gigabytes of disk space across your projects? This tool helps you:

- **Reclaim Disk Space** - Free up gigabytes by removing unused dependencies
- **Clean Efficiently** - Process hundreds of directories in minutes
- **Stay Safe** - Dry-run mode prevents accidental deletions
- **See Progress** - Real-time updates show exactly what's happening
- **Filter Smartly** - Protect important projects with ignore patterns

## ✨ Features

- 🔍 **Recursive Scanning**: Finds all `node_modules` directories at any depth
- 📡 **Live Scan Progress**: Real-time display of current path being scanned and directories found (updates every 500ms)
- 🛡️ **Dry-Run Mode**: Preview what will be deleted before actual removal (enabled by default)
- 🎯 **Smart Filtering**: Ignore specific paths by pattern matching
- 📊 **Detailed Statistics**: Shows directories, files, total size, and ignored paths
- ⏱️ **Live Delete Progress**: Real-time progress display during deletion (updates every 2 seconds)
- ⚡ **Fast & Efficient**: Parallel processing for optimal performance
- 🔒 **Type-Safe**: Written in TypeScript with full type safety

### Core Capabilities

- **Recursive Directory Scanning**: Finds `node_modules` folders at any depth
- **Smart Path Filtering**: Ignore specific directories using pattern matching
- **Dry-Run Preview**: Safely preview deletions without making changes
- **Live Progress Tracking**: Real-time updates during scanning and deletion
- **Comprehensive Statistics**: Detailed reports on space reclaimed

### Technical Excellence

- **Type Safety**: Full TypeScript with strict type checking
- **Async/Await**: Non-blocking I/O with `fs.promises`
- **Parallel Processing**: Efficient size calculations
- **Error Handling**: Graceful handling of file system errors
- **Comprehensive Testing**: Unit and integration tests with Vitest

### Developer Experience

- **Clear Configuration**: Simple settings in `src/settings.ts`
- **Fast Builds**: Quick TypeScript compilation
- **Easy Testing**: Watch mode for development
- **Clean Codebase**: Well-organized modules with clear responsibilities
- **Linting & Formatting**: ESLint and Prettier configured

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm package manager (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd node-modules-remover
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm build
```

## 📊 Architecture

### System Flow

```mermaid
graph TD
    A[User Configuration<br/>settings.ts] --> B[Main Entry Point]
    B --> C{Dry Run Mode?}
    C -->|Yes| D[Scanner Module]
    C -->|No| D
    D -->|Find node_modules| E[Calculate Sizes]
    E --> F{Dry Run?}
    F -->|Yes| G[Display Results]
    F -->|No| H[Remover Module]
    H -->|Delete Directories| I[Track Progress]
    I --> J[Statistics Module]
    J --> G
    G --> K[Console Output]

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style D fill:#f0e1ff
    style H fill:#ffe1e1
    style J fill:#e1ffe1
    style K fill:#ffe1f5
```

### Module Interaction

```mermaid
graph LR
    A[Scanner] -->|"ScanResult[]"| B[Statistics]
    C[Remover] -->|"DeleteResult[]"| B
    B -->|Display| D[Console]
    E[PathUtils] -.->|Filter| A
    E -.->|Size| A
    F[FormatUtils] -.->|Format| B

    style A fill:#bbdefb
    style C fill:#ffccbc
    style B fill:#c5e1a5
    style D fill:#fff59d
    style E fill:#e1bee7
    style F fill:#ffccbc
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Main
    participant Scanner
    participant PathUtils
    participant Remover
    participant Statistics

    User->>Main: Configure settings
    Main->>Scanner: scan(path, ignorePatterns)

    loop For each directory
        Scanner->>PathUtils: shouldIgnorePath()
        PathUtils-->>Scanner: true/false
        Scanner->>PathUtils: getDirectorySize()
        PathUtils-->>Scanner: {files, bytes}
    end

    Scanner-->>Main: {directories, ignoredCount}

    alt Dry Run = false
        Main->>Remover: delete(directories)
        loop For each directory
            Remover->>Remover: rm directory
            Remover->>Main: Progress callback
        end
        Remover-->>Main: DeleteResult[]
    end

    Main->>Statistics: aggregate(results)
    Statistics->>Statistics: Calculate totals
    Statistics->>User: Display formatted output
```

## 🚀 Installation

```bash
# Clone the repository
git clone <repository-url>
cd node-modules-remover

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Configuration

Edit `src/settings.ts` to configure the tool:

```typescript
export const settings: Settings = {
  scanPath: '/Users/yourusername/Repos', // Root directory to scan
  ignorePaths: [], // Patterns to ignore (e.g., ['Project A', 'my-app'])
  dryRun: true, // Set to false to actually delete
};
```

### Configuration Options

- **scanPath**: The root directory to start scanning from
- **ignorePaths**: Array of strings - if any path contains these strings (case-insensitive), it will be skipped along with all subdirectories
- **dryRun**: When `true`, shows what would be deleted without actually deleting anything. Set to `false` to perform actual deletion.

### Example Ignore Patterns

```typescript
export const settings: Settings = {
  scanPath: '/Users/orassayag/Repos',
  ignorePaths: ['important-project', 'production', '.backup'],
  dryRun: true,
};
```

This configuration will skip any path containing "important-project", "production", or ".backup".

## 📖 Usage

### Dry-Run Mode (Preview Only)

By default, the tool runs in dry-run mode and will NOT delete anything:

```bash
pnpm start
```

**Output Example:**

```
🔍 Node Modules Remover

[DRY RUN MODE] No files will be deleted

Scanning: /Users/orassayag/Repos

Scanning directories...

Scanning: 58 found | Current: /Users/orassayag/Repos/my-project/src/components

(Scanning line updates in-place showing current path and count...)

Found 58 node_modules directories

[DRY RUN] No files were deleted

===DIRECTORIES: 58===
===FILES: 84,543,554===
===SIZE: 5.67GB (6,089,740,000 bytes)===
===IGNORED: 0===

✅ Done!
```

### Actual Deletion

To actually delete the `node_modules` directories:

1. Edit `src/settings.ts` and set `dryRun: false`
2. Run the tool:

```bash
pnpm start
```

**Output Example with Live Progress:**

```
🔍 Node Modules Remover

Scanning: /Users/orassayag/Repos

Scanning directories...

Scanning: 58 found | Current: /Users/orassayag/Repos/archived/old-project/lib

(Scanning line updates every 500ms...)

Found 58 node_modules directories

🗑️  Deleting node_modules directories...

Progress: 35/58 (60%) | Deleted: 35 | Size: 4.12GB | Files: 48,234,123

(Progress line updates in-place every 2 seconds...)

✅ Deleted 58/58 directories successfully

===DIRECTORIES: 58===
===FILES: 84,543,554===
===SIZE: 5.67GB (6,089,740,000 bytes)===
===IGNORED: 0===
===DELETED: 58===

✅ Done!
```

## 🛠️ Development

### Available Scripts

```bash
# Run the tool
pnpm start

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the project
pnpm build

# Lint the code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check code formatting
pnpm prettier

# Fix formatting issues
pnpm prettier:fix
```

### Running Tests

```bash
pnpm test
```

All tests are located in `__tests__` directories next to the source files they test.

### Directory Structure

```
node-modules-remover/
├── src/
│   ├── main.ts                    # Entry point
│   ├── settings.ts                # Configuration
│   ├── types/
│   │   └── index.ts              # Type definitions
│   ├── core/
│   │   ├── scanner.ts            # Directory scanning logic
│   │   ├── remover.ts            # Deletion logic
│   │   ├── statistics.ts         # Stats collection & display
│   │   └── __tests__/            # Core module tests
│   └── utils/
│       ├── pathUtils.ts          # Path utilities
│       ├── formatUtils.ts        # Formatting utilities
│       └── __tests__/            # Utils tests
├── package.json
├── tsconfig.json
└── README.md
```

### Design Patterns

- **Module Pattern**: Clear separation of concerns (scanner, remover, statistics)
- **Strategy Pattern**: Different processing strategies for scan vs delete
- **Observer Pattern**: Progress callbacks for real-time updates
- **Repository Pattern**: Abstraction of file system operations

### Architecture Principles

This project follows clean architecture principles:

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Type Safety**: Strict TypeScript with comprehensive type definitions
3. **Error Handling**: Graceful error handling with clear user feedback
4. **Testability**: Pure functions and modular design for easy testing
5. **Performance**: Async/await with parallel processing for optimal speed
6. **Safety**: Dry-run mode enabled by default to prevent accidental deletions

### Best Practices

1. **Always use dry-run first**: Preview deletions before making changes
2. **Configure ignore patterns**: Protect important projects from accidental deletion
3. **Review statistics**: Check the space you're about to reclaim
4. **Backup important data**: Before running large deletions, ensure you have backups
5. **Keep dependencies updated**: Regularly update project dependencies for security and performance

## ⚙️ How It Works

1. **Scanner** recursively traverses the directory tree starting from `scanPath`
   - Shows live progress: current path being scanned and count of `node_modules` found
   - Updates every 500ms for responsive feedback
2. **Filtering** checks each path against `ignorePaths` patterns and skips matches
3. **Size Calculation** computes the total files and bytes for each `node_modules` directory
4. **Deletion** (if not dry-run) safely removes each directory with error handling
   - Shows live progress: percentage, deleted count, size, and file count
   - Updates every 2 seconds during deletion
5. **Statistics** aggregates and displays final formatted results

## 🛡️ Safety Features

- ✅ **Dry-run mode enabled by default** - prevents accidental deletions
- ✅ **Path filtering** - protect important directories
- ✅ **Error handling** - continues processing even if some deletions fail
- ✅ **Detailed logging** - see exactly what's being processed

## 📚 Example Scenarios

### Scenario 1: Preview Before Deleting

```typescript
// settings.ts
export const settings: Settings = {
  scanPath: '/Users/orassayag/Repos',
  ignorePaths: [],
  dryRun: true, // Safe preview mode
};
```

Run `pnpm start` to see what would be deleted.

### Scenario 2: Delete Everything Except Specific Projects

```typescript
// settings.ts
export const settings: Settings = {
  scanPath: '/Users/orassayag/Repos',
  ignorePaths: ['production-app', 'client-project'],
  dryRun: false, // Actually delete
};
```

This will delete all `node_modules` except in paths containing "production-app" or "client-project".

### Scenario 3: Clean a Specific Subdirectory

```typescript
// settings.ts
export const settings: Settings = {
  scanPath: '/Users/orassayag/Repos/archived-projects',
  ignorePaths: [],
  dryRun: false,
};
```

## ⚡ Performance

The tool uses:

- **Async/await** with `fs.promises` for non-blocking I/O
- **Parallel processing** for size calculations
- **Early exit optimization** when paths are ignored

Typical performance: ~50-100 directories per minute depending on disk speed and directory depth.

## 🔧 Troubleshooting

### Permission Errors

If you encounter permission errors:

- Ensure you have read/write access to the directories
- On macOS/Linux, you may need to adjust folder permissions
- Run with appropriate user privileges

### Out of Memory

If scanning very large directory trees:

- Consider scanning smaller subdirectories separately
- The tool streams results to avoid loading everything into memory

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📚 Documentation

- [Contributing Guide](CONTRIBUTING.md) - How to contribute to this project
- [Developer Instructions](INSTRUCTIONS.md) - Detailed development documentation
- [License](LICENSE) - MIT License details

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Tested with [Vitest](https://vitest.dev/)
- Package management by [pnpm](https://pnpm.io/)

## 📧 Contact

Or Assayag - [@orassayag](https://github.com/orassayag)

Project Link: [https://github.com/orassayag/node-modules-remover](https://github.com/orassayag/node-modules-remover)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you reclaim your disk space!

---

**⚠️ Warning**: This tool permanently deletes directories. Always run in dry-run mode first and double-check your ignore patterns before setting `dryRun: false`.

## License

This application has an MIT license - see the [LICENSE](LICENSE) file for details.

## Author

- **Or Assayag** - _Initial work_ - [orassayag](https://github.com/orassayag)
- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag

## Acknowledgments

- Built for educational and research purposes
- Respects robots.txt and implements rate limiting
- Uses user-agent rotation to avoid detection
- Implements polite crawling practices
