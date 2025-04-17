const API_BASE = 'http://localhost:8080/event-management';
const DeviceAPI = `${API_BASE}/devices`;
const DeviceTypeAPI = `${API_BASE}/deviceType`;
const UsersAPI = `${API_BASE}/users`;
function start(){
    getData((devices, deviceTypes, users) => {
        renderDevices(devices, deviceTypes, users)
        
    });
    
}
start();
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    // if (!token) {
    //     console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
    //     return;
    // }

    Promise.all([
        fetch(`${DeviceAPI}/list`).then(res => res.json()),

        fetch(`${DeviceTypeAPI}/list`).then(res => res.json()),

        fetch(UsersAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
    ])
        .then(([devices, deviceTypes, users]) => {
            devices = devices.data.items;
            deviceTypes = deviceTypes.data.items;
            callback(devices, deviceTypes, users);
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}
//render table data
function renderDevices(devices, deviceTypes, users) {
    var listDevicesBlock = document.querySelector('#list-device tbody');
    if (!listDevicesBlock) return;

    console.log("Devices:", devices);
    console.log("Device Types:", deviceTypes);
    console.log("Users:", users);

    if (!devices || devices.length === 0) {
        console.warn("Danh sách devices rỗng!");
        return;
    }

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-device')) {
        $('#list-device').DataTable().destroy();
    }

    var htmls = devices.map(function (device) {
        // Lấy loại thiết bị
        var deviceType = deviceTypes.find(dt => String(dt.id) === String(device.deviceType_id));
        var deviceTypeName = deviceType ? deviceType.name : "Không xác định";

        // Lấy nhà cung cấp
        var supplier = users.find(user => String(user.id) === String(device.userID));
        var supplierName = supplier ? `${supplier.last_name} ${supplier.first_name} ` : "Không có nhà cung cấp";

        return `
            <tr class="list-device-${device.id}">
                <td>${device.name || "Không có tên"}</td>
                <td>${deviceTypeName}</td>
                <td>${device.description || "Không có mô tả"}</td>
                <td>${device.quantity || 0}</td>
                <td>${device.hourlyRentalFee ? device.hourlyRentalFee.toLocaleString() + " VND" : "Không xác định"}</td>
                <td>${device.created_at ? new Date(device.created_at).toLocaleDateString("en-US", {year: "2-digit", month: "2-digit", day: "2-digit"}) : "Không xác định"}</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${device.id}">Xoá</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listDevicesBlock.innerHTML = htmls.join('');

    if (!listDevicesBlock.innerHTML.trim()) {
        console.warn("Không có dữ liệu để hiển thị.");
        return;
    }

    // Khởi tạo lại DataTables
    var table = $('#list-device').DataTable({
        "order": [[5, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "Hiển thị _MENU_ thiết bị",
            "info": "Hiển thị _START_ đến _END_ của _TOTAL_ thiết bị",
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
    $('#list-device tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện xoá thiết bị
    $('#list-device tbody').on('click', '.delete-btn', function () {
        let deviceId = $(this).data('id');
        handleDeleteDevice(deviceId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}

//Tạo Xoá thiết bị
function handleDeleteDevice(id) {
    var options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },

    };
    fetch(DeviceAPI + '/' + id, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listUser = document.querySelector('.list-device-' + id)
            if (listUser) {
                listUser.remove();
            }
            alert("Xoá thiết bị thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}