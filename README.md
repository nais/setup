# nais/setup Github Action

A GitHub Action to install the [Nais CLI](https://github.com/nais/cli) on Linux runners.

## Usage

```yaml
- uses: nais/setup@v1
- run: nais --version
```

### With specific version

```yaml
- uses: nais/setup@v1
  with:
    version: v3.8.3
```

## Inputs

| Name      | Description                               | Required | Default  |
| --------- | ----------------------------------------- | -------- | -------- |
| `version` | Version to install (`v3.8.3` or `latest`) | No       | `latest` |

## Version Pinning

**Recommended:** Use major version for automatic updates

```yaml
- uses: nais/setup@v1 # Gets latest v1.x.x
```

**Alternative:** Pin to exact version

```yaml
- uses: nais/setup@v1.2.3 # No automatic updates
```

## Requirements

- Linux or macOS runner
- `gh` CLI available on the runner (pre-installed on GitHub-hosted runners)

## Releasing

```bash
./release.sh v1.2.3
```

Pre-release (skips updating the major version branch):

```bash
./release.sh v1.2.3-rc.1
```

## Support

- [Nais CLI Documentation](https://doc.nais.io/cli)
- [Report Issues](https://github.com/nais/setup/issues)
