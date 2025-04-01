var UserAPI = 'http://localhost:3000/user';//'http://localhost:8080/event-management/users';
var RoleAPI = 'http://localhost:3000/role';
function start() {
    getData((uses, role) => {
        renderUsers(uses, role)

    });

}
start();
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(UserAPI, {
            headers: {
               "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(RoleAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json())

    ]).then(([uses, role]) => {
        callback(uses, role);
    })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

//render table data
function renderUsers(users, roles) {
    var listUsersBlock = document.querySelector('#list-user tbody');
    if (!listUsersBlock) return;

    console.log("Users:", users);
    if (!users || users.length === 0) {
        console.warn("Danh sách users rỗng!");
        return;
    }

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-user')) {
        $('#list-user').DataTable().destroy();
    }

    var htmls = users.map(function (user ) {
        var role = roles.find(r => r.id === user.role_id);
        var roleName = role ? role.name : "Không xác định";
        var status = user.status === 1 ? "Hoạt động" : "Bị khóa";

        return `
            <tr class="list-user-${user.id} " style="max-width: 100px;">
                <td>${user.email}</td>
                <td>${user.last_name}</td>
                <td>${user.first_name}</td>
                <td>${roleName}</td>
                <td>${user.phone_number}</td>
                <td>${user.created_at}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${user.id}">Xoá</button>
                            <button class="dropdown-item update-btn" data-id="${user.id}">Nâng cấp</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listUsersBlock.innerHTML = htmls.join('');

    if (!listUsersBlock.innerHTML.trim()) {
        console.warn("Không có dữ liệu để hiển thị.");
        return;
    }

    // Khởi tạo lại DataTables
    var table = $('#list-user').DataTable({
        "order": [[6, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ người dùng",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ người dùng",
            "infoEmpty": "Không có dữ liệu",
            "zeroRecords": "Không tìm thấy kết quả",
            "paginate": {
                "first": "Đầu",
                "last": "Cuối",
                "next": "Tiếp",
                "previous": "Trước"
            }
        }
    });

    // 🛠 Gán sự kiện dùng delegate để dropdown hoạt động đúng trên mọi trang
    $('#list-user tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xoá người dùng
    $('#list-user tbody').on('click', '.delete-btn', function () {
        let userId = $(this).data('id');
        handleDeleteUser(userId);
    });
     // Xử lý sự kiện nâng cấp 
     $('#list-user tbody').on('click', '.update-btn', function () {
        let userId = $(this).data('id');
        updateUserRole(userId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}

//Tạo Xoá hợp đồng
function handleDeleteUser(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },

    };
    fetch(UserAPI + '/' + id, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listUser = document.querySelector('.list-user-' + id)
            if (listUser) {
                listUser.remove();
            }
            alert("Xoá người dùng thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}
function updateUserRole(userId) {
    const modalElement = document.getElementById("upgradeRoleModal");
    const modal = new bootstrap.Modal(modalElement);
    const roleSelect = document.getElementById("roleSelect");

    // Hiển thị modal ngay lập tức
    modal.show();

    // Lấy danh sách roles
    fetch(RoleAPI, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(roles => {
        roleSelect.innerHTML = roles.map(role => 
            `<option value="${role.id}">${role.name}</option>`
        ).join('');
    })
    .catch(error => console.error("Lỗi khi lấy roles:", error));

    // Xử lý nút Lưu
    document.getElementById("saveRole").onclick = function() {
        const newRoleId = roleSelect.value;
        fetch(`${UserAPI}/${userId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role_id: newRoleId })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Cập nhật thành công", data);
            modal.hide();
            start();
        })
        .catch(error => console.error("Lỗi cập nhật quyền:", error));
    };
}

// Khởi tạo sự kiện
document.addEventListener("DOMContentLoaded", function() {
    // Chỉ gắn sự kiện update-btn một lần
    $('#list-user tbody').off('click', '.update-btn').on('click', '.update-btn', function() {
        const userId = $(this).data('id');
        updateUserRole(userId);
    });
});