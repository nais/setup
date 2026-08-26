# setup

## 1.0.1

### Patch Changes

- bb0c82b: Create GitHub releases

## 1.0.0

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
