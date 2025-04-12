
// login.js
// Thêm sự kiện beforeunload để xóa openContractAfterLogin nếu chưa đăng nhập
window.addEventListener("beforeunload", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        localStorage.removeItem("openContractAfterLogin");
    }
});
// Hàm lấy query parameter từ URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    getUser(email, password, handleLogin);
}

function getUser(email, password, callback) {
    fetch(`http://localhost:8080/event-management/auth/login`, {
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
            window.location.href = "home.html";
        }, 2000);
    } else {
        toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
    }
}

// Hàm xử lý quên mật khẩu
async function handleForgotPassword(event) {
    event.preventDefault();

    const forgotEmail = getValue("forgotEmail");

    if (!forgotEmail) return showAlert("Vui lòng nhập email!", "danger");

    const submitButton = event.target.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Đang gửi...";

    try {
        const response = await fetch("https://your-backend-api.com/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: forgotEmail,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            showAlert("Yêu cầu đã được gửi! Vui lòng kiểm tra email.", "success");
            setTimeout(() => {
                switchForm(false);
            }, 2000);
        } else {
            showAlert(result.message || "Email không tồn tại!", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleForgotPassword:", error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "GỬI YÊU CẦU";
    }
}


// Hàm xử lý đặt lại mật khẩu
async function handleResetPassword(event) {
    event.preventDefault();

    const token = getQueryParam("token");
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const submitButton = event.target.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Đang cập nhật...";

    if (!token) {
        showAlert("Liên kết không hợp lệ! Vui lòng thử lại.", "danger");
        submitButton.disabled = false;
        submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
        return;
    }

    if (!newPassword) {
        showAlert("Vui lòng nhập mật khẩu mới!", "danger");
        submitButton.disabled = false;
        submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert("Mật khẩu xác nhận không khớp!", "danger");
        submitButton.disabled = false;
        submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/event-management/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                newPassword: newPassword,
            }),
        });

        const result = await response.json();

        if (response.ok && result.code === 1000) {
            showAlert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.", "success");
            setTimeout(() => {
                switchForm("login");
                window.history.pushState({}, document.title, "login.html"); // Xóa token khỏi URL
            }, 2000);
        } else {
            showAlert(result.message || "Lỗi khi đặt lại mật khẩu! Vui lòng thử lại.", "danger");
            if (result.message?.includes("token")) {
                setTimeout(() => {
                    switchForm("login");
                    window.history.pushState({}, document.title, "login.html");
                }, 2000);
            }
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleResetPassword:", error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "CẬP NHẬT MẬT KHẨU";
    }
}

// Hàm chuyển đổi giữa form đăng nhập và form quên mật khẩu
// function switchForm(showForgotPassword) {
//     const loginSection = document.getElementById("loginSection");
//     const forgotPasswordSection = document.getElementById("forgotPasswordSection");
//     const formTitle = document.getElementById("formTitle");

//     if (showForgotPassword) {
//         loginSection.style.display = "none";
//         forgotPasswordSection.style.display = "block";
//         formTitle.textContent = "QUÊN MẬT KHẨU";
//     } else {
//         loginSection.style.display = "block";
//         forgotPasswordSection.style.display = "none";
//         formTitle.textContent = "ĐĂNG NHẬP";
//     }
// }
function switchForm(formType) {
    const loginSection = document.getElementById("loginSection");
    const forgotPasswordSection = document.getElementById("forgotPasswordSection");
    const resetPasswordSection = document.getElementById("resetPasswordSection");
    const formTitle = document.getElementById("formTitle");
    const alertBox = document.getElementById("alertBox");

    loginSection.style.display = "none";
    forgotPasswordSection.style.display = "none";
    resetPasswordSection.style.display = "none";
    alertBox.style.display = "none"; // Ẩn thông báo khi chuyển form

    if (formType === "forgotPassword") {
        forgotPasswordSection.style.display = "block";
        formTitle.textContent = "QUÊN MẬT KHẨU";
    } else if (formType === "resetPassword") {
        resetPasswordSection.style.display = "block";
        formTitle.textContent = "ĐẶT LẠI MẬT KHẨU";
    } else {
        loginSection.style.display = "block";
        formTitle.textContent = "ĐĂNG NHẬP";
    }
}



// Gắn sự kiện khi DOM được tải
// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("loginForm");
//     const forgotPasswordForm = document.getElementById("forgotPasswordForm");
//     const forgotPasswordLink = document.getElementById("forgotPasswordLink");
//     const backToLoginLink = document.getElementById("backToLogin");

//     if (loginForm) {
//         loginForm.addEventListener("submit", handleLogin);
//     }

//     if (forgotPasswordForm) {
//         forgotPasswordForm.addEventListener("submit", handleForgotPassword);
//     }

//     if (forgotPasswordLink) {
//         forgotPasswordLink.addEventListener("click", (event) => {
//             event.preventDefault();
//             switchForm(true);
//         });
//     }

//     if (backToLoginLink) {
//         backToLoginLink.addEventListener("click", (event) => {
//             event.preventDefault();
//             switchForm(false);
//         });
//     }

//     setupValidation("email", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ!");
//     setupValidation("password", "Vui lòng nhập mật khẩu!");
//     setupValidation("forgotEmail", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ!");
// });
// document.getElementById("loginForm").addEventListener("submit", function (event) {
//     event.preventDefault(); // Ngăn reload trang
//     login();
// });

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const backToLoginLink = document.getElementById("backToLogin");
    const backToLoginFromReset = document.getElementById("backToLoginFromReset");

    // Kiểm tra token trong URL khi trang tải
    const token = getQueryParam("token");
    if (token) {
        switchForm("resetPassword");
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            login();
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", handleForgotPassword);
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", handleResetPassword);
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (event) => {
            event.preventDefault();
            switchForm("forgotPassword");
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener("click", (event) => {
            event.preventDefault();
            switchForm("login");
        });
    }

    if (backToLoginFromReset) {
        backToLoginFromReset.addEventListener("click", (event) => {
            event.preventDefault();
            switchForm("login");
            window.history.pushState({}, document.title, "login.html"); // Xóa token khỏi URL
        });
    }

    setupValidation("email", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ!");
    setupValidation("password", "Vui lòng nhập mật khẩu!");
    setupValidation("forgotEmail", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ!");
    setupValidation(
        "newPassword",
        "Vui lòng nhập mật khẩu mới!",
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số!"
    );
    setupValidation("confirmPassword", "Vui lòng nhập xác nhận mật khẩu!");
});