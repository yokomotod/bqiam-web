# Cloud Run Job to periodical update

Prepare Artifact Registry repository

```hcl
locals {
  name = "bqiam-job"
  project = "your-project"
  location  = "asia-northeast1"
}

resource "google_artifact_registry_repository" "default" {
  project       = local.project
  location      = local.location
  repository_id = local.name
  format        = "DOCKER"
}
```

Build image

```bash
cd ./job

docker build -t asia-northeast1-docker.pkg.dev/your-project/bqiam-job/bqiam-job:latest .

docker push asia-northeast1-docker.pkg.dev/your-project/bqiam-job/bqiam-job:latest
```

Deploy Cloud Run Job with Cloud Scheduler

```hcl
module "job" {
  source = "github.com/yokomotod/bqiam-web//job/terraform/modules/bqiam_job"

  project     = local.project
  location    = local.location
  name        = local.name
  image       = "${google_artifact_registry_repository.default.location}-docker.pkg.dev/${google_artifact_registry_repository.default.project}/${google_artifact_registry_repository.default.name}/${local.name}:latest"
  bqiam_toml  = <<-EOT
    BigqueryProjects = ["bq-project-1", "bq-project-2", "bq-project-3"]
    CacheFile = "~/.bqiam-cache-file.json"
  EOT
  bq_projects = ["bq-project-1", "bq-project-2", "bq-project-3"]
  gcs_bucket  = "YOUR_WEBSITE_BUCKET"
  gcs_path    = "/ANY/PATH/"
  schedule    = "0 21 * * *" # 9:00 JST
}
```
