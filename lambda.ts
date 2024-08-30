resource "aws_lb_listener" "example" {
  load_balancer_arn = aws_lb.example.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "arn:aws:acm:sa-east-1:xxxxxxxx:certificate/yyyyyyyy"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.lambda.arn
  }
}

resource "aws_lb_target_group" "lambda" {
  name     = "lambda-target-group"
  target_type = "lambda"

  # Use uma declaração de dependência se sua função lambda estiver em um módulo separado
  depends_on = [aws_lb_listener.example]

  # Associar a função Lambda ao Target Group
  lambda_arn = aws_lambda_function.example.arn
}

resource "aws_lb_listener_rule" "example" {
  listener_arn = aws_lb_listener.example.arn
  priority     = 50000

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lambda.arn
  }

  condition {
    field  = "path-pattern"
    values = ["/invoke"]
  }
}

resource "aws_lambda_permission" "alb" {
  statement_id  = "AllowALBInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.example.function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = aws_lb_target_group.lambda.arn
}
