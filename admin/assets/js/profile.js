
function start() {
    getData((users) => {
        renderBigAvatarProfile(users);
        handleInfo(users);
    });

}

start();

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
    // Kiểm tra nếu `users` không có dữ liệu
    if (!users) {
        listBigProfile.innerHTML = "<p>Không tìm thấy thông tin người dùng!</p>";
        return;
    }
    console.log("Dữ liệu user:", users); // Kiểm tra dữ liệu đầu vào


    // Hiển thị thông tin user với vai trò mặc định là "Admin"
    listBigProfile.innerHTML = `

        <img src="${users.avatar}" alt="Profile" class="rounded-circle">
        <h2>${users.last_name} ${users.first_name}</h2>
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
    var user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        console.error("Không tìm thấy thông tin người dùng!");
        return;
    }

    // Gán thông tin vào các phần tử có ID tương ứng
    document.getElementById("nameinfo").textContent = `${user.last_name} ${user.first_name}`;
    document.getElementById("roleinfo").textContent = "Admin"; // Vai trò mặc định
    document.getElementById("phoneinfo").textContent = user.phone_number;
    document.getElementById("emailinfo").textContent = user.email;
}

// Gọi `handleInfo()` sau khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", handleInfo);
