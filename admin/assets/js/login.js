var LoginAPI = 'http://localhost:8080/event-management/auth/login';

function login() {
    const email = document.getElementById("yourUsername").value;
    const password = document.getElementById("yourPassword").value;
    getUser(email, password, handleLogin);
}

function getUser(email, password, callback) {
    fetch(LoginAPI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((res) => res.json())
        .then(callback)
        .catch((error) => {
            console.error("Lỗi kết nối đến server:", error);
            toastr.error("Không thể kết nối đến server!", "Lỗi");
        });
}

function handleLogin(data) {
    toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 2000,
        closeButton: true,
        progressBar: true,
    };

    if (data.code === 1000 && data.result) {
        const body = data.result;

        // Lưu token
        localStorage.setItem("token", body.token);
        console.log("Token: ", body.token);
        if (body) {
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: body.user?.id,
                    email: body.user?.email,
                    last_name: body.user?.last_name,
                    first_name: body.user?.first_name,
                    avatar: body.user?.avatar,
                    phone_number: body.user?.phone_number,
                })
            );
            console.log("User info saved to localStorage:", body.user);
        } else {
            console.error("No user data in response");
        }

        // Hiển thị thông báo thành công
        toastr.success("Đăng nhập thành công!", "Thành công");
        console.log("Data từ API:", data);
        console.log("User nhận được:", data.result);


        // Chuyển hướng sau 2 giây
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    } else {
        toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
    }
}

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Ngăn reload trang
    login();
});
