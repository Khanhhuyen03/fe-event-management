var DeviceAPI = 'http://localhost:3000/device';
var DeviceTypeAPI = 'http://localhost:3000/device_type';
var UsersAPI ='http://localhost:3000/user';
function start(){
    getData((devices, deviceTypes, users) => {
        renderDevices(devices, deviceTypes, users)
        
    });
    
}
start();
function getData(callback) {
    Promise.all([
        fetch(DeviceAPI).then(res => res.json()),
        fetch(DeviceTypeAPI).then(res => res.json()),
        fetch(UsersAPI).then(res => res.json()),
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