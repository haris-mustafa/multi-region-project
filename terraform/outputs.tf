output "alb_dns_name" {
  description = "Open this in your browser"
  value       = aws_lb.main.dns_name
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  value = aws_db_instance.main.address
}

output "ec2_instance_ids" {
  value = aws_instance.app[*].id
}
