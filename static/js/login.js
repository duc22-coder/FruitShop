$("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const username = $("#username").val();
    const password = $("#password").val();

    $.ajax({
        url: "http://127.0.0.1:5000/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            username: username,
            password: password
        }),
        success: function (res) {
            console.log(res)

            if (res.token) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("accountID", res.accountID);
                localStorage.setItem("userName", res.user);
                localStorage.setItem("userRole", res.role);
                window.location.href = "index.html";
            } else {
                alert("Sai tài khoản")
            }
        },
        error: function (err) {
            console.log(err);
            alert("Login failed");
        }
    });
});