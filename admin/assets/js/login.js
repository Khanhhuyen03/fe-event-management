// var LoginAPI = 'http://localhost:8080/event-management/auth/login';
// // function login() {
// //     const username = document.getElementById('yourUsername').value;
// //     const password = document.getElementById('yourPassword').value;
// //     getUser(username, password, handleLogin);
// // }
// function getUser(username, password, callback) {
//     fetch(LoginAPI, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//     }).then(function (res) {
//         return res.json().then(callback)
//     });
// }
// function handleLogin(data) {
//     let username = document.getElementById('yourUsername').value;
//     let password = document.getElementById('yourPassword').value;

//     //let user = data.find(user => user.email === username && user.password === password);


//     toastr.options = {
//         positionClass: "toast-top-right",
//         timeOut: 2000,
//         closeButton: true,
//         progressBar: true
//     };

//     if (data.code === 1000) {
//         setToken(data.result?.token);
//         console.log("Token: ", data.result?.token);
//         toastr.success("Đăng nhập thành công!", "Thành công");

//         // Lưu thông tin vào localStorage
//         localStorage.setItem("user", JSON.stringify({
//             id: user.id,
//             email: user.email,
//             last_name: user.last_name,
//             first_name: user.first_name,
//             avatar: user.avatar,
//             phone_number: user.phone_number,
//             password: user.password
//         }));

//         setTimeout(() => {
//             window.location.href = "index.html";
//         }, 2000);
//     } else {
//         toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
//     }
// }
// document.getElementById('login-form').addEventListener('submit', function (event) {
//     event.preventDefault(); // Ngăn chặn reload trang
//     login();
// });

// function login() {
//     let username = document.getElementById('yourUsername').value;
//     let password = document.getElementById('yourPassword').value;

//     fetch('http://localhost:8080/event-management/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: username, password: password })
//     })
//         .then(res => res.json())
//         .then(data => {
//             if (data.token) {
//                 toastr.success("Đăng nhập thành công!", "Thành công");

//                 // Lưu thông tin user vào localStorage
//                 localStorage.setItem("token", data.token);
//                 localStorage.setItem("user", JSON.stringify({
//                     id: data.user.id,
//                     email: data.user.email,
//                     role: data.user.role,
//                     first_name: data.user.first_name,
//                     last_name: data.user.last_name,
//                     avatar: data.user.avatar
//                 }));

//                 setTimeout(() => {
//                     window.location.href = "index.html";
//                 }, 2000);
//             } else {
//                 toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
//             }
//         })
//         .catch(() => toastr.error("Lỗi hệ thống!", "Lỗi"));
// }

///////////////////

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
        const user = data.result;

        // Lưu token
        localStorage.setItem("token", user.token);
        console.log("Token: ", user.token);

        // // Lưu thông tin user vào localStorage
        // localStorage.setItem(
        //     "user",
        //     JSON.stringify({
        //         id: user.id,
        //         email: user.email,
        //         last_name: user.last_name,
        //         first_name: user.first_name,
        //         avatar: user.avatar,
        //         phone_number: user.phone_number,
        //     })
        // );

        // Lưu thông tin user vào localStorage
        if (user) {
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: user.id,
                    email: user.email,
                    last_name: user.last_name,
                    first_name: user.first_name,
                    avatar: user.avatar,
                    phone_number: user.phone_number,
                })
            );
            console.log("User info saved to localStorage:", user);
        } else {
            console.error("No user data in response");
        }

        // Hiển thị thông báo thành công
        toastr.success("Đăng nhập thành công!", "Thành công");


        // if (user && user.id) {
        //     localStorage.setItem(
        //         "user",
        //         JSON.stringify({
        //             id: user.id || "",
        //             email: user.email || "",
        //             last_name: user.last_name || "",
        //             first_name: user.first_name || "",
        //             avatar: user.avatar || "",
        //             phone_number: user.phone_number || "",
        //         })
        //     );
        // } else {
        //     console.error("Lỗi: Không có thông tin user để lưu vào localStorage!", user);
        // }
        console.log("Data từ API:", data);
        console.log("User nhận được:", data.result);


        // Chuyển hướng sau 2 giây
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    } else {
        toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
    }
}

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Ngăn reload trang
    login();
});


///////////////////


// var LoginAPI = "http://localhost:8080/event-management/auth/login";

// document.getElementById("login-form").addEventListener("submit", function (event) {
//     event.preventDefault(); // Ngăn reload trang
//     login();
// });

// function login() {
//     const email = document.getElementById("yourUsername").value.trim();
//     const password = document.getElementById("yourPassword").value.trim();

//     if (!email || !password) {
//         toastr.error("Vui lòng nhập đầy đủ email và mật khẩu!", "Lỗi");
//         return;
//     }

//     fetch(LoginAPI, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//     })
//         .then(res => res.json().then(data => ({ status: res.status, body: data })))
//         .then(({ status, body }) => {
//             console.log("Phản hồi từ server:", status, body);

//             if (status !== 200) {
//                 toastr.error(`Lỗi đăng nhập: ${status}`, "Lỗi");
//                 return;
//             }

//             if (body?.code === 1000 && body?.result) {
//                 handleLogin(body.result);
//             } else {
//                 toastr.error("Sai tài khoản hoặc mật khẩu!", "Lỗi");
//             }
//         })
//         .catch(error => {
//             console.error("Lỗi kết nối đến server:", error);
//             toastr.error("Không thể kết nối đến server!", "Lỗi");
//         });
// }

// function handleLogin(user) {
//     console.log("User từ API:", user);

//     if (!user.id || !user.token) {
//         toastr.error("Dữ liệu đăng nhập không hợp lệ!", "Lỗi");
//         return;
//     }

//     // Lưu token và thông tin user vào localStorage
//     localStorage.setItem("token", user.token);
//     localStorage.setItem("user", JSON.stringify({
//         id: user.id,
//         email: user.email,
//         last_name: user.last_name,
//         first_name: user.first_name,
//         avatar: user.avatar,
//         phone_number: user.phone_number,
//     }));

//     toastr.success("Đăng nhập thành công!", "Thành công");

//     // Chuyển hướng sau 1 giây
//     setTimeout(() => {
//         window.location.href = "index.html";
//     }, 1000);
// }
