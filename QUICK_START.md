# 🚀 ProjectMarket - Quick Start Guide

Welcome to the ProjectMarket implementation! This is a complete marketplace for project buyers and problem solvers.

## ⚡ Quick Start (30 minutes)

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python init_db.py
uvicorn app.main:app --reload
```

**Backend runs on:** http://localhost:8000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on:** http://localhost:3000

### 3. Configure Environment

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@localhost/marketplace
SECRET_KEY=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_xxx
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
```

## 🎯 What You Get

### For Buyers:
✅ Post projects with categories and budgets
✅ See all applications from solvers (sorted by application time)
✅ Select preferred solver
✅ Create sprints and features in Trello-style dashboard
✅ Release payments via Stripe
✅ Track project progress

### For Problem Solvers:
✅ Browse and search projects by category
✅ Apply to projects (first applicant gets buyer's priority attention)
✅ View dash status on Trello-style dashboard
✅ Update feature statuses as you work
✅ Track earnings and payouts
✅ Get paid instantly via Stripe

## 📊 Database Models

```
User (id, email, role: buyer/problem_solver/admin, ...)
Project (id, title, category, budget, status, buyer_id, ...)
Sprint (id, project_id, title, start_date, end_date, ...)
Feature (id, project_id, sprint_id, title, status, priority, ...)
ProjectRequest (id, project_id, solver_id, status, requested_at) ← Race condition solution
ProjectPayment (id, project_id, solver_id, amount, status, stripe_id, ...)
```

## 🔄 Core Workflow

### Buyer's Path:
1. Register → Dashboard → Create Project → Publish
2. Review Applications (sorted by application time)
3. Accept Solver → Create Sprints & Features
4. Monitor Progress → Release Payment → Complete

### Solver's Path:
1. Register → Marketplace → Browse Projects
2. Apply to Interesting Project (first to apply gets priority)
3. Wait for Acceptance → View Dashboard
4. Update Feature Status → Mark Complete
5. Check Earnings → Request Payout

## 🎨 Key Pages

| Page | Route | User |
|------|-------|------|
| Marketplace | `/marketplace` | All |
| Buyer Dashboard | `/buyer/dashboard` | Buyer |
| Create Project | `/buyer/projects/new` | Buyer |
| Solver Dashboard | `/solver/dashboard` | Solver |
| Earnings | `/solver/payments` | Solver |
| Login | `/auth/login` | All |
| Register | `/auth/register` | All |

## 🔔 Race Condition Handling

**Problem:** Multiple solvers apply to the same project simultaneously

**Solution:** 
- Applications stored with `requested_at` timestamp
- First applicant gets buyer's initial attention
- Buyer can accept/reject in timeline order
- If first solver rejects, next in queue is notified
- Database maintains atomicity with transactions

## 💳 Stripe Integration

1. **Payment Intent** - Create when buyer releases budget
2. **Payment Confirmation** - Verify and record in database
3. **Payout Request** - Solver can request payout to Stripe account
4. **Instant Payout** - Process via Stripe Connect
5. **Transaction Tracking** - Full history in Payments page

## 📚 Full Documentation

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for:
- Complete API endpoints
- Database schema details
- Advanced setup
- Testing procedures
- Future enhancements

## 🧪 Test Stripe Payments

Use Stripe test card: `4242 4242 4242 4242`  
Any future expiry date + any 3-digit CVC

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check port 8000 is free
# Verify PostgreSQL is running
# Check .env file has DATABASE_URL
```

**Frontend build fails:**
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Clear .next cache
rm -rf .next
npm run dev
```

**API connection error:**
- Check `NEXT_PUBLIC_API_URL` in .env.local
- Ensure backend is running on http://localhost:8000
- Check CORS is configured in FastAPI

## 📈 Performance Tips

- Enable Redis for caching (optional)
- Use Celery for async tasks (optional)
- Implement pagination for project listings
- Cache marketplace categories

## 🔐 Security Notes

- JWT tokens stored in localStorage
- Stripe keys never exposed on frontend
- All payments processed through Stripe
- SQL injection prevention via SQLAlchemy ORM
- CORS configured for frontend domain

## 📞 Next Steps

1. ✅ Run both servers
2. ✅ Create test accounts (buyer + solver)
3. ✅ Post a test project
4. ✅ Apply for it with solver account
5. ✅ Accept and manage sprints
6. ✅ Test payment flow with Stripe test card

**Happy building! 🎉**
