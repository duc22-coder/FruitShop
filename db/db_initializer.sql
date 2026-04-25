USE Fruitables;
GO

DELETE FROM tblCart
DELETE FROM tblInvoiceDetail
DELETE FROM tblOrder
DELETE FROM tblPayment
DELETE FROM tblInvoice
DELETE FROM tblProduct
DELETE FROM tblAccount
DELETE FROM tblToken
DELETE FROM tblCoupon
DELETE FROM tblStore

DBCC CHECKIDENT ('tblAccount', RESEED, 0);
DBCC CHECKIDENT ('tblProduct', RESEED, 0);
DBCC CHECKIDENT ('tblInvoice', RESEED, 0);
DBCC CHECKIDENT ('tblPayment', RESEED, 0);
DBCC CHECKIDENT ('tblOrder', RESEED, 0);
DBCC CHECKIDENT ('tblInvoiceDetail', RESEED, 0);
DBCC CHECKIDENT ('tblCoupon', RESEED, 0);
DBCC CHECKIDENT ('tblStore', RESEED, 0);

-- 1. tblAccount (bỏ AccountID)
INSERT INTO tblAccount
    (UserName, Passwd, UserAddress, Phone, AccountRole, UserEmail)
VALUES
    (N'Nguyễn Văn An', '123456', N'Hà Nội', '0900000001', 'USER', 'nguyenvanan@gmail.com'),
    (N'Vũ Minh Hiếu', '123456', N'Hải Phòng', '0900000002', 'USER', 'vuminhhieu@gmail.com'),
    (N'Hoàng Đức Trọng', '123456', N'Đà Nẵng', '0900000003', 'USER', 'hoangductrong280805@gmail.com'),
    (N'Phùng Tuấn Đạt', '123456', N'TP. Hồ Chí Minh', '0900000004', 'USER', 'phungtuandat@gmail.com'),
    (N'Nguyễn Duy Minh', '123456', N'Cần Thơ', '0900000005', 'USER', 'nguyenduyminh@gmail.com'),
    (N'admin', '123456', 'Kim Lan', '0859376293', 'ADMIN', 'admin@fruitables.com');

-- 2. tblProduct (bỏ ProductID)
INSERT INTO tblProduct
    (ProductName, Category, Price, Stock, DueDate, Descript, Discount, ProductImage)
VALUES
    (N'Táo Mỹ', N'Trái cây', 50000, 100, '2026-12-31', N'Táo đỏ nhập khẩu, giòn và ngọt', 10, N'apple.jpg'),
    (N'Chuối', N'Trái cây', 90000, 200, '2026-10-10', N'Chuối chín tự nhiên, không hóa chất', 5, N'banana.jpg'),
    (N'Cam', N'Trái cây', 10000, 150, '2026-11-15', N'Cam sành mọng nước, nhiều vitamin C', 0, N'orange.jpg'),
    (N'Cà rốt', N'Rau củ', 8000, 120, '2026-09-20', N'Cà rốt Đà Lạt tươi sạch mỗi ngày', 15, N'carrot.jpg'),
    (N'Bông cải', N'Rau củ', 50000, 80, '2026-08-30', N'Bông cải xanh giàu chất xơ', 20, N'broccoli.jpg'),
    (N'Thịt gà chiên', N'Thịt', 40000, 80, '2026-12-31', N'Gà chiên giòn, thơm ngon', 10, N'thitgachien.jpg'),
    (N'Thịt bò xào', N'Thịt', 90000, 70, '2026-12-31', N'Bò xào đậm vị, mềm ngon', 5, N'thitboxao.jpg'),
    (N'Thịt heo quay', N'Thịt', 80000, 60, '2026-12-31', N'Heo quay da giòn, thịt mềm', 15, N'thitheoquay.jpg'),
    (N'Bánh mì sữa', N'Bánh mì', 5000, 120, '2026-12-31', N'Bánh mì mềm, vị ngọt nhẹ', 0, N'banhmisua.jpg'),
    (N'Bánh mì phô mai', N'Bánh mì', 25000, 100, '2026-12-31', N'Bánh mì nhân phô mai béo ngậy', 5, N'banhmiphomai.jpg'),
    (N'Bánh mì gối', N'Bánh mì', 15000, 90, '2026-12-31', N'Bánh mì sandwich mềm mịn', 0, N'banhmigoi.jpg'),
    (N'Bánh mì bơ', N'Bánh mì', 10000, 85, '2026-12-31', N'Bánh mì nướng bơ thơm béo', 10, N'banhmibo.jpg');

