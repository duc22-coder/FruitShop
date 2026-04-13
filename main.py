import secrets
import pyodbc
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CN_STR = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=LAPTOP-C8E5HODE;DATABASE=Fruitables;Trusted_Connection=yes'

def get_db_connection():
    return pyodbc.connect(CN_STR)

# --- ROUTES GIAO DIỆN ---

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/templates/login")
def login_page():
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login():
    # Dùng request trực tiếp vì đã import ở trên
    data = request.get_json(force=True)
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM tblAccount WHERE AccountID = ? AND Password = ?",
        (username, password)
    )

    row = cursor.fetchone()
    conn.close() 

    if not row:
        return jsonify({"error": "Sai tài khoản"}), 401

    token = secrets.token_hex(32)

    return jsonify({
        "message": "login success",
        "token": token,
        "user": row[0]
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    # Lấy tham số 'cat' từ URL
    category = request.args.get('cat')
    search_query = request.args.get('q')

    conn = get_db_connection()
    cursor = conn.cursor()
    
    if search_query:
        query = "SELECT ProductID, Name, Price, Category, Image FROM tblProduct WHERE Name LIKE ?"
        cursor.execute(query, ('%' + search_query + '%',))
    elif category:
        query = "SELECT ProductID, Name, Price, Category, Image FROM tblProduct WHERE Category = ?"
        cursor.execute(query, (category,))
    else:
        query = "SELECT ProductID, Name, Price, Category, Image FROM tblProduct"
        cursor.execute(query)
    
    rows = cursor.fetchall()
    products = [{"id": r[0], "name": r[1], "price": r[2], "category": r[3], "image": r[4]} for r in rows]
    conn.close()
    return jsonify(products)
if __name__ == "__main__":
    app.run(port=5000, debug=True)