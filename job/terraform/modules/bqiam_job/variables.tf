variable "project" {}
variable "location" {}
variable "name" {}
variable "image" {}
variable "bqiam_toml" {}
variable "bq_projects" {
  type = list(string)
}
variable "gcs_bucket" {}
variable "gcs_path" {}
variable "schedule" {}
