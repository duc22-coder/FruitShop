const API_BASE = "http://127.0.0.1:5000";

// Biến trạng thái (State)
let originalProductList = []; // Dữ liệu gốc từ API (theo category hoặc search)
let currentProductList = [];  // Dữ liệu sau khi đã lọc giá và sort
let currentPage = 1;
const itemsPerPage = 6;

let currentMaxPrice = 90000;
let currentSort = "default";



// ================== RENDER LOGIC ==================
function renderProducts() {
    const container = document.getElementById('product-container');
    if (!container) return;

    if (!currentProductList || currentProductList.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4 class="text-muted">Không tìm thấy sản phẩm nào khớp với bộ lọc</h4>
            </div>`;
        renderPagination(0);
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = currentProductList.slice(start, start + itemsPerPage);

    container.innerHTML = paginatedItems.map(p => `
        <div class="col-md-6 col-lg-6 col-xl-4 mb-4">
            <div class="rounded position-relative fruite-item border border-secondary h-100 d-flex flex-column shadow-sm">
                <div class="fruite-img">
                    <img src="/static/img/products/${p.ProductImage || 'default.jpg'}"
                        class="img-fluid w-100 rounded-top"
                        style="height:250px; object-fit:cover;" alt="${p.ProductName}">
                </div>
                <div class="p-4 flex-grow-1 d-flex flex-column">
                    <h4 class="text-primary">${p.ProductName}</h4>
                    <p class="flex-grow-1 text-muted text-truncate" style="max-height: 50px;">
                        ${p.Descript || 'Trái cây sạch, tươi ngon mỗi ngày...'}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <p class="text-dark fs-5 fw-bold mb-0">${formatVND(p.Price)}</p>
                        <button onclick="addToCart(${p.ProductID})"
                            class="btn border border-secondary rounded-pill px-3 text-primary">
                            <i class="fa fa-shopping-bag me-2"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    renderPagination(currentProductList.length);
}

function renderPagination(totalItems) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<a href="javascript:void(0)" class="rounded ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})">&laquo;</a>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<a href="javascript:void(0)" class="rounded ${i === currentPage ? 'active' : ''}" 
                onclick="changePage(${i})">${i}</a>`;
    }

    html += `<a href="javascript:void(0)" class="rounded ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})">&raquo;</a>`;

    container.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(currentProductList.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProducts();
    window.scrollTo(0, 500);
}

// ================== FILTER & SORT LOGIC ==================
function applyFiltersAndSort() {
    // 1. Lọc theo giá từ danh sách gốc
    let data = originalProductList.filter(p => p.Price <= currentMaxPrice);

    // 2. Sắp xếp dữ liệu đã lọc
    switch (currentSort) {
        case "price-asc":
            data.sort((a, b) => a.Price - b.Price);
            break;
        case "price-desc":
            data.sort((a, b) => b.Price - a.Price);
            break;
        case "name-asc":
            data.sort((a, b) => a.ProductName.localeCompare(b.ProductName));
            break;
        case "name-desc":
            data.sort((a, b) => b.ProductName.localeCompare(a.ProductName));
            break;
        default:
            data.sort((a, b) => a.ProductID - b.ProductID);
    }

    currentProductList = data;
    currentPage = 1; // Luôn về trang 1 khi lọc/sort
    renderProducts();
}

function sortProducts(criteria) {
    currentSort = criteria;
    applyFiltersAndSort();
}

function setupPriceFilter() {
    const range = document.getElementById('rangeInput');
    const output = document.getElementById('amount');
    if (!range || !output) return;

    range.addEventListener('input', (e) => {
        currentMaxPrice = parseInt(e.target.value);
        output.value = currentMaxPrice;
        applyFiltersAndSort();
    });
}

// ================== DATA LOADING ==================
function shopLoadProducts(param = "") {
    let url = (param === "" || param === "All")
        ? `${API_BASE}/product/getAllProduct`
        : (param.startsWith("http") ? param : `${API_BASE}/product/search?keyword=${encodeURIComponent(param)}`);

    // Hiện loader
    document.getElementById('product-container').innerHTML = '<div class="text-center w-100"><div class="spinner-border text-primary"></div></div>';

    fetch(url)
        .then(res => res.json())
        .then(data => {
            originalProductList = data;
            applyFiltersAndSort();
        })
        .catch(err => {
            console.error("Lỗi API:", err);
            document.getElementById('product-container').innerHTML = `<p class="text-danger text-center">Lỗi kết nối server!</p>`;
        });
}

function filterCategory(categoryName) {
    if (categoryName === "All") {
        shopLoadProducts("All");
    } else {
        shopLoadProducts(`${API_BASE}/product/category/${encodeURIComponent(categoryName)}`);
    }
}

function loadCategoryCounts() {
    fetch(`${API_BASE}/product/getAllProduct`)
        .then(res => res.json())
        .then(data => {
            let counts = { all: data.length, rau: 0, fruit: 0, bread: 0, meat: 0 };
            data.forEach(p => {
                if (p.Category === "Rau củ") counts.rau++;
                else if (p.Category === "Trái cây") counts.fruit++;
                else if (p.Category === "Bánh mì") counts.bread++;
                else if (p.Category === "Thịt") counts.meat++;
            });
            document.getElementById("count-all").innerText = `(${counts.all})`;
            document.getElementById("count-rau").innerText = `(${counts.rau})`;
            document.getElementById("count-fruit").innerText = `(${counts.fruit})`;
            document.getElementById("count-bread").innerText = `(${counts.bread})`;
            document.getElementById("count-meat").innerText = `(${counts.meat})`;
        });
}

// ================== SEARCH & CART ==================
function setupSearch() {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');
    if (!input || !btn) return;

    const doSearch = () => shopLoadProducts(input.value.trim());
    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
}

function addToCart(productId) {
    const userId = localStorage.getItem("accountID");
    if (!userId) {
        alert("Vui lòng đăng nhập để mua hàng!");
        window.location.href = "login.html";
        return;
    }
    fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: userId, product_id: productId })
    })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(() => alert("Đã thêm vào giỏ hàng thành công!"))
        .catch(() => alert("Lỗi: Không thể thêm vào giỏ hàng."));
}

// ================== KHỞI TẠO ==================
document.addEventListener('DOMContentLoaded', () => {
    shopLoadProducts();
    setupSearch();
    setupPriceFilter();
    loadCategoryCounts();

    const sortSelect = document.getElementById('fruits');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => sortProducts(e.target.value));
    }
});