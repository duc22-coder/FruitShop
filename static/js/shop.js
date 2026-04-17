const API_BASE = "http://127.0.0.1:5000";


// --- RENDER GIAO DIỆN ---
const renderProducts = (products) => {
    const container = document.getElementById('product-container');
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><h4>Không tìm thấy sản phẩm</h4></div>`;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-6 col-xl-4 mb-4">
            <div class="rounded position-relative fruite-item border border-secondary h-100 d-flex flex-column shadow-sm">
                <div class="fruite-img">
                    <img src="/static/img/products/${product.ProductImage || 'default.jpg'}" 
                         class="img-fluid w-100 rounded-top" 
                         style="height: 250px; object-fit: cover;"
                         alt="${product.ProductName}">
                </div>
                <div class="p-4 flex-grow-1 d-flex flex-column">
                    <h4 class="text-primary">${product.ProductName}</h4>
                    <p class="flex-grow-1 text-muted text-truncate" title="${product.Descript}">
                        ${product.Descript || 'Trái cây sạch, tươi ngon mỗi ngày...'}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <p class="text-dark fs-5 fw-bold mb-0">${formatVND(product.Price)}</p>
                        <button onclick="addToCart(${product.ProductID})"
                                class="btn border border-secondary rounded-pill px-3 text-primary">
                            <i class="fa fa-shopping-bag me-2"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
};

// --- LOGIC TẢI DỮ LIỆU ---
const loadProducts = (keyword = "") => {
    const url = keyword
        ? `${API_BASE}/product/search?keyword=${encodeURIComponent(keyword)}`
        : `${API_BASE}/product/getAllProduct`;

    fetch(url)
        .then(res => res.json())
        .then(data => renderProducts(data))
        .catch(err => {
            console.error("Lỗi API:", err);
            // Hiện thông báo lỗi nhẹ nhàng thay vì alert liên tục
            document.getElementById('product-container').innerHTML = `<p class="text-center text-danger">Lỗi kết nối máy chủ!</p>`;
        });
};

// --- THÊM GIỎ HÀNG ---
function addToCart(productId) {
    const userId = localStorage.getItem("accountID");
    if (!userId) {
        alert("Vui lòng đăng nhập!");
        window.location.href = "login.html";
        return;
    }

    fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: userId, product_id: productId })
    })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(() => alert("✅ Đã thêm vào giỏ hàng!"))
        .catch(() => alert("❌ Không thể thêm vào giỏ hàng!"));
}

// --- KHỞI TẠO VÀ SỰ KIỆN ---
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');

    // 1. Kiểm tra URL (khi chuyển trang từ Index sang Shop)
    const urlParams = new URLSearchParams(window.location.search);
    const keywordFromUrl = urlParams.get('keyword') || "";

    if (input && keywordFromUrl) {
        input.value = keywordFromUrl;
    }

    // 2. Gọi dữ liệu lần đầu
    loadProducts(keywordFromUrl);

    // 3. Xử lý tìm kiếm tại trang
    if (input && btn) {
        const doSearch = () => loadProducts(input.value.trim());

        btn.addEventListener('click', doSearch);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doSearch();
        });

        // Tìm kiếm thời gian thực (Debounce)
        let timer;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(doSearch, 400);
        });
    }
});