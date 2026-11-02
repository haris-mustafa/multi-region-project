variable "region" {
  description = "AWS region (keep it the same as AWS_REGION in the GitHub workflow)"
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Name prefix for all resources"
  type        = string
  default     = "task-tracker"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "db_username" {
  type    = string
  default = "postgres"
}

variable "db_password" {
  description = "RDS password. Avoid / @ \" and spaces. Set with: export TF_VAR_db_password=..."
  type        = string
  sensitive   = true
}
