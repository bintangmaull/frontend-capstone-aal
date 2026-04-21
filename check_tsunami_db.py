import sqlite3
import os

db_path = "e:/Dashboard/backend-capstone-aal/instance/dashboard.db"
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM tsunami_risk_results")
    count = cur.fetchone()[0]
    print(f"Row count: {count}")
    
    cur.execute("SELECT DISTINCT actual_cv FROM tsunami_risk_results")
    cvs = cur.fetchall()
    print(f"Unique CVs: {cvs}")
    
    cur.execute("SELECT * FROM tsunami_risk_results LIMIT 5")
    rows = cur.fetchall()
    for r in rows:
        print(r)
    conn.close()
