// var userId = localStorage.getItem("userId");
// console.log(userId);
// Lấy userId từ localStorage hoặc nơi khác


function start() {
    getData((users) => {
        renderBigAvatarProfile(users);
        handleInfo(users);
    });

}

start();

// function getData(callback) {
//     fetch(UsersAPI)
//         .then(res => res.json())
//         .then(users => callback(users))
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }


function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // Giải mã phần payload
        console.log("Decoded Token:", payload);
        var userId = payload.userId;  // Lấy userId từ payload
        console.log("User ID:", userId);
    }
    console.log("Token từ localStorage:", token);
    var UserDetailAPI = `http://localhost:8080/event-management/users/${userId}`;
    console.log(UserDetailAPI);
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(UserDetailAPI, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
    ]).then(([users]) => {
        callback(users);
    })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

// Render profile từ thông tin của user đã đăng nhập
function renderBigAvatarProfile(users) {
    var listBigProfile = document.querySelector('#big-profile');
    if (!listBigProfile) return;

    // Lấy thông tin user từ localStorage
    // var storedUser = localStorage.getItem("user");
    // if (!storedUser) {
    //     listBigProfile.innerHTML = "<p>Không tìm thấy thông tin người dùng!</p>";
    //     return;
    // }

    // var user = JSON.parse(storedUser);

    // const user = JSON.parse(localStorage.getItem("user")) || {};
    // console.log("User từ localStorage:", user);

    // Kiểm tra nếu `users` không có dữ liệu
    if (!users) {
        listBigProfile.innerHTML = "<p>Không tìm thấy thông tin người dùng!</p>";
        return;
    }
    console.log("Dữ liệu user:", users); // Kiểm tra dữ liệu đầu vào

    const user = JSON.parse(getData.userId || "{}");


    // Hiển thị thông tin user với vai trò mặc định là "Admin"
    listBigProfile.innerHTML = `

        <img src="${user.avatar}" alt="Profile" class="rounded-circle">
        <h2>${user.last_name} ${user.first_name}</h2>
        <h3>Admin</h3>
        <div class="social-links mt-2">
            <a href="#" class="twitter"><i class="bi bi-twitter"></i></a>
            <a href="#" class="facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" class="instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" class="linkedin"><i class="bi bi-linkedin"></i></a>
        </div>
    `;
}
function handleInfo() {
    var storedUser = localStorage.getItem("user");
    if (!storedUser) {
        console.error("Không tìm thấy thông tin người dùng!");
        return;
    }

    var user = JSON.parse(storedUser);

    // Gán thông tin vào các phần tử có ID tương ứng
    document.getElementById("nameinfo").textContent = `${user.last_name} ${user.first_name}`;
    document.getElementById("roleinfo").textContent = "Admin"; // Vai trò mặc định
    document.getElementById("phoneinfo").textContent = user.phone_number;
    document.getElementById("emailinfo").textContent = user.email;
}

// Gọi `handleInfo()` sau khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", handleInfo);

/////////////////

// document.addEventListener("DOMContentLoaded", async function () {
//     await start();
// });

// async function start() {
//     try {
//         const user = await getUserData();
//         if (user) {
//             localStorage.setItem("user", JSON.stringify(user)); // Lưu user vào localStorage
//             renderBigAvatarProfile(user);
//             handleInfo(user);
//         }
//     } catch (error) {
//         console.error("Lỗi khi khởi động:", error);
//     }
// }

// // Lấy dữ liệu user từ API
// async function getUserData() {
//     const userId = localStorage.getItem("userId");
//     const token = localStorage.getItem("token");

//     if (!userId || !token) {
//         console.error("Không tìm thấy userId hoặc token, vui lòng đăng nhập lại!");
//         window.location.href = "login.html"; // Chuyển hướng đến trang đăng nhập
//         return null;
//     }

//     const UserDetailAPI = `http://localhost:8080/event-management/users/${userId}`;

//     try {
//         const response = await fetch(UserDetailAPI, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         });

//         if (!response.ok) {
//             throw new Error("Không thể lấy thông tin người dùng!");
//         }

//         return await response.json();
//     } catch (error) {
//         console.error("Lỗi khi gọi API:", error);
//         return null;
//     }
// }

// // Render avatar profile
// function renderBigAvatarProfile(user) {
//     const profileContainer = document.getElementById("big-profile");
//     if (!profileContainer) return;

//     profileContainer.innerHTML = `
//         <img src="${user.avatar || 'default-avatar.png'}" alt="Profile" class="rounded-circle">
//         <h2>${user.last_name || ''} ${user.first_name || ''}</h2>
//         <h3>Admin</h3>
//         <div class="social-links mt-2">
//             <a href="#" class="twitter"><i class="bi bi-twitter"></i></a>
//             <a href="#" class="facebook"><i class="bi bi-facebook"></i></a>
//             <a href="#" class="instagram"><i class="bi bi-instagram"></i></a>
//             <a href="#" class="linkedin"><i class="bi bi-linkedin"></i></a>
//         </div>
//     `;
// }

// // Hiển thị thông tin user
// function handleInfo(user) {
//     if (!user) {
//         console.error("Dữ liệu user không hợp lệ!");
//         return;
//     }

//     document.getElementById("nameinfo").textContent = `${user.last_name || ''} ${user.first_name || ''}`;
//     document.getElementById("roleinfo").textContent = "Admin"; // Vai trò mặc định
//     document.getElementById("phoneinfo").textContent = user.phone_number || "Không có dữ liệu";
//     document.getElementById("emailinfo").textContent = user.email || "Không có dữ liệu";
// }
