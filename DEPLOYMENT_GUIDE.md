# DEPLOYMENT.md: SkripsiHub

## Deployment Architecture Overview

SkripsiHub follows a modern, cloud-native deployment strategy with clear separation between frontend and backend services. The system is designed for high availability, automated scaling, and rapid iteration through CI/CD pipelines.

**Deployment Topology:**
- **Frontend:** Vercel (React.js application)
- **Backend:** Railway (Nest.js API)
- **Database:** MySQL (managed service or self-hosted)
- **File Storage:** AWS S3 (approval letter PDFs)
- **Monitoring & Logging:** Sentry + application-level logging
- **Email Service:** SendGrid

## Environment Strategy

### Development Environment

**Purpose:** Local development and feature testing.

**Configuration:**
- Local MySQL instance (Docker container recommended)
- Environment variables loaded from `.env.local`
- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173` (Vite dev server)
- Mock AWS S3 using MinIO or local file storage
- SendGrid sandbox mode for email testing

**Setup:**
```bash
# Backend
cp .env.example .env.local
npm install
npm run start:dev

# Frontend
npm install
npm run dev
```

### Staging Environment

**Purpose:** Pre-production testing, UAT, and validation before production release.

**Configuration:**
- Dedicated MySQL database (separate from production)
- Railway staging deployment with auto-scaling disabled
- Vercel preview deployments (automatic for pull requests)
- AWS S3 staging bucket with separate credentials
- SendGrid test API key
- Sentry staging project for error tracking
- Full feature parity with production

**Deployment Trigger:** Manual deployment from `staging` branch or automated on merge to `staging`.

### Production Environment

**Purpose:** Live system serving end users.

**Configuration:**
- Production MySQL database with automated backups
- Railway production deployment with auto-scaling enabled
- Vercel production deployment (automatic on merge to `main`)
- AWS S3 production bucket with versioning and lifecycle policies
- SendGrid production API key
- Sentry production project with performance monitoring
- CDN enabled for static assets
- SSL/TLS certificates (auto-managed by Vercel and Railway)

**Deployment Trigger:** Automated on merge to `main` branch after passing all CI checks.

## Continuous Integration & Continuous Deployment (CI/CD)

### CI/CD Pipeline Overview

The CI/CD pipeline is implemented using GitHub Actions and integrates with Vercel and Railway for automated deployments.

**Pipeline Stages:**
1. **Trigger:** Push to branch or pull request creation
2. **Checkout:** Clone repository
3. **Install Dependencies:** `npm install`
4. **Lint & Format Check:** ESLint, Prettier
5. **Unit Tests:** Jest test suite
6. **Build:** Compile TypeScript, bundle frontend
7. **Security Scan:** Dependency vulnerability check (npm audit)
8. **Deploy (if applicable):** Push to staging or production

### GitHub Actions Workflow

**File:** `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Format check
        run: npm run format:check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Security audit
        run: npm audit --audit-level=moderate
      
      - name: Build backend
        run: npm run build
      
      - name: Build frontend
        run: npm run build:frontend

  deploy-staging:
    needs: lint-and-test
    if: github.ref == 'refs/heads/staging' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway (Staging)
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN_STAGING }}
        run: |
          npm install -g @railway/cli
          railway up --service backend --environment staging

  deploy-production:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway (Production)
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN_PROD }}
        run: |
          npm install -g @railway/cli
          railway up --service backend --environment production
      - name: Notify deployment
        run: echo "Production deployment complete"
