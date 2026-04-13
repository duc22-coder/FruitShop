USE Fruitables;
GO

-- 1. Chèn dữ liệu vào tblAccount
INSERT INTO tblAccount
    (AccountID, UserName, Passwd, UserAddress, Phone, AccountRole)
VALUES
    (1, N'Nguyễn Văn An', '123456', N'Hà Nội', '0900000001', 'USER'),
    (2, N'Vũ Minh Hiếu', '123456', N'Hải Phòng', '0900000002', 'USER'),
    (3, N'Hoàng Đức Trọng', '123456', N'Đà Nẵng', '0900000003', 'ADMIN'),
    (4, N'Phùng Tuấn Đạt', '123456', N'TP. Hồ Chí Minh', '0900000004', 'USER'),
    (5, N'Nguyễn Duy Minh', '123456', N'Cần Thơ', '0900000005', 'USER');


INSERT INTO tblProduct
    (ProductID, ProductName, Category, Price, Stock, DueDate, Descript, Discount, ProductImage)
VALUES
    (1, N'Táo Mỹ', N'Trái cây', 50000, 100, '2026-12-31', N'Táo đỏ nhập khẩu, giòn và ngọt', 10, N'/img/products/apple.jpg'),
    (2, N'Chuối', N'Trái cây', 20000, 200, '2026-10-10', N'Chuối chín tự nhiên, không hóa chất', 5, N'/img/products/banana.jpg'),
    (3, N'Cam', N'Trái cây', 30000, 150, '2026-11-15', N'Cam sành mọng nước, nhiều vitamin C', 0, N'/img/products/orange.jpg'),
    (4, N'Cà rốt', N'Rau củ', 25000, 120, '2026-09-20', N'Cà rốt Đà Lạt tươi sạch mỗi ngày', 15, N'/img/products/carrot.jpg'),
    (5, N'Bông cải', N'Rau củ', 40000, 80, '2026-08-30', N'Bông cải xanh giàu chất xơ', 20, N'/img/products/broccoli.jpg');

-- 3. Chèn dữ liệu vào tblInvoice
INSERT INTO tblInvoice
    (InvoiceID, AccountID, TotalPayment, InvoiceState)
VALUES
    (1, 1, 100000, N'Đã thanh toán'),
    (2, 2, 200000, N'Chờ xử lý'),
    (3, 3, 150000, N'Đã thanh toán'),
    (4, 4, 300000, N'Đang giao hàng'),
    (5, 5, 250000, N'Đã thanh toán');

-- 4. Chèn dữ liệu vào tblPayment
INSERT INTO tblPayment
    (PaymentID, InvoiceID, Paying_method, Paying_date)
VALUES
    (1, 1, N'Tiền mặt (COD)', '2026-04-01'),
    (2, 2, N'Chuyển khoản', '2026-04-02'),
    (3, 3, N'Ví MoMo', '2026-04-03'),
    (4, 4, N'Tiền mặt (COD)', '2026-04-04'),
    (5, 5, N'Chuyển khoản', '2026-04-05');

-- 5. Chèn dữ liệu vào tblOrder
INSERT INTO tblOrder
    (OrderID, DeliveryMethod, InvoiceID, OrderAddress, Phone)
VALUES
    (1, N'Giao nhanh 2h', 1, N'Hà Nội', '0900000001'),
    (2, N'Giao tiết kiệm', 2, N'Hải Phòng', '0900000002'),
    (3, N'Giao hỏa tốc', 3, N'Đà Nẵng', '0900000003'),
    (4, N'Giao tiêu chuẩn', 4, N'TP. Hồ Chí Minh', '0900000004'),
    (5, N'Giao nhanh', 5, N'Cần Thơ', '0900000005');

-- 6. Chèn dữ liệu vào tblInvoiceDetail
INSERT INTO tblInvoiceDetail
    (InvoiceDetailID, InvoiceID, ProductID, Quantity)
VALUES
    (1, 1, 1, 2),
    (2, 2, 2, 5),
    (3, 3, 3, 3),
    (4, 4, 4, 4),
    (5, 5, 5, 1);

-- 7. Chèn dữ liệu vào tblCart
INSERT INTO tblCart
    (AccountID, ProductID, Quantity)
VALUES
    (1, 1, 2),
    (2, 2, 3),
    (3, 3, 1),
    (4, 4, 5),
    (5, 5, 2);

select * from tblAccount
select * from tblCart
select * from tblInvoice
select * from tblInvoiceDetail
select * from tblOrder
select * from tblPayment
select * from tblProduct

update tblProduct set ProductImage = '/static/img/products/apple.jpg'