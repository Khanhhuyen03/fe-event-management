document.addEventListener("DOMContentLoaded", function () {
  fetch("header.html")
    .then(response => {
      if (!response.ok) throw new Error("Không thể tải header.html");
      return response.text();
    })
    .then(data => {
      //   document.getElementById("header").innerHTML = data;
      //   console.log("Header loaded thành công!");

      //   // Tải lại script chính của trang
      //   loadMainScript();

      //   // Chờ header load xong, rồi cập nhật user info
      //   setTimeout(() => {
      //     updateUserInfo();
      //     initSidebarToggle(); // Khởi động lại toggle sidebar
      //   }, 200);
      // })
      const headerElement = document.getElementById("header");
      if (headerElement) {
        headerElement.innerHTML = data;
        console.log("Header loaded thành công!");

        // Tải lại script chính của trang
        loadMainScript();

        // Cập nhật user info ngay sau khi header được render
        updateUserInfo();
        initSidebarToggle(); // Khởi động lại toggle sidebar
      } else {
        console.error("Không tìm thấy phần tử #header trong DOM.");
      }
    })
    .catch(error => console.error("Lỗi tải header:", error));
});

function loadMainScript() {
  let existingScript = document.querySelector("script[src='assets/js/main.js']");
  if (existingScript) {
    existingScript.remove(); // Xóa nếu script đã tồn tại
  }
  let script = document.createElement("script");
  script.src = "assets/js/main.js";
  script.defer = true;
  document.body.appendChild(script);
}
function updateUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("User từ localStorage:", user);

  const loginBtn = document.getElementById("login-btn");
  const userInfo = document.getElementById("user-info");
  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");
  const fullName = document.getElementById("full-name");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    loginBtn?.classList.add("d-none");
    userInfo?.classList.remove("d-none");

    // Cập nhật avatar (kiểm tra nếu có avatar)
    if (userAvatar) {
      userAvatar.setAttribute("src", user.avatar || "assets/img/default-avatar.png");
    }

    // Cập nhật tên hiển thị
    const displayName = `${user.last_name || ""} ${user.first_name || ""}`.trim();
    if (userName) userName.textContent = displayName;
    if (fullName) fullName.textContent = displayName;

    console.log("Tên hiển thị:", displayName);
  } else {
    loginBtn?.classList.remove("d-none");
    userInfo?.classList.add("d-none");
  }

  // Xử lý logout
  logoutBtn?.addEventListener("click", function () {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Xóa cả token
    window.location.reload(); // Load lại trang để cập nhật UI
  });
}

// Gọi khi trang tải xong
document.addEventListener("DOMContentLoaded", updateUserInfo);

function initSidebarToggle() {
  let toggleBtn = document.querySelector(".toggle-sidebar-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      document.body.classList.toggle("sidebar-open");
    });
  }
}
