// index.js

// 1. Hàm dùng chung để lấy và in dữ liệu ra HTML
function loadProducts(apiUrl = "http://127.0.0.1:5000/product/getAllProduct") {
    $.ajax({
        url: apiUrl,
        type: 'GET',
        success: function (data) {
            const container = $('#product-list-api');
            container.empty(); // Xóa dữ liệu cũ trên màn hình

            // Nếu API trả về mảng rỗng (không tìm thấy)
            if (data.length === 0) {
                container.append('<div class="col-12 text-center py-5"><h3>Không tìm thấy sản phẩm nào!</h3></div>');
                return;
            }

            // In dữ liệu ra màn hình
            data.forEach(p => {
                let shortDesc = p.Descript ? p.Descript : "Chưa có mô tả cho sản phẩm này.";
                if (shortDesc.length > 50) shortDesc = shortDesc.substring(0, 50) + "...";
                
                const html = `
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="rounded position-relative fruite-item border border-secondary h-100 d-flex flex-column">
                        <div class="fruite-img">
                            <img src="/static/img/products/${p.ProductImage}" class="img-fluid w-100 rounded-top" style="height:200px; object-fit:cover;" alt="${p.ProductName}">
                        </div>
                        <div class="p-4 flex-grow-1 d-flex flex-column">
                            <h4>${p.ProductName}</h4>
                            <p class="flex-grow-1 text-truncate" style="white-space: normal;">${shortDesc}</p>
                            <div class="d-flex justify-content-between flex-lg-wrap mt-auto">
                                <p class="text-dark fs-5 fw-bold mb-0">${p.Price.toLocaleString('vi-VN')} VND</p>
                                <button onclick="addToCart(${p.ProductID})" class="btn border border-secondary rounded-pill px-3 text-primary">
                                    <i class="fa fa-shopping-bag me-2 text-primary"></i> Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
                container.append(html);
            });
        },
        error: function (err) {
            console.error("Lỗi lấy dữ liệu:", err);
        }
    });
}

// 2. Hàm gọi API Tìm kiếm
function searchProducts() {
    const keyword = $('#search-input').val().trim();
    if (keyword === '') {
        loadProducts(); 
    } else {
        loadProducts(`http://127.0.0.1:5000/product/search?keyword=${encodeURIComponent(keyword)}`);
    }
}

// 3. Hàm gọi API Lọc theo danh mục
function filterCategory(categoryName) {
    if (categoryName === 'All') {
        loadProducts(); 
    } else {
        loadProducts(`http://127.0.0.1:5000/product/category/${encodeURIComponent(categoryName)}`);
    }
}

// 4. Hàm thêm vào giỏ hàng (Chỉ có 1 hàm duy nhất ở đây)
function addToCart(productId) {
    const userId = localStorage.getItem("accountID"); 
    if (!userId) {
        alert("Bạn cần đăng nhập để mua hàng!");
        // Lưu ý: Đổi chữ 'login.html' thành đúng tên trang đăng nhập của bạn nếu khác nhé
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

// 5. Chạy tự động lúc mới vào web
$(document).ready(function () {
    loadProducts();
});
