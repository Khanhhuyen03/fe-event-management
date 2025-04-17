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
                    role_id: body.user?.role_id // Lưu role_id
                })
            );
            console.log("User info saved to localStorage:", body.user);
        } else {
            console.error("No user data in response");
        }
        // Ánh xạ role_id thành vai trò
        if (user.role_id === "ef09daa2-ee20-4e1f-a662-e0d9fcd6dfbc") {
            redirectUrl = "../admin/index.htm"; // Chuyển hướng đến admin
        } else if (user.role_id === "459fd90e-8f59-4d0d-a644-2b53963acda8") {
            redirectUrl = "../manager/index.html"; // Chuyển hướng đến manager
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
