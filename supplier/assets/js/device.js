var DeviceAPI = 'http://localhost:3000/device'; // Có thể thêm ?user_id=${user.id} nếu API hỗ trợ
var DeviceTypeAPI = 'http://localhost:3000/device_type';

const token = localStorage.getItem("token");
let user;
try {
    user = JSON.parse(localStorage.getItem("user"));
    console.log("Dữ liệu user từ localStorage:", user);
} catch (e) {
    console.error("Dữ liệu user không hợp lệ:", e);
    user = null;
}   
function start() {
    getData((devices, deviceTypes) => {
        renderDevices(devices, deviceTypes);
        if (document.querySelector("#selectDeviceTypes")) {
            populateDeviceTypes(deviceTypes);
        }
    });
    handleCreateForm();
    if (document.querySelector("#saveDeviceType")) {
        handleCreateDeviceType();
    }
    handleAddDeviceType(); // Thêm xử lý cho nút "+"
}
start();
function getData(callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(DeviceAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API Device: ${res.status}`);
            return res.json();
        }),
        fetch(DeviceTypeAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (!res.ok) throw new Error(`Lỗi API DeviceType: ${res.status}`);
            return res.json();
        })
    ])
    .then(([devices, deviceTypes]) => {
        callback(devices, deviceTypes);
    })
    .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

function renderDevices(devices, deviceTypes) {
    var listDevicesBlock = document.querySelector('#list-device tbody');
    if (!listDevicesBlock) return;

    const userDevices = devices.filter(device => String(device.user_id) === String(user.id));
    if (userDevices.length === 0) {
        console.warn("Không có thiết bị nào thuộc về user hiện tại!");
        listDevicesBlock.innerHTML = '<tr><td colspan="8">Bạn chưa sở hữu thiết bị nào</td></tr>';
        return;
    }

    if ($.fn.DataTable.isDataTable('#list-device')) {
        $('#list-device').DataTable().destroy();
    }

    var htmls = userDevices.map(function (device) {
        var deviceType = deviceTypes.find(dt => String(dt.id) === String(device.device_types_id));
        var deviceTypeName = deviceType ? deviceType.name : "Không xác định";

        return `
            <tr class="list-device-${device.id}">
                <td>${device.name || "Không có tên"}</td>
                <td>${deviceTypeName}</td>
                <td>${device.description || "Không có mô tả"}</td>
                <td>${device.quantity || 0}</td>
                <td>${device.hourly_rental_fee ? device.hourly_rental_fee.toLocaleString() + " VND" : "Không xác định"}</td>
                <td>${device.created_at || "Không xác định"}</td>
                <td>${device.place || "Không xác định"}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item update-btn" data-id="${device.id}">Cập nhật</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listDevicesBlock.innerHTML = htmls.join('');

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

    $('#list-device tbody').off('click').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide();
        dropdown.toggle();
        event.stopPropagation();
    });

    $('#list-device tbody').on('click', '.update-btn', function () {
        let deviceId = $(this).data('id');
        handleUpdateDevice(deviceId);
    });

    $(document).off('click').on('click', function () {
        $('.dropdown-content').hide();
    });
}
//Sự kiện thêm loại thiết bị
function createDeviceType(data, callback) {
    if (!token || !user) {
        console.error("Không tìm thấy token hoặc user, vui lòng đăng nhập lại!");
        return;
    }
    var options = {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    };
    fetch(DeviceTypeAPI, options)
        .then(function (response) {
            return response.json();
        })
        .then(callback)
        .catch(error => console.error("Lỗi khi tạo device type:", error));
}

function populateDeviceTypes(deviceTypes) {
    var select = document.querySelector('#selectDeviceTypes');
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`;

    var deviceList = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
    deviceList.forEach(type => {
        var option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        select.appendChild(option);
    });
}

function handleCreateDeviceType() {
    var createBtn = document.querySelector("#saveDeviceType");

    if (!createBtn) {
        console.warn("Cảnh báo: #saveDeviceType không tồn tại trong DOM.");
        return;
    }

    createBtn.onclick = function () {
        var deviceTypeName = document.querySelector("#newDeviceTypeInput").value;

        if (!deviceTypeName.trim()) {
            alert("Vui lòng nhập loại thiết bị!");
            return;
        }

        var Data = {
            name: deviceTypeName,
            created_at: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString().split("T")[0]
        };

        createDeviceType(Data, function (newDeviceType) {
            getData((devices, deviceTypes) => {
                populateDeviceTypes(deviceTypes);
            });

            var modalElement = document.getElementById("deviceTypeModal");
            if (modalElement) {
                var modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
            }
        });
    };
}

function handleAddDeviceType() {
    document.addEventListener("DOMContentLoaded", function () {
        var modalElement = document.getElementById("deviceTypeModal");
        var modal = new bootstrap.Modal(modalElement);

        document.querySelector("#addDeviceType").addEventListener("click", function () {
            modal.show();
        });

        document.querySelector("#saveDeviceType").addEventListener("click", function () {
            var newDeviceType = document.querySelector("#newDeviceTypeInput").value;
            if (newDeviceType) {
                var select = document.querySelector('select[name="devicetype"]');
                var option = document.createElement("option");
                option.value = newDeviceType.toLowerCase().replace(/\s+/g, "-");
                option.textContent = newDeviceType;
                select.appendChild(option);
                select.value = option.value;

                modal.hide();
            }
        });

        modalElement.addEventListener("hidden.bs.modal", function () {
            document.getElementById("newDeviceTypeInput").value = "";
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            document.body.classList.remove("modal-open");
            document.body.style.overflow = "";
        });
    });
}
//Thêm thiết bị
function handleCreateForm() {
    var createBtn = document.querySelector('#create');
    if (!createBtn) return;

    var editDeviceId = localStorage.getItem("editDeviceId");

    if (editDeviceId) {
        loadEditForm(editDeviceId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        var pictureInput = document.querySelector('input[name="picture"]');
        var name = document.querySelector('input[name="name"]').value;
        var description = document.querySelector('input[name="description"]').value;
        var deviceTypeID = document.querySelector('select[name="devicetype"]').value;
        var price = document.querySelector('input[name="price"]').value;
        var quantity = document.querySelector('input[name="quantity"]').value;
        var location = document.querySelector('input[name="location"]').value;
        var detail = document.querySelector('textarea[name="detail"]').value;

        // Validation
        if (!name || !deviceTypeID || !price || !quantity) {
            alert("Vui lòng nhập đầy đủ tên thiết bị, loại thiết bị, đơn giá và số lượng!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho thiết bị!");
            return;
        }

        // Create object containing device info
        const deviceData = {
            name: name,
            description: description,
            deviceType_id: deviceTypeID,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            location: location,
            detail: detail
        };

        // Create FormData
        const formData = new FormData();

        // Append file with key 'file'
        formData.append('file', pictureInput.files[0]);

        // Append device data as JSON string with key 'device'
        formData.append('device', new Blob([JSON.stringify(deviceData)], {
            type: 'application/json'
        }));

        createDevice(formData, function (deviceResponse) {
            console.log("Device vừa tạo có ID:", deviceResponse.id);
            console.log("Đã tạo thiết bị thành công:", deviceResponse);
            alert("Tạo thiết bị thành công!");
        });
    };
}

function createDevice(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");
  
    fetch(DeviceAPI, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error("Lỗi server");
        return response.json();
      })
      .then(data => {
        callback(data.result || data);
      })
      .catch(error => alert(`Lỗi tạo thiết bị: ${error.message}`));
  }