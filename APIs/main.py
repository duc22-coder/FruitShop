import pyodbc
import flask
from flask_cors import CORS

app = flask.Flask(__name__)
CORS(app)

cn_str = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=DATPHUNG;DATABASE=Fruitables;Trusted_Connection=yes'
conn = pyodbc.connect(cn_str)

# account management
@app.route("/login", methods=["POST"])
def login():
    username = flask.request.json.get("username")
    password = flask.request.json.get("password")

    cursor = conn.cursor()
    cursor.execute("select * from tblAccount " \
    "where AccountID = ? and Password = ? ", (username, password))
    
    columns = [column[0] for column in cursor.description]
    results = []

    for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))

    return {"error": "Sai tài khoản"}


@app.route('/cart/getCartByAccount/', methods = ['GET']) 
def deleteKH():     
    try:         
        id = flask.request.json.get("AccountID")         
        cursor = conn.cursor()            
        cursor.execute("select  from " , (id,))        
        conn.commit()         
        resp = flask.jsonify({"mess": "thành công"})        
        resp.status_code = 200       
        return resp     
    except Exception as e:        
        print(e)



@app.route('/api/products', methods=['GET'])
def get_products():

    category = flask.request.args.get('cat')

    cursor = conn.cursor()
    
    if category:
        query = "SELECT ProductID, Name, Price, Category, Image FROM tblProduct WHERE Category = ?"
        cursor.execute(query, (category,))
    else:
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
    resp = flask.jsonify({"mess": "thành công"})        
    resp.status_code = 200       
    return resp     

if __name__ == "__main__":
    app.run(port=5000)