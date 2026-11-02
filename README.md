# Task Tracker (3-tier app for AWS practice)

React + Nginx (frontend) -> Node.js/Express (backend) -> PostgreSQL

```
task-tracker/
├── backend/      Node API + Dockerfile
├── frontend/     React (Vite) + Nginx + Dockerfile
├── docker-compose.yml        run everything locally
└── .github/workflows/deploy.yml   CI/CD template (GitHub Actions + SSM)
```

## Phase 1: Run locally
```bash
docker compose up --build
# open http://localhost:8080
```

## Phase 2: Understand the rule that matters most
The frontend calls a **relative path** (`/api/tasks`), never an IP.
The browser sends it to the same address it loaded the page from. On AWS that is the **ALB**.

| Part | Container port | API paths |
|---|---|---|
| Frontend (Nginx) | 80 | everything else |
| Backend (Node) | 5000 | `/api/*` |

Backend health check path: `/api/health`

## Phase 3: AWS build order
1. **Terraform**: VPC, 2 public subnets (2 AZs), 2 private subnets, security groups
2. **ECR**: two repos: `task-tracker-backend`, `task-tracker-frontend`
3. **RDS PostgreSQL** in private subnets (SG allows 5432 only from the EC2 SG)
4. **IAM role for EC2** with:
   - `AmazonSSMManagedInstanceCore` (so SSM can control it)
   - `AmazonEC2ContainerRegistryReadOnly` (so it can pull images)
5. **2 EC2 instances** (one per AZ), tag `App=task-tracker`, with Docker + AWS CLI installed (user_data)
6. On each EC2 create `/opt/task-tracker/.env`:
   ```
   DB_HOST=<rds-endpoint>
   DB_USER=...
   DB_PASSWORD=...
   DB_NAME=tasks
   DB_SSL=true
   ```
7. **ALB** (public subnets) with 2 target groups:
   - `frontend-tg` -> port 80, health check `/`
   - `backend-tg`  -> port 5000, health check `/api/health`
   - Listener :80 rules: `/api/*` -> backend-tg, default -> frontend-tg
8. **Security groups**
   - ALB SG: 80 from the internet
   - EC2 SG: 80 and 5000 from the ALB SG only (no port 22 needed)
   - RDS SG: 5432 from the EC2 SG only
9. **GitHub secrets**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   (the IAM user needs ECR push + `ssm:SendCommand`)
10. Push to `main` -> pipeline builds, pushes, and SSM deploys.

## Test it
Open the ALB DNS name. Add a task. Stop one EC2 and check the app still works.

## Next steps (same as your roadmap)
Route 53 + ACM (HTTPS), image tags by commit SHA for rollbacks,
Prometheus + Grafana, GitHub OIDC instead of access keys.
