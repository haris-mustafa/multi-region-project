resource "aws_instance" "app" {
  count                       = 2
  ami                         = data.aws_ssm_parameter.al2023.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public[count.index].id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  associate_public_ip_address = true # needed so the server can reach SSM and ECR (no NAT)

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    db_host     = aws_db_instance.main.address
    db_user     = var.db_username
    db_password = var.db_password
  })
  user_data_replace_on_change = true

  metadata_options {
    http_tokens = "required"
  }

  tags = {
    Name = "${var.project}-ec2-${count.index + 1}"
    App  = "task-tracker" # the GitHub pipeline finds servers by this tag
  }
}
