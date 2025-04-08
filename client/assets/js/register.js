// document.addEventListener("DOMContentLoaded", function () {
//     const registerForm = document.getElementById("registerForm");
//     const verifyForm = document.getElementById("verifyForm");

//     if (registerForm) {
//         registerForm.addEventListener("submit", handleRegister);
//     }
//     if (verifyForm) {
//         verifyForm.addEventListener("submit", handleVerify);
//     }

//     // Thiết lập validation cho các trường (ID khớp với HTML)
//     setupValidation("lastName", "Vui lòng nhập họ!"); // Họ
//     setupValidation("firstName", "Vui lòng nhập tên!"); // Tên
//     setupValidation("email", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ!");
//     setupValidation("phone", "Vui lòng nhập số điện thoại!", /^(03|05|07|08|09)\d{8}$/, "Số điện thoại không hợp lệ!");
//     setupValidation("password", "Vui lòng nhập mật khẩu!");
//     setupValidation("confirmPassword", "Vui lòng nhập lại mật khẩu!");
// });

// // Xử lý form đăng ký
// async function handleRegister(event) {
//     event.preventDefault();

//     // Lấy giá trị từ các trường với ID đúng
//     const ho = getValue("lastName");      // Họ
//     const ten = getValue("firstName");    // Tên
//     const email = getValue("email");
//     const phone = getValue("phone");
//     const password = getValue("password");
//     const confirmPassword = getValue("confirmPassword");

//     // Kiểm tra dữ liệu đầu vào
//     if (!ho) return showAlert("Vui lòng nhập họ!", "danger");
//     if (!ten) return showAlert("Vui lòng nhập tên!", "danger");
//     if (!email) return showAlert("Vui lòng nhập email!", "danger");
//     if (!phone) return showAlert("Vui lòng nhập số điện thoại!", "danger");
//     if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) return showAlert("Số điện thoại không hợp lệ!", "danger");
//     if (!password) return showAlert("Vui lòng nhập mật khẩu!", "danger");
//     if (password !== confirmPassword) return showAlert("Mật khẩu nhập lại không khớp!", "danger");

//     const formData = {
//         first_name: ten,         // Tên
//         last_name: ho,          // Họ
//         email,
//         phone_number: phone,
//         password,
//         role_id: 2,
//         avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//         verified: false
//     };

//     try {
//         const response = await fetch("https://67eabf6734bcedd95f647797.mockapi.io/User", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(formData),
//         });

//         const data = await response.json();
//         if (response.ok) {
//             showAlert("Đã gửi mã xác thực đến email của bạn! (Mã giả lập: 123456)", "success");
//             localStorage.setItem("tempUser", JSON.stringify(data));
//             document.getElementById("registerForm").style.display = "none";
//             document.getElementById("verifyForm").style.display = "block";
//         } else {
//             showAlert(`Đăng ký thất bại: ${data.message || "Lỗi không xác định"}`, "danger");
//         }
//     } catch (error) {
//         showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
//         console.error("Lỗi:", error);
//     }
// }

// // Xử lý form xác thực
// async function handleVerify(event) {
//     event.preventDefault();

//     const verificationCode = getValue("verificationCode");
//     const tempUser = JSON.parse(localStorage.getItem("tempUser"));

//     if (!verificationCode) return showAlert("Vui lòng nhập mã xác thực!", "danger");

//     const mockVerificationCode = "123456";
//     if (verificationCode === mockVerificationCode) {
//         const updatedUser = { ...tempUser, verified: true };

//         try {
//             const response = await fetch(`https://67eabf6734bcedd95f647797.mockapi.io/User/${tempUser.id}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(updatedUser),
//             });

//             if (response.ok) {
//                 const fakeResponse = {
//                     token: "mock-jwt-token-" + Date.now(),
//                     user: updatedUser,
//                 };
//                 showAlert("Đăng ký thành công!", "success");
//                 localStorage.setItem("token", fakeResponse.token);
//                 localStorage.setItem("user", JSON.stringify(fakeResponse.user));
//                 localStorage.removeItem("tempUser");
//                 setTimeout(() => (window.location.href = "login.html"), 2000);
//             } else {
//                 showAlert("Lỗi khi cập nhật trạng thái xác thực!", "danger");
//             }
//         } catch (error) {
//             showAlert("Lỗi kết nối đến máy chủ giả! Vui lòng thử lại.", "danger");
//             console.error("Lỗi:", error);
//         }
//     } else {
//         showAlert("Mã xác thực không đúng! (Mã giả lập: 123456)", "danger");
//     }
// }

// // Hàm toggle password visibility
// function togglePassword(inputId, iconId) {
//     const input = document.getElementById(inputId);
//     const icon = document.getElementById(iconId);
//     if (input.type === "password") {
//         input.type = "text";
//         icon.classList.remove("bi-eye-slash");
//         icon.classList.add("bi-eye");
//     } else {
//         input.type = "password";
//         icon.classList.remove("bi-eye");
//         icon.classList.add("bi-eye-slash");
//     }
// }

// // Hàm tiện ích
// function getValue(id) {
//     const element = document.getElementById(id);
//     return element ? element.value.trim() : "";
// }

