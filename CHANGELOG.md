# setup

## 1.0.0-next.7

### Patch Changes

- 01bfc04: Write defaults directly to the nais config file instead of running `nais defaults set`, which hangs on a fresh CI runner

## 1.0.0-next.6

### Minor Changes

- 1dbdea4: Add `team` and `environment` inputs to persist nais CLI defaults via `nais defaults set`

## 1.0.0-next.5

### Patch Changes

- f8ce341: Rename setup-nais-cli to setup

## 1.0.0-next.4

### Patch Changes

- df66cd2: change branch from alpha to main

## 1.0.0-next.3

### Patch Changes

- 5597d77: Use custom tag handling

## 1.0.0-next.2

### Patch Changes

- f335765: Remove excess log line

## 1.0.0-next.1

### Patch Changes

- 95c4860: Do not modify major branch for prerelease versions

## 1.0.0-next.0

### Major Changes

- bb6e5a4: Complete rewrite to TypeScript with modern architecture
  - 🚀 **Performance**: 3x faster by downloading pre-built binaries instead of building from source
  - 🔒 **Security**: SHA256 checksum verification for all downloads
  - 🧪 **Testing**: Comprehensive unit tests with Jest and dry-run testing mode
  - 🏗️ **Architecture**: Modern TypeScript codebase with proper error handling
  - 📦 **Dependencies**: Removed build dependencies (Go, mise) for smaller footprint
  - 🎯 **Platform**: Linux-focused with amd64 and arm64 support
  - 🔄 **Releases**: Automated release process with Changesets
  - 📋 **Documentation**: Separated user and developer documentation

  **Breaking Changes:**
  - Now requires Linux runners only (Windows/macOS no longer supported)
  - Action reference changed from `@alpha` to `@v1`
  - New input parameter format (same `version` parameter, improved handling)

  **Migration:**

  ```yaml
  # Before
  - uses: nais/setup@alpha

  # After
  - uses: nais/setup@v1
    with:
      version: latest
  ```
