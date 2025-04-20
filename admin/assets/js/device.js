var DeviceAPI = 'http://localhost:3000/device';
var DeviceTypeAPI = 'http://localhost:3000/device_type';
var UsersAPI = 'http://localhost:3000/user';
function start() {
    getData((devices, deviceTypes, users) => {
        renderDevices(devices, deviceTypes, users)

    });
    var editDevicetId = localStorage.getItem("editDevicetId");
    if (editDevicetId && window.location.pathname.includes("detail_device.html")) {
        watchDetailDevice(editDevicetId);
    }
}
start();
function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(DeviceAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(DeviceTypeAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(UsersAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),
    ])
        .then(([devices, deviceTypes, users]) => {
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
        var deviceType = deviceTypes.find(dt => String(dt.id) === String(device.device_types_id));
        var deviceTypeName = deviceType ? deviceType.name : "Không xác định";

        // Lấy nhà cung cấp
        var supplier = users.find(user => String(user.id) === String(device.user_id));
        var supplierName = supplier ? `${supplier.last_name} ${supplier.first_name} ` : "Không có nhà cung cấp";

        return `
            <tr class="list-device-${device.id}">
                <td>${device.name || "Không có tên"}</td>
                <td>${deviceTypeName}</td>
                <td>${device.description || "Không có mô tả"}</td>
                <td>${device.quantity || 0}</td>
                <td>${device.hourly_rental_fee ? device.hourly_rental_fee.toLocaleString() + " VND" : "Không xác định"}</td>
                <td>${device.created_at || "Không xác định"}</td>
                <td>${device.place || "ko có địa điểm"}</td>
                <td>${supplierName}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${device.id}">Xoá</button>
                            <button class="dropdown-item detail-btn" data-id="${device.id}">Xem chi tiết</button>
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
     // Xử lý thiết bị xem chi tiết
     $('#list-device tbody').on('click', '.detail-btn', function () {
        let eventId = $(this).data('id');
        handleDetailDevice(eventId);
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
//Xem thiết bị
function handleDetailDevice(eventId) {
    localStorage.setItem("editDevicetId", eventId); // Lưu ID vào localStorage
    window.location.href = "detail_device.html"; // Chuyển đến form cập nhật
}
function watchDetailDevice(editDevicetId) {
    if (!editDevicetId) return;

    const imagePreview = document.getElementById("Image"); // Khớp với id trong HTML
    const defaultImagePath = "assets/img/card.jpg";

    //Lấy token từ localStorage
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại!");
        return;
    }

    // Lấy danh sách loại thiết bị và người dùng
    Promise.all([
        fetch(DeviceTypeAPI, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()),
        fetch(UsersAPI, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
    ])
        .then(([deviceTypes, users]) => {
            // Lấy thông tin thiết bị
            return fetch(`${DeviceAPI}/${editDevicetId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(device => ({ device, deviceTypes, users })); // Trả về cả device, deviceTypes và users
        })
        .then(({ device, deviceTypes, users }) => {
            // Tìm tên loại thiết bị từ deviceTypes dựa trên device.device_types_id
            const deviceType = deviceTypes.find(type => type.id === device.device_types_id);
            const deviceTypeName = deviceType ? deviceType.name : "Không xác định";

            // Tìm nhà cung cấp từ users dựa trên device.user_id
            const supplier = users.find(user => user.id === device.user_id);
            const supplierName = supplier ? `${supplier.last_name} ${supplier.first_name}` : "Không xác định";

            // Cập nhật các thẻ <div> với dữ liệu thiết bị
            document.getElementById("name").textContent = device.name || "Không có tên";
            document.getElementById("devicetype").textContent = deviceTypeName;
            document.getElementById("description").textContent = device.description || "Không có mô tả";
            document.getElementById("quantity").textContent = device.quantity || "0";
            document.getElementById("price").textContent = device.hourly_rental_fee ? `${device.hourly_rental_fee.toLocaleString()} VND` : "Không xác định";
            document.getElementById("place").textContent = device.place || "Không có địa điểm";
            document.getElementById("supplier").textContent = supplierName;

            // Hiển thị ảnh thiết bị
            if (device.img) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = device.img.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    if (imagePreview) {
                        imagePreview.src = imageUrl;
                        imagePreview.onerror = function () {
                            console.error('Lỗi tải ảnh:', imageUrl);
                            this.src = defaultImagePath;
                        };
                    }
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    if (imagePreview) imagePreview.src = defaultImagePath;
                }
            } else {
                if (imagePreview) imagePreview.src = defaultImagePath;
            }
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu thiết bị:", error);
            alert("Không thể tải thông tin thiết bị!");
        });
}