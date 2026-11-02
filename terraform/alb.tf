resource "aws_lb" "main" {
  name               = "${var.project}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "frontend" {
  name                 = "${var.project}-frontend-tg"
  port                 = 80
  protocol             = "HTTP"
  vpc_id               = aws_vpc.main.id
  deregistration_delay = 30

  health_check {
    path    = "/"
    matcher = "200"
  }
}

resource "aws_lb_target_group" "backend" {
  name                 = "${var.project}-backend-tg"
  port                 = 5000
  protocol             = "HTTP"
  vpc_id               = aws_vpc.main.id
  deregistration_delay = 30

  health_check {
    path    = "/api/health"
    matcher = "200"
  }
}

# Register both EC2s in both target groups
resource "aws_lb_target_group_attachment" "frontend" {
  count            = 2
  target_group_arn = aws_lb_target_group.frontend.arn
  target_id        = aws_instance.app[count.index].id
  port             = 80
}

resource "aws_lb_target_group_attachment" "backend" {
  count            = 2
  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = aws_instance.app[count.index].id
  port             = 5000
}

# Default: everything goes to the frontend
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# /api/* goes to the backend
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}