```

### Vercel Frontend Deployment

Vercel automatically deploys the frontend on every push to `main` and creates preview deployments for pull requests.

**Configuration:** `vercel.json`

```json
{
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "dist",
  "env": {
    "REACT_APP_API_URL": "@api_url",
    "REACT_APP_SENTRY_DSN": "@sentry_dsn"
  },
  "regions": ["sin1"],
  "functions": {
    "api/**": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

## Container & Infrastructure Configuration

### Backend Container (Nest.js)

**Dockerfile:** `Dockerfile`

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Docker Compose (Development):** `docker-compose.yml`

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://root:password@db:3306/skripsihub
      NODE_ENV: development
      JWT_SECRET: ${JWT_SECRET}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: skripsihub
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### Railway Backend Deployment

**Railway Configuration:** `railway.json`

```json
{
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyMaxRetries": 5
  },
  "variables": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

**Environment Variables (Railway Dashboard):**
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRATION`: Token expiration time (e.g., "24h")
- `SENDGRID_API_KEY`: SendGrid API key
- `AWS_REGION`: AWS region (e.g., "ap-southeast-1")
- `AWS_ACCESS_KEY_ID`: AWS IAM access key
- `AWS_SECRET_ACCESS_KEY`: AWS IAM secret key
- `AWS_S3_BUCKET`: S3 bucket name for PDFs
- `SENTRY_DSN`: Sentry project DSN
- `FRONTEND_URL`: Frontend URL for CORS

## Database Deployment & Migration

### Database Setup

**Initial Setup:**
1. Create MySQL database and user
2. Run migrations to initialize schema
3. Seed initial data (admin accounts, validators)

**Migration Tool:** TypeORM migrations

**File:** `src/database/migrations/001-initial-schema.ts`

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password_hash', type: 'varchar' },
          { name: 'role', type: 'enum', enum: ['STUDENT', 'ADMIN', 'VALIDATOR'] },
          { name: 'full_name', type: 'varchar' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'submissions',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'student_id', type: 'varchar' },
          { name: 'status', type: 'enum', enum: ['DRAFT', 'PENDING_ADMIN', 'PENDING_VALIDATOR', 'APPROVED', 'REJECTED'] },
          { name: 'assigned_validator_id', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          { columnNames: ['student_id'], referencedTableName: 'users', referencedColumnNames: ['id'] },
          { columnNames: ['assigned_validator_id'], referencedTableName: 'users', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    // Additional tables: submission_titles, approval_letters, notifications, etc.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('submissions');
    await queryRunner.dropTable('users');
  }
}
```

**Running Migrations:**

```bash
# Development
npm run typeorm migration:run -- -d src/database/data-source.ts

# Production (via Railway)
npm run typeorm migration:run -- -d src/database/data-source.ts
```

### Database Backup Strategy

**Automated Backups:**
- Daily automated backups via MySQL native tools or managed service (e.g., AWS RDS automated backups)
- Retention: 30 days
- Backup location: Separate AWS S3 bucket with versioning enabled

**Backup Verification:**
- Weekly restore test to a staging database to verify backup integrity
- Documented restore procedure in runbook

## AWS S3 Configuration

### S3 Bucket Setup

**Bucket Name:** `skripsihub-pdfs-prod`

**Configuration:**
```json
{
  "Versioning": "Enabled",
  "ServerSideEncryption": "AES-256",
  "PublicAccessBlockConfiguration": {
    "BlockPublicAcls": true,
    "BlockPublicPolicy": true,
    "IgnorePublicAcls": true,
    "RestrictPublicBuckets": true
  },
  "LifecycleConfiguration": {
    "Rules": [
      {
        "Id": "DeleteOldVersions",
        "NoncurrentVersionExpirationInDays": 90,
        "Status": "Enabled"
      }
    ]
  }
}
```

### IAM Policy for Backend

**Policy:** `skripsihub-s3-access`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::skripsihub-pdfs-prod/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::skripsihub-pdfs-prod"
    }
  ]
}
```

## Monitoring, Logging & Observability

### Sentry Configuration

**Setup:**
1. Create Sentry project for SkripsiHub
2. Obtain DSN for backend and frontend
3. Initialize Sentry in application startup

**Backend Integration:** `src/main.ts`

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ request: true, serverName: true }),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Frontend Integration:** `src/main.tsx`

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Replay({ maskAllText: true, blockAllMedia: true }),
  ],
});
```

### Application Logging

**Logging Strategy:**
- Use Winston (Node.js) for structured logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Structured JSON format for easy parsing
- Logs sent to stdout (Railway/Vercel captures automatically)

**Logger Configuration:** `src/common/logger.ts`

```typescript
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
```

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|:---|:---|:---|
| API Response Time (p95) | < 300ms | > 500ms |
| Error Rate | < 0.5% | > 1% |
| Database Connection Pool Usage | < 80% | > 90% |
| PDF Generation Time | < 5s | > 10s |
| S3 Upload Success Rate | > 99.5% | < 99% |
| Email Delivery Success Rate | > 98% | < 95% |
| System Uptime | 99.5% | < 99% |

### Alerting

**Sentry Alerts:**
- Critical errors trigger immediate Slack notification
- Performance degradation alerts (response time > 500ms)
- Release health monitoring

**Custom Alerts (via Railway/Vercel):**
- High CPU/memory usage
- Database connection failures
- Deployment failures

## Rollback Procedures

### Frontend Rollback (Vercel)

**Automatic Rollback:**
1. Vercel automatically keeps previous deployments available
2. Navigate to Vercel dashboard → Deployments
3. Click "Promote to Production" on a previous stable deployment
4. Rollback completes in < 1 minute

**Manual Rollback:**
```bash
# Revert to previous commit and push
git revert HEAD
git push origin main
```

### Backend Rollback (Railway)

**Automatic Rollback:**
1. Railway maintains deployment history
2. Navigate to Railway dashboard → Deployments
3. Select previous stable deployment
4. Click "Redeploy"
5. Rollback completes in 2-5 minutes

**Manual Rollback:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or manually trigger deployment of specific commit
railway up --service backend --commit <commit-hash>
```

