const fetchProducts = () => {
    const container = document.getElementById('product-container');
    if (!container) return;

    fetch('http://127.0.0.1:5000/product/getAllProduct')
        .then(res => res.json())
        .then(products => {
            container.innerHTML = products.map(product => `
                <div class="col-md-6 col-lg-6 col-xl-4">
                    <div class="rounded position-relative fruite-item border border-secondary h-100 d-flex flex-column">
                        <div class="fruite-img">
                            <img src="/static/img/products/${product.ProductImage}" class="img-fluid w-100 rounded-top" alt="${product.ProductName}">
                        </div>
                        <div class="p-4 flex-grow-1 d-flex flex-column">
                            <h4>${product.ProductName}</h4>
                            <p class="flex-grow-1 text-truncate">${product.Descript || 'Trái cây tươi ngon...'}</p>
                            <div class="d-flex justify-content-between flex-lg-wrap">
                                <p class="text-dark fs-5 fw-bold mb-0">${formatVND(product.Price)}</p>
                                <button onclick="addToCart(${product.ProductID})" class="btn border border-secondary rounded-pill px-3 text-primary">
                                    <i class="fa fa-shopping-bag me-2 text-primary"></i> Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        });
};

function addToCart(productId) {
    const userId = localStorage.getItem("accountID"); // ĐÃ ĐỒNG BỘ
    if (!userId) {
        alert("Bạn cần đăng nhập để mua hàng!");
        window.location.href = "login.html";
        return;
    }

    fetch('http://127.0.0.1:5000/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: userId, product_id: productId })
    })
        .then(res => res.json())
        .then(data => alert("Đã thêm vào giỏ hàng thành công!"))
        .catch(err => alert("Lỗi kết nối server!"));
}

document.addEventListener('DOMContentLoaded', fetchProducts);