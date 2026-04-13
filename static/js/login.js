$("#loginForm").on("submit", function(e){
    e.preventDefault();

    const username = $("#username").val();
    const password = $("#password").val();

    $.ajax({
        url: "/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            username: username,
            password: password
        }),
        success: function(res){
            console.log(res)

            if(res.token){
                localStorage.setItem("token", res.token)
                window.location.href = "/index.html"
            }else{
                alert("Sai tài khoản")
            }
        }
    });
});