### Database Rollback

**Schema Rollback:**
```bash
# Revert last migration
npm run typeorm migration:revert -- -d src/database/data-source.ts
```

**Data Rollback:**
1. Restore from automated backup (see Database Backup Strategy)
2. Verify data integrity before promoting to production
3. Document reason for rollback in incident log

**Rollback Checklist:**
- [ ] Identify root cause of issue
- [ ] Notify stakeholders (admins, users if applicable)
- [ ] Execute rollback (frontend/backend/database as needed)
- [ ] Verify system functionality post-rollback
- [ ] Monitor error rates and performance metrics
- [ ] Document incident and resolution in runbook

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration)
- [ ] Code review approved
- [ ] Security audit completed (npm audit)
- [ ] Database migrations tested in staging
- [ ] Environment variables configured in target environment
- [ ] Backup of current production database created
- [ ] Rollback plan documented and tested
- [ ] Stakeholders notified of deployment window

### Deployment

- [ ] Merge to appropriate branch (`staging` or `main`)
- [ ] Monitor CI/CD pipeline execution
- [ ] Verify deployment completion in Vercel and Railway dashboards
- [ ] Run smoke tests against deployed environment
- [ ] Verify database migrations applied successfully
- [ ] Check Sentry for new errors post-deployment

### Post-Deployment

- [ ] Monitor error rates and performance metrics for 1 hour
- [ ] Verify key user workflows (student submission, admin review, validator approval)
- [ ] Check email notifications are being sent
- [ ] Verify PDF generation and S3 uploads working
- [ ] Confirm no data loss or corruption
- [ ] Document deployment details in changelog
- [ ] Notify stakeholders of successful deployment

## Scaling & Performance Optimization

### Horizontal Scaling

**Backend Auto-Scaling (Railway):**
- CPU threshold: Scale up at > 70%, scale down at < 30%
- Memory threshold: Scale up at > 80%, scale down at < 40%
- Min replicas: 2 (production)
- Max replicas: 5

