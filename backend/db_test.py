import psycopg2
import time

# wait a bit for postgres to be ready
time.sleep(5)  

conn = psycopg2.connect(
    dbname="marketplace_db",
    user="postgres",
    password="postgres",
    host="127.0.0.1",  # host machine connecting to container
    port="5433"
)
print("Connected!")
