// const token = localStorage.getItem("token");

// if(!token) {
//     window.location.href = "/login";
// }
// 2. Hàm AJAX lấy sản phẩm
// 1. Hàm loadProducts mới: Nhận cả Loại (cat) và Từ khóa (q)
function loadProducts(category = '', searchQuery = '') {
    let url = '/api/products';
    
    // Tạo mảng để chứa các tham số
    let params = [];
    if (category) params.push(`cat=${encodeURIComponent(category)}`);
    if (searchQuery) params.push(`q=${encodeURIComponent(searchQuery)}`);
    
    // Nếu có tham số thì nối vào URL
    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
            const container = $('#product-list-api');
            container.empty();

            if (data.length === 0) {
                container.append('<div class="col-12 text-center py-5"><h3>Không tìm thấy sản phẩm nào!</h3></div>');
                return;
            }

            data.forEach(p => {
                const html = `
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="rounded border border-secondary d-flex flex-column h-100">
                        <div class="fruite-img">
                            <img src="/static/${p.image}" class="img-fluid w-100 rounded-top" style="height:200px; object-fit:cover;">
                        </div>
                        <div class="p-4 d-flex flex-column flex-grow-1">
                            <h4>${p.name}</h4>
                            <div class="d-flex justify-content-between mt-auto">
                                <p class="text-dark fw-bold mb-0">${p.price} VNĐ</p>
                                <a href="#" class="btn border border-secondary rounded-pill text-primary">Mua ngay</a>
                            </div>
                        </div>
                    </div>
                </div>`;
                container.append(html);
            });
        }
    });
}

// 2. PHẢI CÓ HÀM NÀY: Để khi bấm nút "Tìm kiếm", nó lấy chữ trong ô input và gọi hàm load
function searchProducts() {
    const keyword = $('#search-input').val(); // Lấy chữ bạn gõ (ví dụ: "Chuối")
    loadProducts('', keyword); // Gọi hàm load với searchQuery = keyword
}

// 3. Khởi tạo
$(document).ready(function() {
    loadProducts();
});