**Database Connection Pooling:**
- Pool size: 20 connections (production)
- Max idle time: 30 seconds
- Connection timeout: 10 seconds

### Caching Strategy

**Redis Caching (Optional for future optimization):**
- Cache user sessions (TTL: 24 hours)
- Cache validator availability list (TTL: 1 hour)
- Cache submission status counts (TTL: 5 minutes)

### CDN & Static Asset Optimization

**Vercel CDN:**
- Automatically caches static assets (JS, CSS, images)
- Cache-Control headers set to 1 year for versioned assets
- Automatic compression (gzip, brotli)

## Security in Deployment

### Secrets Management

**Environment Variables (Railway/Vercel):**
- Never commit secrets to repository
- Use `.env.example` with placeholder values
- Rotate secrets quarterly
- Use separate credentials for each environment

**Secrets Rotation:**
- JWT_SECRET: Quarterly
- Database password: Quarterly
- AWS credentials: Quarterly
- SendGrid API key: Annually or on compromise

### SSL/TLS Configuration

- Vercel: Auto-managed SSL certificates (Let's Encrypt)
- Railway: Auto-managed SSL certificates
- Minimum TLS version: 1.2
- HSTS header enabled (max-age: 31536000)

### Network Security

- Backend API only accessible from Vercel frontend (IP whitelisting if available)
- Database only accessible from backend service
- S3 bucket access restricted via IAM policy
- No public SSH access to production servers

## Disaster Recovery Plan

### Recovery Time Objective (RTO)

- **Frontend:** < 5 minutes (Vercel rollback)
- **Backend:** < 10 minutes (Railway rollback)
- **Database:** < 30 minutes (restore from backup)

### Recovery Point Objective (RPO)

- **Database:** < 1 hour (daily automated backups)
- **Application code:** < 1 minute (Git history)
- **Generated PDFs:** < 1 hour (S3 versioning)

### Disaster Recovery Runbook

**Scenario: Complete Database Failure**
1. Alert on-call engineer
2. Identify latest clean backup
3. Provision new database instance
4. Restore from backup
5. Verify data integrity
6. Update DATABASE_URL in Railway
7. Redeploy backend service
8. Run smoke tests
9. Notify stakeholders

**Scenario: Backend Service Crash**
1. Alert on-call engineer
2. Check Sentry for error details
3. Attempt automatic restart (Railway auto-restart enabled)
4. If restart fails, rollback to previous deployment
5. Investigate root cause
6. Deploy fix and redeploy

**Scenario: Frontend Deployment Failure**
1. Vercel automatically rolls back to previous deployment
2. Check build logs for error details
3. Fix issue locally
4. Redeploy

## Deployment Documentation & Runbooks

### Key Runbooks

1. **Deployment Runbook:** Step-by-step guide for deploying to staging/production
2. **Incident Response Runbook:** Procedures for common incidents (database failure, API errors, etc.)
3. **Rollback Runbook:** Detailed rollback procedures for each component
4. **Scaling Runbook:** Manual scaling procedures if auto-scaling fails
5. **Backup & Restore Runbook:** Database backup and restore procedures

### Documentation Location

- Runbooks: `/docs/runbooks/`
- Deployment guide: `/docs/DEPLOYMENT_GUIDE.md`
- Architecture diagrams: `/docs/architecture/`
- Incident log: Shared team wiki or Notion

## Compliance & Audit Trail

### Deployment Audit Trail

- All deployments logged with timestamp, deployer, and commit hash
- GitHub Actions workflow logs retained for 90 days
- Sentry release tracking for version management
- Database migration history maintained in version control

### Change Management

- All changes to production require code review and approval
- Deployment window: Business hours (08:00-18:00 local time) for critical changes
- Emergency deployments allowed outside window with incident documentation
- Post-deployment review within 24 hours

---

**Last Updated:** [Current Date]  
**Maintained By:** DevOps / Infrastructure Team  
**Next Review:** Quarterly