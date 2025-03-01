from flask import Flask, request, jsonify, render_template
import sqlite3
from flask_cors import CORS  # Enable cross-origin requests

app = Flask(__name__)
CORS(app)  # Allow frontend requests

DB_NAME = "data.db"

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS qr_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id TEXT UNIQUE NOT NULL,
            qr_code TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Serve frontend
@app.route('/')
def index():
    return render_template('index.html')

# API to fetch all entries
@app.route('/get_entries', methods=['GET'])
def get_entries():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT entry_id, qr_code FROM qr_codes")
    entries = cursor.fetchall()
    conn.close()

    return jsonify([{"entry_id": e[0], "qr_code": e[1]} for e in entries])

# API to add an entry
@app.route('/add_entry', methods=['POST'])
def add_entry():
    try:
        data = request.json
        entry_id = data.get('entry_id')
        qr_code = data.get('qr_code')

        if not entry_id or not qr_code:
            return jsonify({"success": False, "message": "Invalid input"}), 400

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO qr_codes (entry_id, qr_code) VALUES (?, ?)", (entry_id, qr_code))
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Entry added successfully"})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Entry ID already exists"}), 400

# API to delete an entry
@app.route('/delete_entry/<entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM qr_codes WHERE entry_id = ?", (entry_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Entry deleted successfully"})

if __name__ == '__main__':
    app.run(debug=True)
