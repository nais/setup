# Development Guide

Development documentation for the `nais/setup` GitHub Action.

## Setup

```bash
git clone https://github.com/nais/setup.git
cd setup

# Install Node.js 24 via Mise
mise trust && mise install

# Install dependencies
pnpm install
```

## Development Commands

```bash
# Run all checks (recommended before committing)
pnpm run check

# Individual commands
pnpm run build              # Compile TypeScript
pnpm run test               # Run unit tests
pnpm run test:integration   # End-to-end test with dry-run
pnpm run lint               # Check code quality
pnpm run format             # Format code
pnpm run typecheck          # Check types
```

## Testing

Tests use dry-run mode to avoid installing binaries locally:

```bash
# Unit tests (mocked)
pnpm test

# Integration test (real downloads, no installation)
pnpm run test:integration

# Manual test
NAIS_CLI_DRY_RUN=true RUNNER_OS=Linux RUNNER_ARCH=X64 RUNNER_TEMP=/tmp INPUT_VERSION=latest node dist/index.js
```

## Release Process

We use [Changesets](https://github.com/changesets/changesets) for releases:

```bash
# 1. Create changeset describing your changes
pnpm run changeset

# 2. Commit and push to javascript branch
git add . && git commit -m "Add feature" && git push

# 3. Merge the auto-generated Release PR when ready
```

See [RELEASE_STRATEGY.md](RELEASE_STRATEGY.md) for detailed release information.

## Architecture

### Core Components

- **Platform Detection**: Maps GitHub runner info to nais CLI binary names
- **GitHub API**: Fetches release information and download URLs
- **Installer**: Downloads, verifies checksums, and installs binaries
- **Dry-run Mode**: Testing without permanent installation

### Key Features

- **Checksum Verification**: SHA256 validation for security
- **Tool Cache**: Uses GitHub Actions caching for performance
- **Error Handling**: Detailed error messages with context
- **Linux Support**: amd64 and arm64 architectures

## Code Quality

- **TypeScript**: Strict mode with comprehensive types
- **ESLint**: Code quality rules (no `any` types allowed)
- **Prettier**: Consistent formatting
- **Jest**: Unit testing with mocking

## Troubleshooting

```bash
# Clean rebuild
pnpm run clean && pnpm install && pnpm run build

# Debug TypeScript issues
pnpm run typecheck

# Fix linting/formatting
pnpm run lint:fix && pnpm run format
```

## Contributing

1. Fork and create feature branch from `javascript`
2. Make changes and add tests
3. Run `pnpm run check` to verify quality
4. Create changeset: `pnpm run changeset`
5. Submit pull request
