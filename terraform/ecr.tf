resource "aws_ecr_repository" "backend" {
  name         = "${var.project}-backend"
  force_delete = true # lets `terraform destroy` remove it even with images inside
}

resource "aws_ecr_repository" "frontend" {
  name         = "${var.project}-frontend"
  force_delete = true
}
