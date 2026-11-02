# Terraform for Task Tracker

```bash
export TF_VAR_db_password='ChangeMe12345'   # no / @ " or spaces
terraform init
terraform plan
terraform apply
```

After apply:
1. Copy the `alb_dns_name` output.
2. Add GitHub secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) and push to `main`.
3. Wait for the pipeline, then open the ALB address (targets turn healthy after the first deploy).

Check servers are visible to SSM:
`aws ssm describe-instance-information --region ap-south-1`

Clean up so you stop paying for ALB + RDS:
`terraform destroy`