-- 3. tblInvoice
INSERT INTO tblInvoice
    (AccountID, TotalPayment, InvoiceState)
VALUES
    (1, 100000, N'Đã thanh toán'),
    (2, 200000, N'Chờ xử lý'),
    (3, 150000, N'Đã thanh toán'),
    (4, 300000, N'Đang giao hàng'),
    (5, 250000, N'Đã thanh toán');

-- 4. tblPayment (bỏ PaymentID)
INSERT INTO tblPayment
    (InvoiceID, Paying_method, Paying_date)
VALUES
    (1, N'Tiền mặt (COD)', '2026-04-01'),
    (2, N'Chuyển khoản', '2026-04-02'),
    (3, N'Ví MoMo', '2026-04-03'),
    (4, N'Tiền mặt (COD)', '2026-04-04'),
    (5, N'Chuyển khoản', '2026-04-05');

-- 5. tblOrder (bỏ OrderID)
INSERT INTO tblOrder
    (DeliveryMethod, InvoiceID, OrderAddress, Phone)
VALUES
    (N'Giao nhanh 2h', 1, N'Hà Nội', '0900000001'),
    (N'Giao tiết kiệm', 2, N'Hải Phòng', '0900000002'),
    (N'Giao hỏa tốc', 3, N'Đà Nẵng', '0900000003'),
    (N'Giao tiêu chuẩn', 4, N'TP. Hồ Chí Minh', '0900000004'),
    (N'Giao nhanh', 5, N'Cần Thơ', '0900000005');

-- 6. tblInvoiceDetail (bỏ InvoiceDetailID)
INSERT INTO tblInvoiceDetail
    (InvoiceID, ProductID, Quantity)
VALUES
    (1, 1, 2),
    (2, 2, 5),
    (3, 3, 3),
    (4, 4, 4),
    (5, 5, 1);


-- 7. tblCart (không có ID nên giữ nguyên)
INSERT INTO tblCart
    (AccountID, ProductID, Quantity)
VALUES
    (1, 1, 2),
    (2, 2, 3),
    (3, 3, 1),
    (4, 4, 5),
    (5, 5, 2);

INSERT INTO tblStore
    (StoreName, StoreAddress)
VALUES
    (N'Fruitable Cầu Giấy', N'số 3 đường Cầu Giấy, Cầu Giấy, Hà Nội'),
    (N'Fruitable Lê Văn Lương', N'27 Đ. Lê Văn Lương, Trung Hoà, Thanh Xuân, Hà Nội'),
    (N'Fruitable Mỹ Đình', N'15 Nguyễn Hoàng, Mỹ Đình, Nam Từ Liêm, Hà Nội'),
    (N'Fruitable Xuân Thủy', N'112 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội'),
    (N'Fruitable Kim Mã', N'298 Kim Mã, Ba Đình, Hà Nội'),
    (N'Fruitable Hai Bà Trưng', N'45 Bà Triệu, Hai Bà Trưng, Hà Nội'),
    (N'Fruitable Hoàng Quốc Việt', N'210 Hoàng Quốc Việt, Cầu Giấy, Hà Nội'),
    (N'Fruitable Linh Đàm', N'12 Nguyễn Hữu Thọ, Hoàng Mai, Hà Nội'),
    (N'Fruitable Hà Đông', N'89 Quang Trung, Hà Đông, Hà Nội'),
    (N'Fruitable Long Biên', N'320 Nguyễn Văn Cừ, Long Biên, Hà Nội');

INSERT INTO tblCoupon
    (CouponCode, DiscountPercent, MaxDiscount, ExpiryDate, UsageLimit)
VALUES
    ('GIAM10', 10, 50000, '2026-12-31', 100),
    -- Giảm 10%, tối đa 50k
    ('GIAM20', 20, 100000, '2026-12-31', 50),
    -- Giảm 20%, tối đa 100k
    ('HETHAN', 50, 200000, '2020-01-01', 10);


SELECT *
FROM tblAccount
SELECT *
FROM tblProduct
SELECT *
FROM tblCart
SELECT *
FROM tblInvoice
SELECT *
FROM tblInvoiceDetail
SELECT *
FROM tblOrder
SELECT *
FROM tblPayment
SELECT *
FROM tblToken
SELECT *
FROM tblStore
SELECT *
FROM tblCoupon