from app.core.database import SessionLocal
from app.models.user import User

if __name__ == '__main__':
    db = SessionLocal()
    users = db.query(User).all()
    if not users:
        print('NO_USERS')
    else:
        for u in users:
            print(f"ID: {u.id} | EMAIL: {u.email} | NAME: {u.full_name} | ROLE: {u.role} | ACTIVE: {u.is_active} | hassed_password: {u.hashed_password} | CREATED_AT: {u.created_at}")
    db.close()
