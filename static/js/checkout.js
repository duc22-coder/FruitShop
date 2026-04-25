document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'shipping') {
        calculateFinalTotal();
    }
});

if (typeof formatVND !== 'function') {
    window.formatVND = function (n) {
        return n.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }).replace('VND', 'VNĐ');
    };
}
let paymentCheckInterval = null;

async function loadCheckoutData() {
    const userId = localStorage.getItem("accountID");
    const container = document.getElementById('checkout-cart-items');
    const subtotalEl = document.getElementById('subtotal');

    if (!container || !userId) return;

    try {
        const res = await fetch(`http://127.0.0.1:5000/cart/getByUserId/${userId}`);
        const cartItems = await res.json();
        let subtotal = 0;

        if (cartItems.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-center">Giỏ hàng trống</td></tr>';
            return;
        }

        container.innerHTML = cartItems.map(item => {
            const itemTotal = item.Price * item.Quantity;
            subtotal += itemTotal;
            return `
                <tr>
                    <th scope="row">
                        <div class="d-flex align-items-center mt-2">
                            <img src="/static/img/products/${item.ProductImage}" class="img-fluid rounded-circle" style="width: 80px; height: 80px; object-fit: cover;">
                        </div>
                    </th>
                    <td class="py-5">${item.ProductName}</td>
                    <td class="py-5">${formatVND(item.Price)}</td>
                    <td class="py-5 text-center">${item.Quantity}</td>
                    <td class="py-5">${formatVND(itemTotal)}</td>
                </tr>`;
        }).join('');
        subtotalEl.innerText = formatVND(subtotal);
        calculateFinalTotal();

    } catch (err) {
        console.error("Lỗi load checkout:", err);
    }
}

function calculateFinalTotal() {
    const subtotalText = document.getElementById('subtotal').innerText;

    const subtotal = parseInt(subtotalText.replace(/\D/g, '')) || 0;

    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    const shippingFee = shippingRadio ? parseInt(shippingRadio.value) : 0;

    let discountAmount = 0;
    const couponData = JSON.parse(localStorage.getItem('appliedCoupon'));
    if (couponData && subtotal > 0) {
        discountAmount = subtotal * (couponData.percent / 100);
        if (discountAmount > couponData.max) {
            discountAmount = couponData.max;
        }
    }

    const finalTotalEl = document.getElementById('final-total');
    if (finalTotalEl) {
        let finalMoney = subtotal - discountAmount + shippingFee;
        if (finalMoney < 0) finalMoney = 0; // Đề phòng lỗi âm tiền
        finalTotalEl.innerText = formatVND(finalMoney);
    }
}
async function autofillUserInfo() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch("http://127.0.0.1:5000/account/getInfor", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            const user = await res.json();
            const fullName = user.name ? user.name.trim() : "";

            if (fullName) {
                // Tách chuỗi bằng khoảng trắng
                const nameParts = fullName.split(' ');

                if (nameParts.length > 1) {
                    // Họ là phần tử đầu tiên
                    const lastName = nameParts[0]; 
                    // Tên là tất cả các phần tử còn lại gộp lại
                    const firstName = nameParts.slice(1).join(' '); 

                    document.getElementById('billing-lastname').value = lastName;
                    document.getElementById('billing-firstname').value = firstName;
                } else {
                    // Trường hợp tên chỉ có 1 chữ
                    document.getElementById('billing-firstname').value = fullName;
                    document.getElementById('billing-lastname').value = "";
                }
            }

            // Điền tiếp các thông tin khác
            if (document.getElementById('billing-address')) {
                document.getElementById('billing-address').value = user.address || "";
            }
            if (document.getElementById('billing-phone')) {
                document.getElementById('billing-phone').value = user.phone || "";
            }
        }
    } catch (err) {
        console.error("Lỗi autofill:", err);
    }
}
document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'shipping') {
        calculateFinalTotal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutData();
    // 2. Tự động điền thông tin cá nhân (Code mới thêm)
    autofillUserInfo();
});

async function placeOrder(){
    const finalTotalText = document.getElementById('final-total').innerText;
    const realAmount = finalTotalText.replace(/\D/g, "");

    try {
        const invoiceID = await addNewInvoice(realAmount);
        generateQRCode(realAmount, invoiceID);
    } catch (error) {
        console.error("addNewInvoice failed:", error);
        alert(error?.error || "Khong tao duoc hoa don.");
    }
}

function addNewInvoice(realAmount){
    const token = localStorage.getItem("token");

    return new Promise((resolve, reject) => {
        let requestData = {
            "AccountID": localStorage.getItem("accountID"),
            "TotalPayment": realAmount,
            "InvoiceState": "Chờ xử lý",
            "CouponID": JSON.parse(localStorage.getItem("appliedCoupon"))?.id
        };

        $.ajax({
            url: "http://127.0.0.1:5000/invoice/addNew",
            method: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            data: JSON.stringify(requestData),
            success: function(res){
                resolve(res.id); // trả về invoiceID
            },
            error: function(e){
                console.log(e);
                reject(e.responseJSON || e.statusText || "Request failed");
            }
        });
    });
}

function generateQRCode(realAmount, invoiceID) {

    if (!realAmount || realAmount === "0") {
        alert("Giỏ hàng trống, không thể tạo mã thanh toán!");
        return;
    }

    let requestData = {
        "accountNo": "4530072005",
        "accountName": "Phùng Tuấn Đạt",
        "acqId": "970422",
        "addInfo": "INV" + invoiceID,
        "amount": realAmount,
        "template": "compact"
    };

    $.ajax({
        url: 'https://api.vietqr.io/v2/generate',
        type: 'POST',
        headers: {
            'x-client-id': 'f8bf2599-d810-4cf6-bb1b-4fe0e3e994a4',
            'x-api-key': 'e2c07de0-971a-4b2e-8d6f-83802e736ea0',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(requestData),
        success: function (response) {
            if (response.code == "00") {
                $('#qr-image').attr('src', response.data.qrDataURL);
                $('#qr-amount').text(formatVND(parseInt(realAmount)));
                $('#qr-container').fadeIn();
                $('html, body').animate({
                    scrollTop: $("#qr-container").offset().top - 100
                }, 500);
                window.currentInvoiceID = invoiceID;
                startPaymentPolling();
            } else {
                alert("Lỗi tạo mã QR: " + response.desc);
            }
        },
        error: function () {
            alert("Không thể kết nối đến server VietQR");
        }
    });
}

function startPaymentPolling() {
    if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
    }

    paymentCheckInterval = setInterval(checkPayment, 3000);
}

function checkPayment(){
    if (!window.currentInvoiceID) {
        if (paymentCheckInterval) {
            clearInterval(paymentCheckInterval);
            paymentCheckInterval = null;
        }
        return;
    }

    fetch(`http://127.0.0.1:5000/invoice/check-payment/${window.currentInvoiceID}`)
    .then(r => r.json())
    .then(res => {
        if(res.paid){
            alert("Thanh toán thành công");
            window.currentInvoiceID = null;
            clearInterval(paymentCheckInterval);
            paymentCheckInterval = null;
            window.location.href = "/templates/index.html";
        }
    })
    .catch(error => {
        console.error("checkPayment failed:", error);
    });
}
