async function loadCart() {
    const userId = localStorage.getItem("accountID");
    const container = document.getElementById('cart-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    if (!container) return;

    if (!userId) {
        container.innerHTML = '<tr><td colspan="6" class="text-center py-5">Vui lòng đăng nhập!</td></tr>';
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:5000/cart/getByUserId/${userId}`);
        const cartItems = await res.json();
        let subtotal = 0;

        if (cartItems.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="text-center py-5">Giỏ hàng của bạn đang trống.</td></tr>';
            subtotalEl.innerText = formatVND(0);
            totalEl.innerText = formatVND(0);
        } else {
            container.innerHTML = cartItems.map(item => {
                const itemTotal = item.Price * item.Quantity;
                subtotal += itemTotal;

                return `
                    <tr>
                        <th scope="row">
                            <div class="d-flex align-items-center">
                                <img src="/static/img/products/${item.ProductImage}" 
                                    class="img-fluid rounded-circle border" 
                                    style="width: 120px; height: 120px; object-fit: cover;" 
                                    alt="${item.ProductName}">
                            </div>
                        </th>
                        <td><p class="mb-0 mt-4">${item.ProductName}</p></td>
                        <td><p class="mb-0 mt-4">${formatVND(item.Price)}</p></td>
                        <td>
                            <div class="input-group quantity mt-4" style="width: 100px;">
                                <div class="input-group-btn">
                                    <button class="btn btn-sm btn-minus rounded-circle bg-light border" 
                                            onclick="updateQuantity(${item.ProductID}, -1)">
                                        <i class="fa fa-minus"></i>
                                    </button>
                                </div>
                                <input type="text" class="form-control form-control-sm text-center border-0" 
                                       value="${item.Quantity}" readonly style="background: transparent;">
                                <div class="input-group-btn">
                                    <button class="btn btn-sm btn-plus rounded-circle bg-light border" 
                                            onclick="updateQuantity(${item.ProductID}, 1)">
                                        <i class="fa fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </td>
                        <td><p class="mb-0 mt-4">${formatVND(itemTotal)}</p></td>
                        <td>
                            <button class="btn btn-md rounded-circle bg-light border mt-4" 
                                    onclick="removeFromCart(${item.ProductID})">
                                <i class="fa fa-times text-danger"></i>
                            </button>
                        </td>
                    </tr>`;
            }).join('');
        }

        subtotalEl.innerText = formatVND(subtotal);
        let discountAmount = 0;
        const couponData = JSON.parse(localStorage.getItem('appliedCoupon'));

        if (couponData && subtotal > 0) {
            // Tính tiền giảm: (Subtotal * Percent / 100)
            discountAmount = subtotal * (couponData.percent / 100);

            // Giới hạn số tiền giảm (MaxDiscount)
            if (discountAmount > couponData.max) {
                discountAmount = couponData.max;
            }

            // Hiển thị ra màn hình
            document.getElementById('discount-row').style.setProperty('display', 'flex', 'important');
            document.getElementById('cart-discount').innerText = `- ${formatVND(discountAmount)}`;
        } else {
            // Ẩn dòng discount nếu không có mã
            document.getElementById('discount-row').style.setProperty('display', 'none', 'important');
        }

        subtotalEl.innerText = formatVND(subtotal);

        const shipFee = subtotal > 0 ? 30000 : 0; // Thay biến SHIP_FEE của bạn
        const finalTotal = subtotal - discountAmount + shipFee;

        totalEl.innerText = formatVND(finalTotal);
    } catch (err) {
        console.error("Lỗi load giỏ hàng:", err);
    }
}

// HÀM MỚI: Tăng giảm số lượng trực tiếp
async function updateQuantity(productId, change) {
    const userId = localStorage.getItem("accountID");

    try {
        await fetch(`http://127.0.0.1:5000/cart/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                account_id: userId,
                product_id: productId,
                change: change
            })
        });
        loadCart(); // Tải lại để cập nhật số liệu
    } catch (err) {
        console.error("Lỗi cập nhật số lượng:", err);
    }
}

async function removeFromCart(productId) {
    const userId = localStorage.getItem("accountID");
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    await fetch(`http://127.0.0.1:5000/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: userId, product_id: productId })
    });
    loadCart();
}
function saveCartToLocal(cartData) {
    // Lưu danh sách sản phẩm vào localStorage với key là 'cart'
    localStorage.setItem('cart', JSON.stringify(cartData));
}
$('#btn-apply-coupon').on('click', async function () {
    const code = $('#coupon-input').val().trim();
    if (!code) {
        alert("Vui lòng nhập mã giảm giá!");
        return;
    }

    try {
        // Đã thay ${API_BASE} thành link thật để code của bạn chạy độc lập
        const res = await fetch(`http://127.0.0.1:5000/coupon/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error); // Thông báo lỗi (hết hạn, sai mã...)
            return;
        }

        alert(data.message);
        // Lưu thông tin mã vào LocalStorage để mang sang trang Checkout
        localStorage.setItem('appliedCoupon', JSON.stringify({
            id: data.CouponID,
            code: data.CouponCode,
            percent: data.DiscountPercent,
            max: data.MaxDiscount
        }));

        // Load lại giỏ hàng để cập nhật số tiền
        loadCart();

    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối server!");
    }
});

document.addEventListener('DOMContentLoaded', loadCart);