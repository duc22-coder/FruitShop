function generateQRCode() {

    let rawAmount = $('#total').text()
    
    let realAmount = rawAmount.replace(/[^0-9]/g, ""); 

    let requestData = {
        "accountNo": "4530072005",
        "accountName": "Phùng Tuấn Đạt", 
        "acqId": "970422", 
        "addInfo": "Thanh toan don hang Fruitables",
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
        success: function(response) {
            if(response.code == "00") {
                $('#qr-image').attr('src', response.data.qrDataURL);
                $('#qr-amount').text(rawAmount); // Hiện số tiền gốc cho khách xem
                $('#qr-container').fadeIn();     // Hiện vùng chứa QR
            } else {
                alert("Lỗi tạo mã QR: " + response.desc);
            }
        },
        error: function() {
            alert("Không thể kết nối với máy chủ thanh toán!");
        }
    });
}