// function showAlert(message, type) {
//     const alertBox = document.getElementById("alertBox");
//     if (!alertBox) return;
//     alertBox.textContent = message;
//     alertBox.classList.remove("d-none", "alert-danger", "alert-success");
//     alertBox.classList.add(`alert-${type}`);
//     setTimeout(() => alertBox.classList.add("d-none"), 5000);
// }

// function setupValidation(id, requiredMessage, regex, invalidMessage) {
//     const input = document.getElementById(id);
//     if (!input) return;

//     input.addEventListener("input", function () {
//         if (!input.value.trim()) {
//             input.setCustomValidity(requiredMessage);
//         } else if (regex && !regex.test(input.value.trim())) {
//             input.setCustomValidity(invalidMessage || "Dữ liệu không hợp lệ!");
//         } else {
//             input.setCustomValidity("");
//         }
//     });
// }
// register.js
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const verifyForm = document.getElementById("verifyForm");

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
    if (verifyForm) {
        verifyForm.addEventListener("submit", handleVerify);
    }

    // Thiết lập validation cho các trường
    setupValidation("lastName", "Vui lòng nhập họ!");
    setupValidation("firstName", "Vui lòng nhập tên!");
    setupValidation("email", "Vui lòng nhập email!", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không hợp lệ!");
    setupValidation("phone", "Vui lòng nhập số điện thoại!", /^(03|05|07|08|09)\d{8}$/, "Số điện thoại không hợp lệ!");
    setupValidation("password", "Vui lòng nhập mật khẩu!");
    setupValidation("confirmPassword", "Vui lòng nhập lại mật khẩu!");
});

// Xử lý form đăng ký
async function handleRegister(event) {
    event.preventDefault();

    const ho = getValue("lastName");
    const ten = getValue("firstName");
    const email = getValue("email");
    const phone = getValue("phone");
    const password = getValue("password");
    const confirmPassword = getValue("confirmPassword");

    // Kiểm tra dữ liệu đầu vào
    if (!ho) return showAlert("Vui lòng nhập họ!", "danger");
    if (!ten) return showAlert("Vui lòng nhập tên!", "danger");
    if (!email) return showAlert("Vui lòng nhập email!", "danger");
    if (!phone) return showAlert("Vui lòng nhập số điện thoại!", "danger");
    if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) return showAlert("Số điện thoại không hợp lệ!", "danger");
    if (!password) return showAlert("Vui lòng nhập mật khẩu!", "danger");
    if (password !== confirmPassword) return showAlert("Mật khẩu nhập lại không khớp!", "danger");

    const formData = {
        first_name: ten,
        last_name: ho,
        email,
        phone_number: phone,
        password,
        role_id: 2, // Giả định role_id = 2 cho user thường
        avatar: "https://example.com/default-avatar.jpg", // Avatar mặc định
    };

    try {
        const response = await fetch("https://your-backend-api.com/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            showAlert("Đã gửi mã xác thực đến email của bạn!", "success");
            localStorage.setItem("tempUser", JSON.stringify(data.user));
            document.getElementById("registerForm").style.display = "none";
            document.getElementById("verifyForm").style.display = "block";
        } else {
            showAlert(data.message || "Đăng ký thất bại! Vui lòng thử lại.", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleRegister:", error);
    }
}

// Xử lý form xác thực
async function handleVerify(event) {
    event.preventDefault();

    const verificationCode = getValue("verificationCode");
    const tempUser = JSON.parse(localStorage.getItem("tempUser"));

    if (!verificationCode) return showAlert("Vui lòng nhập mã xác thực!", "danger");
    if (!tempUser) return showAlert("Dữ liệu người dùng tạm thời không tồn tại!", "danger");

    try {
        const response = await fetch("https://your-backend-api.com/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: tempUser.id,
                verificationCode: verificationCode,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showAlert("Đăng ký thành công!", "success");
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.removeItem("tempUser");

            // Cập nhật header nếu cần
            if (typeof window.updateHeader === "function") {
                window.updateHeader();
            }

            setTimeout(() => (window.location.href = "login.html"), 2000);
        } else {
            showAlert(data.message || "Mã xác thực không đúng!", "danger");
        }
    } catch (error) {
        showAlert("Lỗi kết nối đến máy chủ! Vui lòng thử lại.", "danger");
        console.error("Lỗi trong handleVerify:", error);
    }
}

// Hàm toggle password visibility
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    } else {
        input.type = "password";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    }
}

// Hàm tiện ích (giữ nguyên từ utils.js)
function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none", "alert-danger", "alert-success");
    alertBox.classList.add(`alert-${type}`);
    setTimeout(() => alertBox.classList.add("d-none"), 5000);
}

function setupValidation(id, requiredMessage, regex, invalidMessage) {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("input", function () {
        if (!input.value.trim()) {
            input.setCustomValidity(requiredMessage);
        } else if (regex && !regex.test(input.value.trim())) {
            input.setCustomValidity(invalidMessage || "Dữ liệu không hợp lệ!");
        } else {
            input.setCustomValidity("");
        }
    });
}