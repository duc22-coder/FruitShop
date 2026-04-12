import os
from flask import Flask, render_template, jsonify
import pyodbc 
from flask import request # Thêm request vào dòng import ở đầu file
# CHỈNH LẠI DÒNG NÀY: Lấy đúng thư mục hiện tại vì app.py đã ở ngoài gốc rồi
root_dir = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
            template_folder=root_dir, 
            static_folder=root_dir,   
            static_url_path='')      

app.config['JSON_AS_ASCII'] = False
# Cấu hình kết nối SQL Server
def get_db_connection():
    conn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=LAPTOP-C8E5HODE;' 
        'DATABASE=Fruitables;'
        'Trusted_Connection=yes;' # Dùng quyền Windows để đăng nhập
    )
    return conn

@app.route('/')
def index():
    return render_template('index.html')



@app.route('/api/products', methods=['GET'])
def get_products():
    # Lấy tham số 'cat' từ URL (ví dụ: /api/products?cat=Trái cây)
    category = request.args.get('cat')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if category:
        # Nếu có lọc theo danh mục
        query = "SELECT ProductID, Name, Price, Category, Image FROM tblProduct WHERE Category = ?"
        cursor.execute(query, (category,))
    else:
        # Nếu không có (mặc định lấy hết)
        query = "SELECT ProductID, Name, Price, Category, Image FROM tblProduct"
        cursor.execute(query)
    
    rows = cursor.fetchall()
    products = []
    for row in rows:
        products.append({
            "id": row[0], "name": row[1], "price": row[2], 
            "category": row[3], "image": row[4]
        })
    
    conn.close()
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True, port=5000)