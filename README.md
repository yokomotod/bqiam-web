# bqiam-web

Web UI for the [bqiam](https://github.com/hirosassa/bqiam) metadata.

## Usage

Put `.bqiam-cache-file.json`

```bash
# ensure json format cache file
grep CacheFile ~/.bqiam.toml
# -> CacheFile = "~/.bqiam-cache-file.json"

# fetch metadata
bqiam cache

cp ~/.bqiam-cache-file.json ./public/
```

Install the dependencies:

```bash
pnpm install
```

Build the app for production:

```bash
pnpm build
```

Deploy anywhere as your like.

```bash
# ex. GCS
gcloud storage cp -r dist  gs://YOUR_WEBSITE_BUCKET/ANY/PATH/
```

## Update `.bqiam-cache-file.json` automatically.

see [job/README.md](./job/README.md).

## Development

Start the dev server:

```bash
pnpm start
```

Preview the Production build product:

```bash
pnpm preview
```

Clear persistent cache local files

```bash
pnpm clean
```
