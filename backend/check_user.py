from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
import sys


def show_user(db):
    user = db.query(User).filter(User.email == 'admin@test.com').first()
    if not user:
        print('NO_USER')
    else:
        print('EMAIL:', user.email)
        print('FULL_NAME:', user.full_name)
        print('ROLE:', user.role)
        print('IS_ACTIVE:', user.is_active)
        print('HASH:', user.hashed_password)
        print('CREATED_AT:', user.created_at)


def reset_password(db, new_password: str = 'admin123'):
    user = db.query(User).filter(User.email == 'admin@test.com').first()
    if not user:
        print('NO_USER')
        return
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    db.commit()
    print('Admin password reset to:', new_password)


if __name__ == '__main__':
    db = SessionLocal()
    if len(sys.argv) > 1 and sys.argv[1] in ('reset', '--reset'):
        reset_password(db)
    else:
        show_user(db)
