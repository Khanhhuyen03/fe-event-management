var UsersAPI = 'http://localhost:3000/user';

function start() {
    getData((users) => {
        renderBigAvatarProfile(users);
        handleInfo(users);
    });

}

start();

function getData(callback) {
    fetch(UsersAPI)
        .then(res => res.json())
        .then(users => callback(users))
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

// Render profile từ thông tin của user đã đăng nhập
function renderBigAvatarProfile(users) {
    var listBigProfile = document.querySelector('#big-profile');
    if (!listBigProfile) return;

    // Lấy thông tin user từ localStorage
    var storedUser = localStorage.getItem("user");
    if (!storedUser) {
        listBigProfile.innerHTML = "<p>Không tìm thấy thông tin người dùng!</p>";
        return;
    }

    var user = JSON.parse(storedUser);

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
