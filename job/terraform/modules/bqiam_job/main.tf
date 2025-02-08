data "google_project" "project" {
  project_id = var.project
}

resource "google_service_account" "job" {
  account_id = "${var.name}-job"
  project    = data.google_project.project.project_id
}

resource "google_project_iam_member" "metadata_viewer" {
  for_each = toset(var.bq_projects)

  project = each.value
  member  = "serviceAccount:${google_service_account.job.email}"
  role    = "roles/bigquery.metadataViewer"
}

resource "google_storage_bucket_iam_member" "object_user" {
  member = "serviceAccount:${google_service_account.job.email}"
  bucket = var.gcs_bucket
  role   = "roles/storage.objectUser"
}

resource "google_cloud_run_v2_job" "default" {
  name     = var.name
  project  = data.google_project.project.project_id
  location = var.location

  deletion_protection = false # set to "true" in production

  template {
    template {
      service_account = google_service_account.job.email
      containers {
        image = var.image
        env {
          name  = "BQIAM_TOML"
          value = var.bqiam_toml
        }
        env {
          name  = "GCS_PATH"
          value = "gs://${var.gcs_bucket}${var.gcs_path}"

        }
      }
    }
  }
}

resource "google_service_account" "invoker" {
  account_id = "${var.name}-invoker"
  project    = var.project
}

resource "google_cloud_run_v2_job_iam_member" "invoker" {
  project  = data.google_project.project.project_id
  location = var.location
  name     = google_cloud_run_v2_job.default.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.invoker.email}"

}

resource "google_cloud_scheduler_job" "job" {
  provider         = google-beta
  name             = var.name
  description      = ""
  schedule         = var.schedule
  attempt_deadline = "320s"
  region           = var.location
  project          = data.google_project.project.project_id

  retry_config {
    retry_count = 1
  }

  http_target {
    http_method = "POST"
    uri         = "https://${google_cloud_run_v2_job.default.location}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${data.google_project.project.number}/jobs/${google_cloud_run_v2_job.default.name}:run"

    oauth_token {
      service_account_email = google_service_account.invoker.email
    }
  }

  depends_on = [
    # resource.google_project_service.cloudscheduler_api,
    resource.google_cloud_run_v2_job.default,
    resource.google_cloud_run_v2_job_iam_member.invoker,
  ]
}
