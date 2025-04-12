// login.js
async function handleLogin(event) {
    event.preventDefault();

    const email = getValue("email");
    const password = getValue("password");

    if (!email) return showAlert("Vui lòng nhập email!", "danger");
    if (!password) return showAlert("Vui lòng nhập mật khẩu!", "danger");

    try {
        const response = await fetch(`https://67eabf6734bcedd95f647797.mockapi.io/User?email=${email}`);
        const users = await response.json();

        if (users.length > 0 && users[0].password === password) {
            const fakeResponse = {
                token: "mock-jwt-token-" + Date.now(),
                user: {
                    id: users[0].id || "",
                    first_name: users[0].first_name || "Unknown",
                    last_name: users[0].last_name || "User",
                    email: users[0].email || "",
                    phone_number: users[0].phone_number || "",
                    role_id: users[0].role_id || "user",
                    avatar: users[0].avatar || ""
                }
            };
            console.log("Dữ liệu user lưu vào localStorage:", fakeResponse.user); // Debug
            showAlert("Đăng nhập thành công!", "success");
            localStorage.setItem("token", fakeResponse.token);
            localStorage.setItem("user", JSON.stringify(fakeResponse.user));

            // Gọi updateHeader nếu hàm tồn tại
            if (typeof window.updateHeader === "function") {
                window.updateHeader();
            }
            setTimeout(() => (window.location.href = "home.html"), 2000);
        } else {
            showAlert("Email hoặc mật khẩu không đúng!", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ giả! Vui lòng thử lại.", "danger");
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    setupValidation("email", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ!");
    setupValidation("password", "Vui lòng nhập mật khẩu!");
});


///////////////
// login.js
// Thêm sự kiện beforeunload để xóa openContractAfterLogin nếu chưa đăng nhập
// window.addEventListener("beforeunload", function () {
//     const token = localStorage.getItem("token");
//     if (!token) {
//         localStorage.removeItem("openContractAfterLogin");
//     }
// });

// // Hàm xử lý đăng nhập
// async function handleLogin(event) {
//     event.preventDefault();

//     const email = getValue("email");
//     const password = getValue("password");

//     if (!email) return showAlert("Vui lòng nhập email!", "danger");
//     if (!password) return showAlert("Vui lòng nhập mật khẩu!", "danger");

//     try {
//         const response = await fetch("https://your-backend-api.com/login", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 email: email,
//                 password: password,
//             }),
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const result = await response.json();

//         if (result.user && result.user.first_name && result.user.last_name && result.user.avatar) {
//             localStorage.setItem("token", result.token);
//             localStorage.setItem("user", JSON.stringify(result.user));

//             showAlert("Đăng nhập thành công!", "success");

//             if (typeof window.updateHeader === "function") {
//                 window.updateHeader();
//             }

//             const redirectUrl = localStorage.getItem("redirectAfterLogin");
//             const openContractAfterLogin = localStorage.getItem("openContractAfterLogin") === "true";

//             if (openContractAfterLogin && redirectUrl) {
//                 setTimeout(() => {
//                     window.location.href = redirectUrl;
//                 }, 2000);
//             } else if (openContractAfterLogin) {
//                 setTimeout(() => {
//                     window.location.href = "properties.html?category=event";
//                 }, 2000);
//             } else {
//                 setTimeout(() => {
//                     window.location.href = "home.html";
//                 }, 2000);
//             }
//         } else {
//             showAlert("Dữ liệu người dùng không đầy đủ!", "danger");
//         }
//     } catch (error) {
//         showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
//         console.error("Lỗi trong handleLogin:", error);
//     }
// }

// // Hàm xử lý quên mật khẩu
// async function handleForgotPassword(event) {
//     event.preventDefault();

//     const forgotEmail = getValue("forgotEmail");

//     if (!forgotEmail) return showAlert("Vui lòng nhập email!", "danger");

//     const submitButton = event.target.querySelector("button[type='submit']");
//     submitButton.disabled = true;
//     submitButton.textContent = "Đang gửi...";

//     try {
//         const response = await fetch("https://your-backend-api.com/forgot-password", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 email: forgotEmail,
//             }),
//         });

//         const result = await response.json();

//         if (response.ok) {
//             showAlert("Yêu cầu đã được gửi! Vui lòng kiểm tra email.", "success");
//             setTimeout(() => {
//                 switchForm(false);
//             }, 2000);
//         } else {
//             showAlert(result.message || "Email không tồn tại!", "danger");
//         }
//     } catch (error) {
//         showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
//         console.error("Lỗi trong handleForgotPassword:", error);
//     } finally {
//         submitButton.disabled = false;
//         submitButton.textContent = "GỬI YÊU CẦU";
//     }
// }

// // Hàm chuyển đổi giữa form đăng nhập và form quên mật khẩu
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

// // Gắn sự kiện khi DOM được tải
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