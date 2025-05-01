var EventAPI = 'http://localhost:8080/event-management/event';
var EventTypeAPI = 'http://localhost:8080/event-management/event-type';
var CreateEventAPI = 'http://localhost:8080/event-management/event/create-event';
var DeviceAPI = 'http://localhost:8080/event-management/devices/list';
var DeviceTypeAPI = 'http://localhost:8080/event-management/deviceType/list';
var ServiceAPI = 'http://localhost:8080/event-management/services/list';
var UserAPI_MRG = `http://localhost:8080/event-management/users/manager`;
var UsersAPI = 'http://localhost:8080/event-management/users';
// function start() {
//     getData((events, eventTypes, devices, deviceTypes, services, users) => {
//         renderEvents(events, eventTypes);
//         setupDeviceTable(deviceTypes);
//         window.devices = devices;  // Lưu dữ liệu vào biến toàn cục
//         window.deviceTypes = deviceTypes;
//         window.users = users;  // Lưu lại đúng danh sách user
//         window.events = events;
//         window.eventTypes = eventTypes;
//         populateDeviceTypes(deviceTypes);
//         if (document.querySelector("#selectEventTypes")) {
//             populateEventTypes(eventTypes);
//         }
//         if (document.querySelector('select[name="devicetype"]')) {
//             populateDeviceTypes(deviceTypes);
//         }
//     });
//     handleCreateForm();
//     if (document.querySelector("#saveEventType")) {
//         handleCreateEventType();
//     }
//     setupDeviceTable();
//     handleAddEventType(); // Thêm xử lý cho nút "+"
//     var editEventId = localStorage.getItem("editEventId");
// }
function start() {
    document.addEventListener("DOMContentLoaded", () => {
        getData((events, eventTypes, devices, deviceTypes, services, users) => {
            // Lưu dữ liệu vào biến toàn cục
            window.devices = devices;
            window.deviceTypes = deviceTypes;
            window.services = services;
            window.users = users;
            window.events = events;
            window.eventTypes = eventTypes;

            // Log để kiểm tra dữ liệu
            console.log("deviceTypes sau khi chuẩn hóa:", deviceTypes);
            console.log("services sau khi chuẩn hóa:", services);

            // Render events
            renderEvents(events, eventTypes, devices, deviceTypes, services, users);

            // Setup và populate
            setupDeviceTable(deviceTypes);
            setupServiceTable(services); // Thêm setup cho serviceTable

            if (document.querySelector('select[name="devicetype"]')) {
                populateDeviceTypes(deviceTypes);
            } else {
                console.warn("Không tìm thấy select[name='devicetype'] trong DOM khi gọi populateDeviceTypes");
            }

            if (document.querySelector('select[name="servicename"]')) {
                populateService(services); // Populate cho serviceTable
            } else {
                console.warn("Không tìm thấy select[name='servicename'] trong DOM khi gọi populateService");
            }

            if (document.querySelector("#selectEventTypes")) {
                populateEventTypes(eventTypes);
            }
        });
        setupTimelineTable();
        handleCreateForm();
        if (document.querySelector("#saveEventType")) {
            handleCreateEventType();
        }
        handleAddEventType(); // Thêm xử lý cho nút "+"

        var editEventId = localStorage.getItem("editEventId");
        if (editEventId && window.location.pathname.includes("detail_event.html")) {
            watchDetailEvent(editEventId);
        }

        // Gắn sự kiện tính tổng tiền cho dòng ban đầu của deviceTable
        document.querySelectorAll("#deviceTable tbody tr").forEach(row => {
            row.querySelector('input[name="pricedevice"]').addEventListener("input", () => updateTotalPrice(row));
            row.querySelector('input[name="quantitydevice"]').addEventListener("input", () => {
                const quantity = parseInt(row.querySelector('input[name="quantitydevice"]').value);
                const deviceId = row.querySelector('select[name="devicename"]').value;
                const availableQuantity = getAvailableQuantity(deviceId); // Lấy số lượng có sẵn

                if (quantity > availableQuantity) {
                    alert(`Không đủ số lượng thiết bị. Số lượng có sẵn: ${availableQuantity}`);
                    row.querySelector('input[name="quantitydevice"]').value = availableQuantity; // Đặt lại số lượng
                } else {
                    updateTotalPrice(row);
                }
            });
        });

        // Gắn sự kiện tính tổng tiền cho dòng ban đầu của serviceTable
        document.querySelectorAll("#serviceTable tbody tr").forEach(row => {
            row.querySelector('input[name="price"]').addEventListener("input", () => updateServiceTotal(row));
            row.querySelector('input[name="quantity"]').addEventListener("input", () => {
                const quantity = parseInt(row.querySelector('input[name="quantity"]').value);
                const serviceId = row.querySelector('select[name="servicename"]').value;
                const availableQuantity = getAvailableServiceQuantity(serviceId); // Lấy số lượng có sẵn

                if (quantity > availableQuantity) {
                    alert(`Không đủ số lượng dịch vụ. Số lượng có sẵn: ${availableQuantity}`);
                    row.querySelector('input[name="quantity"]').value = availableQuantity; // Đặt lại số lượng
                } else {
                    updateServiceTotal(row);
                }
            });
        });
    });
}
start();
function renderEvents(events, eventTypes) {
    const listEvenstBlock = document.querySelector('#list-event tbody');
    if (!listEvenstBlock) return;

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch('http://localhost:8080/event-management/roles', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        cache: 'no-store'
    })
        .then(response => response.ok ? response.json() : Promise.reject("Không thể tải roles"))
        .then(roles => {
            console.log("Dữ liệu roles từ API:", roles);
            const user = JSON.parse(localStorage.getItem("user")) || {};
            const roleName = user.roleName || "";
            console.log("Role name (renderEvents):", roleName);

            if ($.fn.DataTable.isDataTable('#list-event')) {
                $('#list-event').DataTable().destroy();
            }

            const htmls = events.map(event => {
                const updateButton = roleName === "MANAGER"
                    ? `<button class="dropdown-item update-btn" data-id="${event.id}">Cập nhật</button>`
                    : "";

                return `
                    <tr class="list-event-${event.id}">
                        <td>${event.name}</td>
                        <td>${event.eventTypeName}</td>
                        <td style="width: 40%;">${event.description || "Không có mô tả"}</td>
                        <td>${event.created_at ? new Date(event.created_at).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "Không xác định"}</td>
                        <td class="text-center">
                            <div class="action-dropdown">
                                <button class="btn btn-light action-btn">...</button>
                                <div class="dropdown-content">
                                    <button class="dropdown-item delete-btn" data-id="${event.id}">Xoá</button>
                                    ${updateButton}
                                    <button class="dropdown-item detail-btn" data-id="${event.id}">Xem chi tiết</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            listEvenstBlock.innerHTML = htmls.join('');

            $('#list-event').DataTable({
                order: [[3, "desc"]],
                language: {
                    search: "Tìm kiếm:",
                    lengthMenu: "Hiển thị _MENU_ sự kiện",
                    info: "Hiển thị _START_ đến _END_ của _TOTAL_ sự kiện",
                    infoEmpty: "Không có dữ liệu",
                    zeroRecords: "Không tìm thấy kết quả",
                    paginate: { first: "Đầu", last: "Cuối", next: "Tiếp", previous: "Trước" }
                }
            });

            $('#list-event tbody').on('click', '.action-btn', function (event) {
                const dropdown = $(this).next('.dropdown-content');
                $('.dropdown-content').not(dropdown).hide();
                dropdown.toggle();
                event.stopPropagation();
            });

            $('#list-event tbody').on('click', '.update-btn', function () {
                handleUpdateEvent($(this).data('id'));
            });

            $('#list-event tbody').on('click', '.delete-btn', function () {
                handleDeleteEvent($(this).data('id'));
            });

            $('#list-event tbody').on('click', '.detail-btn', function () {
                handleDetailEvent($(this).data('id'));
            });

            $(document).click(() => $('.dropdown-content').hide());
        })
        .catch(error => {
            console.error("Lỗi tải roles:", error);
            // Hiển thị bảng không có nút "Cập nhật"
            if ($.fn.DataTable.isDataTable('#list-event')) {
                $('#list-event').DataTable().destroy();
            }

            const htmls = events.map(event => {
                return `
                    <tr class="list-event-${event.id}">
                        <td>${event.name}</td>
                        <td>${event.eventTypeName}</td>
                        <td style="width: 40%;">${event.description || "Không có mô tả"}</td>
                        <td>${event.created_at}</td>
                        <td class="text-center">
                            <div class="action-dropdown">
                                <button class="btn btn-light action-btn">...</button>
                                <div class="dropdown-content">
                                    <button class="dropdown-item delete-btn" data-id="${event.id}">Xoá</button>
                                    <button class="dropdown-item detail-btn" data-id="${event.id}">Xem chi tiết</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            listEvenstBlock.innerHTML = htmls.join('');

            $('#list-event').DataTable({
                order: [[3, "desc"]],
                language: {
                    search: "Tìm kiếm:",
                    lengthMenu: "Hiển thị _MENU_ sự kiện",
                    info: "Hiển thị _START_ đến _END_ của _TOTAL_ sự kiện",
                    infoEmpty: "Không có dữ liệu",
                    zeroRecords: "Không tìm thấy kết quả",
                    paginate: { first: "Đầu", last: "Cuối", next: "Tiếp", previous: "Trước" }
                }
            });

            $('#list-event tbody').on('click', '.action-btn', function (event) {
                const dropdown = $(this).next('.dropdown-content');
                $('.dropdown-content').not(dropdown).hide();
                dropdown.toggle();
                event.stopPropagation();
            });

            $('#list-event tbody').on('click', '.delete-btn', function () {
                handleDeleteEvent($(this).data('id'));
            });

            $('#list-event tbody').on('click', '.detail-btn', function () {
                handleDetailEvent($(this).data('id'));
            });

            $(document).click(() => $('.dropdown-content').hide());
        });
}

function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    // Lấy roleName từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const roleName = user?.roleName?.toUpperCase() || "USER";
    console.log("Role name:", roleName);

    // Chọn API dựa trên roleName
    const userApiToFetch = roleName === "MANAGER" ? UserAPI_MRG : UsersAPI;
    console.log("User API được gọi:", userApiToFetch);
    Promise.all([
        fetch(EventAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi EventAPI: ${res.status}`); return res.json(); }),

        fetch(EventTypeAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi EventTypeAPI: ${res.status}`); return res.json(); }),

        fetch(DeviceAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi DeviceAPI: ${res.status}`); return res.json(); }),

        fetch(DeviceTypeAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi DeviceTypeAPI: ${res.status}`); return res.json(); }),

        fetch(ServiceAPI, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi ServiceAPI: ${res.status}`); return res.json(); }),

        fetch(userApiToFetch, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } })
            .then(res => { if (!res.ok) throw new Error(`Lỗi UsersAPI: ${res.status}`); return res.json(); }),
    ])
        .then(([events, eventTypes, devices, deviceTypes, services, users]) => {
            console.log("Dữ liệu từ API:");
            console.log("Events:", events);
            console.log("EventTypes:", eventTypes);
            console.log("Devices:", devices);
            console.log("DeviceTypes:", deviceTypes);
            console.log("Services:", services);
            console.log("Users:", users);

            // Chuẩn hóa dữ liệu
            events = Array.isArray(events) ? events : events.data?.items || [];
            eventTypes = Array.isArray(eventTypes) ? eventTypes : eventTypes.data?.items || [];
            devices = Array.isArray(devices) ? devices : devices.data?.items || [];
            deviceTypes = Array.isArray(deviceTypes) ? deviceTypes : deviceTypes.data?.items || [];
            services = Array.isArray(services) ? services : services.data?.items || [];
            users = Array.isArray(users) ? users : users.data || [];

            callback(events, eventTypes, devices, deviceTypes, services, users);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy dữ liệu: " + error.message);
        });
}
function handleCreateForm() {
    var createBtn = document.querySelector('#create');
    if (!createBtn) return;

    var editEventId = localStorage.getItem("editEventId");

    if (editEventId) {
        loadEditForm(editEventId); // Gọi hàm cập nhật nếu đang chỉnh sửa
        return;
    }

    createBtn.onclick = function (event) {
        event.preventDefault();

        var pictureInput = document.querySelector('input[name="picture"]');
        var name = document.querySelector('input[name="name"]').value;
        var description = document.querySelector('input[name="description"]').value;
        var eventTypeID = document.querySelector('select[name="eventype"]').value;
        var detail = document.querySelector('textarea[name="detail"]').value;

        if (!name || !eventTypeID) {
            alert("Vui lòng nhập đầy đủ tên sự kiện và loại sự kiện!");
            return;
        }

        if (!pictureInput || !pictureInput.files || pictureInput.files.length === 0) {
            alert("Vui lòng chọn ảnh cho sự kiện!");
            return;
        }

        // Tạo object chứa thông tin event
        const eventData = {
            name: name,
            description: description,
            eventType_id: eventTypeID,
            detail: detail,
            event_format: true,
            is_template: false
        };

        // Tạo FormData
        const formData = new FormData();

        // Thêm file với key là 'file'
        formData.append('file', pictureInput.files[0]);

        // Thêm event data dưới dạng JSON string với key là 'event'
        formData.append('event', new Blob([JSON.stringify(eventData)], {
            type: 'application/json'
        }));

        createEvent(formData, function (eventResponse) {
            console.log("Event vừa tạo có ID:", eventResponse.id);
            console.log("Đã tạo sự kiện thành công:", eventResponse);
            alert("Tạo sự kiện thành công!");
        });
    };
}

function createEvent(formData, callback) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập lại!");

    fetch(CreateEventAPI, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Sửa cú pháp string
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi server");
            return response.json();
        })
        .then(data => {
            callback(data.result || data); // Gọi callback mà không kiểm tra code
        })
        .catch(error => alert(`Lỗi tạo sự kiện: ${error.message}`));
}

function createEventType(data, callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
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
    fetch(EventTypeAPI, options)
        .then(function (response) {
            return response.json(); // Trả về dữ liệu JSON
        })
        .then(callback)
        .catch(error => console.error("Lỗi khi tạo event type:", error));
}
document.addEventListener("DOMContentLoaded", function () {
    handleCreateEventType();
});
function populateEventTypes(eventTypes) {
    var select = document.querySelector('#selectEventTypes');
    select.innerHTML = `<option value="">Chọn một tùy chọn</option>`; // Xóa tùy chọn cũ

    // Kiểm tra nếu eventTypes không phải mảng, ta chuyển thành mảng
    var eventList = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    eventList.forEach(type => {
        var option = document.createElement('option');
        option.value = type.id;  // Lưu ID
        option.textContent = type.name; // Hiển thị tên
        select.appendChild(option);
    });
}
function handleCreateEventType() {
    var createBtn = document.querySelector("#saveEventType");

    if (!createBtn) {
        console.warn(" Cảnh báo: #saveEventType không tồn tại trong DOM.");
        return;
    }

    createBtn.onclick = function () {
        var eventTypeName = document.querySelector("#newEventTypeInput").value;

        if (!eventTypeName.trim()) {
            alert("Vui lòng nhập loại sự kiện!");
            return;
        }

        var Data = {
            name: eventTypeName,
            created_at: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString().split("T")[0]
        };

        createEventType(Data, function (newEventType) {
            getData((events, eventTypes) => {
                populateEventTypes(eventTypes);
            });

            var modalElement = document.getElementById("eventTypeModal");
            if (modalElement) {
                var modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
            }
        });
    };
}

//Sự kiện thêm loại sự kiện qua pop up
function handleAddEventType() {
    document.addEventListener("DOMContentLoaded", function () {
        var modalElement = document.getElementById("eventTypeModal");
        var modal = new bootstrap.Modal(modalElement);

        document.querySelector("#addEventType").addEventListener("click", function () {
            modal.show();
        });

        document.querySelector("#saveEventType").addEventListener("click", function () {
            var newEventType = document.querySelector("#newEventTypeInput").value;
            if (newEventType) {
                var select = document.querySelector('select[name="eventype"]');
                var option = document.createElement("option");
                option.value = newEventType.toLowerCase().replace(/\s+/g, "-");
                option.textContent = newEventType;
                select.appendChild(option);
                select.value = option.value;

                modal.hide();
            }
        });

        // Khi modal đóng, đảm bảo xóa backdrop và reset trạng thái
        modalElement.addEventListener("hidden.bs.modal", function () {
            document.getElementById("newEventTypeInput").value = ""; // Reset input
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove()); // Xóa backdrop thừa
            document.body.classList.remove("modal-open"); // Loại bỏ class khóa cuộn trang
            document.body.style.overflow = ""; // Khôi phục cuộn trang
        });
    });
}
document.getElementById("inputImage").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("image").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
//UPDATE
//Cập nhật event
function handleUpdateEvent(eventId) {
    localStorage.setItem("editEventId", eventId); // Lưu ID vào localStorage
    window.location.href = "form-event.html"; // Chuyển đến form cập nhật
}
function loadEditForm(editEventId) {
    if (!editEventId) return;

    console.log("Chỉnh sửa sự kiện ID:", editEventId);
    const inputPicture = document.querySelector('input[name="picture"]');
    const imagePreview = document.getElementById("image");
    const defaultImagePath = "assets/img/card.jpg";

    // Lấy token từ localStorage
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    // Lấy danh sách loại sự kiện (event types)
    fetch(EventTypeAPI, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(eventTypes => {
            // Log để debug
            console.log('Event Types:', eventTypes);

            var selectEventType = document.querySelector('select[name="eventype"]');
            selectEventType.innerHTML = '<option value="">Chọn loại sự kiện</option>';

            if (Array.isArray(eventTypes)) {
                eventTypes.forEach(type => {
                    var option = document.createElement("option");
                    option.value = type.name;
                    option.textContent = type.name;
                    selectEventType.appendChild(option);
                });
            }

            // Lấy thông tin sự kiện
            return fetch(`${EventAPI}/${editEventId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json());
        })
        .then(event => {
            // Log để debug
            console.log('Event Data:', event);

            document.querySelector('input[name="name"]').value = event.name || "";
            document.querySelector('input[name="description"]').value = event.description || "";
            document.querySelector('textarea[name="detail"]').value = event.detail || "";
            document.querySelector('select[name="eventype"]').value = event.eventTypeName || "";

            // Xử lý hiển thị ảnh
            if (event.img) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = event.img.split('/').pop();
                    const imageUrl = `${baseApiUrl}${fileName}`;

                    // Log để debug
                    console.log('Image URL:', imageUrl);

                    // Tạo thẻ img mới
                    const newImg = document.createElement('img');
                    newImg.id = 'image';
                    newImg.style.maxWidth = '500px';
                    newImg.style.height = '400px';
                    newImg.alt = 'Event Preview';

                    // Thay thế ảnh cũ bằng ảnh mới
                    if (imagePreview) {
                        imagePreview.parentNode.replaceChild(newImg, imagePreview);
                    }

                    // Set source cho ảnh mới
                    newImg.src = imageUrl;

                    // Xử lý lỗi load ảnh
                    newImg.onerror = function () {
                        console.error('Lỗi tải ảnh:', imageUrl);
                        this.src = defaultImagePath;
                    };
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error);
                    if (imagePreview) imagePreview.src = defaultImagePath;
                }
            } else {
                if (imagePreview) imagePreview.src = defaultImagePath;
            }

            document.querySelector("#create").textContent = "Cập nhật";
            document.querySelector("#create").onclick = function (event) {
                event.preventDefault();

                const inputPicture = document.querySelector('input[name="picture"]');
                const inputName = document.querySelector('input[name="name"]').value;
                const inputDescription = document.querySelector('input[name="description"]').value;
                const inputEventTypeID = document.querySelector('select[name="eventype"]').value;
                const inputDetail = document.querySelector('textarea[name="detail"]').value;

                if (!inputName || !inputEventTypeID) {
                    alert("Vui lòng nhập đầy đủ tên sự kiện và loại sự kiện!");
                    return;
                }

                const updatedEvent = {
                    name: inputName,
                    description: inputDescription,
                    eventTypeName: inputEventTypeID,
                    detail: inputDetail,
                    event_format: true,
                    is_template: false
                };

                // Tạo FormData
                const formData = new FormData();
                // Thêm file nếu có
                if (inputPicture.files[0]) {
                    formData.append('file', inputPicture.files[0]);
                }
                // Thêm event data dưới dạng JSON string với key là 'event'
                formData.append('event', new Blob([JSON.stringify(updatedEvent)], {
                    type: 'application/json'
                }));

                // Logic của updatedEvent được gộp vào đây
                if (!token) {
                    alert("Vui lòng đăng nhập lại!");
                    return;
                }

                fetch(`${EventAPI}/${editEventId}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                })
                    .then(response => {
                        if (!response.ok) throw new Error("Lỗi server");
                        return response.json();
                    })
                    .then(data => {
                        const eventResponse = data.result || data;
                        console.log("Event vừa cập nhật có ID:", eventResponse.id);
                        console.log("Đã cập nhật sự kiện thành công:", eventResponse);
                        alert("Cập nhật sự kiện thành công!");
                        window.location.href = "table-event.html";
                    })
                    .catch(error => {
                        console.error('Lỗi cập nhật sự kiện:', error);
                        alert(`Lỗi cập nhật sự kiện: ${error.message}`);
                    });
            };
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
        });
}
//Xoá event
function handleDeleteEvent(id) {
    console.log("Xoá sự kiện ID:", id);
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }
    var options = {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },

    };
    fetch(EventAPI + '/' + id, options)
        .then(function (respone) {
            return respone.json();
        })
        .then(function () {
            var listEvent = document.querySelector('.list-event-' + id)
            if (listEvent) {
                listEvent.remove();
            }
            alert("Xoá sự kiện thành công!");
        })
        .catch(function () {
            alert("Xoá không thành công!");
        });

}
//Xem chi tiết
function handleDetailEvent(eventId) {
    localStorage.setItem("editEventId", eventId); // Lưu ID vào localStorage
    window.location.href = "detail_event.html"; // Chuyển đến form cập nhật
}
function watchDetailEvent(editEventId) {
    if (!editEventId) return;

    const imagePreview = document.getElementById("inputImage"); // Khớp với id trong HTML
    const defaultImagePath = "assets/img/card.jpg";

    // Gọi API lấy thông tin sự kiện (không cần token)
    fetch(`${EventAPI}/${editEventId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(event => {
            // Cập nhật các thẻ <div> với dữ liệu sự kiện
            document.getElementById("inputName").textContent = event.name || "";
            document.getElementById("inputDescription").textContent = event.description || "";
            document.getElementById("inputDetail").textContent = event.detail || "";
            document.getElementById("EventTypes").textContent = event.eventTypeName || "";

            // Hiển thị ảnh sự kiện
            if (event.img) {
                try {
                    const baseApiUrl = 'http://localhost:8080/event-management/api/v1/FileUpload/files/';
                    const fileName = event.img.split('/').pop();
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
            console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
            alert("Không thể tải thông tin sự kiện!");
        });
}
//_______________________________device_________________________//
function addDeviceRow(deviceId, quantity, deviceTypeId, price, userId) {
    const tbody = document.querySelector("#deviceTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="form-select w-auto" name="devicetype"></select>
        </td>
        <td>
            <select class="form-select" name="devicename"></select>
        </td>
        <td>
            <select class="form-select" name="namesuplier"></select>
        </td>
        <td><input type="number" class="form-control" name="pricedevice" value="${price || 0}" min="0" step="1000" readonly></td>
        <td><input type="number" class="form-control" value="${quantity}" min="1" name="quantitydevice"></td>
        <td><input type="text" class="form-control" readonly name="totalmoneydevice"></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);

    // Populate danh sách loại thiết bị và chọn giá trị hiện tại
    populateDeviceTypes(window.deviceTypes, newRow);
    const deviceTypeSelect = newRow.querySelector('select[name="devicetype"]');
    deviceTypeSelect.value = deviceTypeId; // Đặt giá trị hiện tại

    // Populate danh sách thiết bị theo loại và chọn giá trị hiện tại
    updateDeviceOptions(deviceTypeId, newRow);
    newRow.querySelector('select[name="devicename"]').value = deviceId;

    // Populate danh sách nhà cung cấp và chọn giá trị hiện tại
    const supplierSelect = newRow.querySelector('select[name="namesuplier"]');
    const user = window.users.find(user => user.id === userId);
    supplierSelect.innerHTML = user
        ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
        : `<option value="">Không xác định</option>`;

    // Tính tổng tiền
    updateTotalPrice(newRow);

    // Gán sự kiện thay đổi
    newRow.querySelector('select[name="devicetype"]').addEventListener("change", function () {
        updateDeviceOptions(this.value, newRow);
    });
    newRow.querySelector('select[name="devicename"]').addEventListener("change", handleDeviceChange);
    newRow.querySelector('input[name="quantitydevice"]').addEventListener("input", () => updateTotalPrice(newRow));
}
//sự kiện thêm dòng tr khi nhân button thêm thiết bị 
function setupDeviceTable(deviceTypes) {
    const addButton = document.querySelector("#buttonAddDevice");
    const tbody = document.querySelector("#deviceTable tbody");

    if (!addButton || !tbody) {
        console.warn("Không tìm thấy #buttonAddDevice hoặc #deviceTable tbody trong DOM");
        return;
    }

    addButton.onclick = function () {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>
                <select class="form-select w-auto" name="devicetype">
                    <option value="">Chọn loại thiết bị</option>
                </select>
            </td>
            <td>
                <select class="form-select" style="width: 150px;" name="devicename">
                    <option value="">Chọn thiết bị</option>
                </select>
            </td>
            <td>
                <select class="form-select" style="width: 170px;" name="namesuplier">
                    <option value="">Chọn tên</option>
                </select>
            </td>
            <td><input type="number" class="form-control" name="pricedevice" min="0" step="1000" readonly></td>
            <td><input type="number" class="form-control" value="1" min="1" name="quantitydevice"></td>
            <td><input type="text" class="form-control" readonly name="totalmoneydevice"></td>
            <td class="text-center">
                <button class="btn btn-outline-danger remove-row">🗑</button>
            </td>
        `;

        tbody.appendChild(newRow);

        // Cập nhật danh sách loại thiết bị
        populateDeviceTypes(deviceTypes, newRow);

        // Gán sự kiện cập nhật tổng tiền cho dòng mới
        newRow.querySelector('input[name="pricedevice"]').addEventListener("input", () => updateTotalPrice(newRow));
        newRow.querySelector('input[name="quantitydevice"]').addEventListener("input", () => {
            const quantity = parseInt(newRow.querySelector('input[name="quantitydevice"]').value);
            const deviceId = newRow.querySelector('select[name="devicename"]').value;
            const availableQuantity = getAvailableQuantity(deviceId); // Lấy số lượng có sẵn

            if (quantity > availableQuantity) {
                alert(`Không đủ số lượng thiết bị. Số lượng có sẵn: ${availableQuantity}`);
                newRow.querySelector('input[name="quantitydevice"]').value = availableQuantity; // Đặt lại số lượng
            } else {
                updateTotalPrice(newRow);
            }
        });

        // Gán sự kiện chọn thiết bị để cập nhật nhà cung cấp
        const deviceSelect = newRow.querySelector('select[name="devicename"]');
        if (deviceSelect) {
            deviceSelect.addEventListener("change", function (event) {
                handleDeviceChange(event); // Gọi hàm cập nhật nhà cung cấp
            });
        }
    };

    // Sự kiện xóa dòng
    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-row")) {
            event.target.closest("tr").remove();
        }
    });
}
// Hàm lấy số lượng thiết bị có sẵn
function getAvailableQuantity(deviceId) {
    const device = window.devices.find(device => device.id === deviceId);                  //lấy từ bẳng device
    return device ? device.quantity : 0; // Trả về số lượng có sẵn hoặc 0 nếu không tìm thấy
}

// Hàm cập nhật danh sách loại thiết bị và gắn sự kiện chọn thiết bị
// function populateDeviceTypes(deviceTypes, row = document) {
//     const selectElements = row.querySelectorAll('select[name="devicetype"]');
//     if (!selectElements.length) return;

//     const options = deviceTypes.map(type => `<option value="${type.id}">${type.name}</option>`).join("");

//     selectElements.forEach(select => {
//         select.innerHTML = `<option value="">Chọn loại thiết bị</option>` + options;
//         select.addEventListener("change", function () {
//             const row = this.closest("tr");
//             updateDeviceOptions(this.value, row);
//         });
//     });
// }
function populateDeviceTypes(deviceTypes, row = document) {
    const selectElements = row.querySelectorAll('select[name="devicetype"]');
    if (!selectElements.length) {
        console.warn("Không tìm thấy select[name='devicetype'] trong DOM:", row);
        return;
    }

    // Duyệt qua từng <select> element
    selectElements.forEach(select => {
        // Xóa các tùy chọn cũ và thêm tùy chọn mặc định
        select.innerHTML = `<option value="">Chọn loại thiết bị</option>`;

        // Kiểm tra nếu deviceTypes không phải mảng, chuyển thành mảng
        const deviceList = Array.isArray(deviceTypes) ? deviceTypes : [deviceTypes];
        if (!deviceList.length) {
            console.warn("deviceTypes rỗng hoặc không có dữ liệu!");
            return;
        }

        // Duyệt qua danh sách deviceTypes và thêm từng <option>
        deviceList.forEach(type => {
            if (!type.id || !type.name) {
                console.warn("Dữ liệu type không hợp lệ:", type);
                return;
            }
            const option = document.createElement('option');
            option.value = type.id; // Lưu ID
            option.textContent = type.name; // Hiển thị tên
            // console.log("Thêm option:", type.id, type.name);
            select.appendChild(option);
        });

        // Gắn sự kiện change
        select.addEventListener("change", function () {
            const row = this.closest("tr");
            updateDeviceOptions(this.value, row);
        });
    });
}

// Hàm cập nhật danh sách thiết bị theo loại
function updateDeviceOptions(typeId, row) {
    const deviceSelect = row.querySelector('select[name="devicename"]');
    const supplierSelect = row.querySelector('select[name="namesuplier"]');

    deviceSelect.innerHTML = `<option value="">Chọn thiết bị</option>`;
    supplierSelect.innerHTML = `<option value="">Chọn tên</option>`;

    // Log để debug
    console.log("typeId:", typeId);
    console.log("window.devices:", window.devices);
    console.log("window.deviceTypes:", window.deviceTypes);

    // Tìm deviceType tương ứng với typeId để lấy name
    const deviceType = window.deviceTypes.find(type => type.id === typeId);
    if (!deviceType) {
        console.warn("Không tìm thấy deviceType với typeId:", typeId);
        deviceSelect.innerHTML = `<option value="">Không có thiết bị</option>`;
        return;
    }

    const deviceTypeName = deviceType.name;
    console.log("deviceTypeName:", deviceTypeName);

    // Lọc thiết bị theo deviceType_name
    const filteredDevices = window.devices.filter(device => device.deviceType_name === deviceTypeName);

    // Log để kiểm tra kết quả lọc
    console.log("filteredDevices:", filteredDevices);

    if (!filteredDevices.length) {
        deviceSelect.innerHTML = `<option value="">Không có thiết bị</option>`;
        return;
    }

    // Hiển thị tên thiết bị (device.name)
    deviceSelect.innerHTML += filteredDevices.map(device =>
        `<option value="${device.id}" data-user-id="${device.userID}" data-price="${device.hourlyRentalFee}">
            ${device.name}
        </option>`).join("");

    deviceSelect.onchange = function () {
        handleDeviceChange({ target: this }); // Gọi handleDeviceChange với event
    };
}


// Hàm xử lý khi chọn thiết bị
function handleDeviceChange(event) {
    const deviceSelect = event.target;
    if (!deviceSelect) return;

    const row = deviceSelect.closest("tr");
    if (!row) return;

    const selectedDevice = deviceSelect.options[deviceSelect.selectedIndex];
    if (!selectedDevice) return;

    const priceInput = row.querySelector('input[name="pricedevice"]');
    const supplierSelect = row.querySelector('select[name="namesuplier"]');

    if (!priceInput || !supplierSelect) return;

    priceInput.value = selectedDevice.dataset.price || "";
    updateTotalPrice(row);

    // Cập nhật nhà cung cấp
    const userId = selectedDevice.dataset.userId; // Sửa từ user_id thành userId
    const user = window.users.find(user => user.id === userId);

    supplierSelect.innerHTML = user
        ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
        : `<option value="">Không xác định</option>`;
}


// Gán sự kiện một cách an toàn
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('select[name="devicename"]').forEach(select => {
        select.addEventListener("change", handleDeviceChange);
    });
});

// Hàm tính tổng tiền
function updateTotalPrice(row) {
    let priceInput = row.querySelector('input[name="pricedevice"]');
    let quantityInput = row.querySelector('input[name="quantitydevice"]');
    let totalInput = row.querySelector('input[name="totalmoneydevice"]');

    let price = parseFloat(priceInput.value) || 0;
    let quantity = parseInt(quantityInput.value) || 0;
    let total = price * quantity;

    totalInput.value = total.toLocaleString("vi-VN") + " VND"; // Định dạng tiền VND
}
//________________________________service_________________________//
// Hàm thêm dòng dịch vụ
function addServiceRow(serviceId, quantity, price, userId) {
    const tbody = document.querySelector("#serviceTable tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="form-select w-auto" name="servicename"></select>
        </td>
        <td>
            <select class="form-select" name="namesuplier"></select>
        </td>
        <td><input type="number" class="form-control" name="price" value="${price || 0}" min="0" step="1000" readonly></td>
        <td><input type="number" class="form-control" value="${quantity}" min="1" name="quantity"></td>
        <td><input type="text" class="form-control" readonly name="totalmoney"></td>
        <td class="text-center">
            <button class="btn btn-outline-danger remove-row">🗑</button>
        </td>
    `;
    tbody.appendChild(newRow);

    // Populate danh sách dịch vụ và chọn giá trị hiện tại
    populateService(window.services, newRow);
    const serviceSelect = newRow.querySelector('select[name="servicename"]');
    serviceSelect.value = serviceId; // Đặt giá trị hiện tại

    // Populate danh sách nhà cung cấp và chọn giá trị hiện tại
    const supplierSelect = newRow.querySelector('select[name="namesuplier"]');
    const user = window.users.find(user => user.id === userId);
    supplierSelect.innerHTML = user
        ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
        : `<option value="">Không xác định</option>`;

    // Tính tổng tiền
    updateServiceTotal(newRow);

    // Gán sự kiện thay đổi
    newRow.querySelector('select[name="servicename"]').addEventListener("change", handleServiceChange);
    newRow.querySelector('input[name="quantity"]').addEventListener("input", () => updateServiceTotal(newRow));
}
function setupServiceTable(services) {
    const addButton = document.querySelector("#buttonAddService");
    const tbody = document.querySelector("#serviceTable tbody");

    if (!addButton || !tbody) {
        console.warn("Không tìm thấy #buttonAddService hoặc #serviceTable tbody trong DOM");
        return;
    }

    addButton.onclick = function () {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>
                <select class="form-select w-auto" name="servicename">
                    <option value="">Chọn dịch vụ</option>
                </select>
            </td>
            <td>
                <select class="form-select" style="width: 170px;" name="namesuplier">
                    <option value="">Chọn tên</option>
                </select>
            </td>
            <td><input type="number" class="form-control" name="price" min="0" step="1000" readonly></td>
            <td><input type="number" class="form-control" value="1" min="1" name="quantity"></td>
            <td><input type="text" class="form-control" readonly name="totalmoney"></td>
            <td class="text-center">
                <button class="btn btn-outline-danger remove-row">🗑</button>
            </td>
        `;

        tbody.appendChild(newRow);

        // Cập nhật danh sách dịch vụ
        populateService(services, newRow);

        // Gán sự kiện cập nhật tổng tiền cho dòng mới
        newRow.querySelector('input[name="price"]').addEventListener("input", () => updateServiceTotal(newRow));
        newRow.querySelector('input[name="quantity"]').addEventListener("input", () => {
            const quantity = parseInt(newRow.querySelector('input[name="quantity"]').value);
            const serviceId = newRow.querySelector('select[name="servicename"]').value;
            const availableQuantity = getAvailableServiceQuantity(serviceId); // Lấy số lượng có sẵn

            if (quantity > availableQuantity) {
                alert(`Không đủ số lượng dịch vụ. Số lượng có sẵn: ${availableQuantity}`);
                newRow.querySelector('input[name="quantity"]').value = availableQuantity; // Đặt lại số lượng
            } else {
                updateServiceTotal(newRow);
            }
        });

        // Gán sự kiện chọn dịch vụ để cập nhật nhà cung cấp
        const serviceSelect = newRow.querySelector('select[name="servicename"]');
        if (serviceSelect) {
            serviceSelect.addEventListener("change", function (event) {
                handleServiceChange(event); // Gọi hàm cập nhật nhà cung cấp
            });
        }
    };

    // Sự kiện xóa dòng
    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-row")) {
            event.target.closest("tr").remove();
        }
    });
}
// Hàm lấy số lượng dịch vụ có sẵn
function getAvailableServiceQuantity(serviceId) {
    const service = window.services.find(service => service.id === serviceId);
    return service ? service.quantity : 0; // Trả về số lượng có sẵn hoặc 0 nếu không tìm thấy
}


// Hàm gán danh sách dịch vụ cho select
function populateService(services, row = document) {
    const selectElements = row.querySelectorAll('select[name="servicename"]');
    if (!selectElements.length) {
        console.warn("Không tìm thấy select[name='servicename'] trong DOM:", row);
        return;
    }

    console.log("Populating services:", services);

    // Duyệt qua từng <select> element
    selectElements.forEach(select => {
        // Xóa các tùy chọn cũ và thêm tùy chọn mặc định
        select.innerHTML = `<option value="">Chọn dịch vụ</option>`;

        // Kiểm tra nếu services không phải mảng, chuyển thành mảng
        const serviceList = Array.isArray(services) ? services : [services];
        if (!serviceList.length) {
            console.warn("services rỗng hoặc không có dữ liệu!");
            return;
        }

        // Duyệt qua danh sách services và thêm từng <option>
        serviceList.forEach(service => {
            if (!service.id || !service.name) {
                console.warn("Dữ liệu service không hợp lệ:", service);
                return;
            }
            const option = document.createElement('option');
            option.value = service.id; // Lưu ID
            option.setAttribute('data-user-id', service.userID); // Sửa từ user_id thành userID
            option.setAttribute('data-price', service.hourly_salary); // Lưu giá
            option.textContent = service.name; // Hiển thị tên
            select.appendChild(option);
        });

        // Gắn sự kiện change
        select.addEventListener("change", function () {
            handleServiceChange({ target: this });
        });
    });
}
function handleServiceChange(event) {
    const serviceSelect = event.target;
    if (!serviceSelect) return;

    const row = serviceSelect.closest("tr");
    if (!row) return;

    const selectedService = serviceSelect.options[serviceSelect.selectedIndex];
    if (!selectedService) return;

    const priceInput = row.querySelector('input[name="price"]');
    const supplierSelect = row.querySelector('select[name="namesuplier"]');

    if (!priceInput || !supplierSelect) return;

    priceInput.value = selectedService.dataset.price || "";
    updateServiceTotal(row);

    // Cập nhật nhà cung cấp
    const userId = selectedService.dataset.userId;
    const user = window.users.find(user => user.id === userId);

    supplierSelect.innerHTML = user
        ? `<option value="${user.id}">${user.last_name} ${user.first_name}</option>`
        : `<option value="">Không xác định</option>`;
}

// Hàm tính tổng tiền
function updateServiceTotal(row) {
    let priceInput = row.querySelector('input[name="price"]');
    let quantityInput = row.querySelector('input[name="quantity"]');
    let totalInput = row.querySelector('input[name="totalmoney"]');

    let price = parseFloat(priceInput.value) || 0;
    let quantity = parseInt(quantityInput.value) || 0;
    let total = price * quantity;

    totalInput.value = total.toLocaleString("vi-VN") + " VND";
}
//__________________________________Timeline_________________________//
//Sự kiên thêm dòng tr khi nhấn button thêm timeline
function setupTimelineTable() {
    const addButton = document.querySelector("#buttonAddTime");
    const tbody = document.querySelector("#timeTable tbody");

    if (!addButton || !tbody) return;

    addButton.addEventListener("click", function () {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="datetime-local" class="form-control" name="timeline"></td>
            <td><textarea class="form-control" name="descriptiontime" style="min-width: 500px"></textarea></td>
            <td class="text-center">
                <button class="btn btn-outline-danger remove-row">🗑</button>
            </td>
        `;
        tbody.appendChild(newRow);
    });

    tbody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-row")) {
            event.target.closest("tr").remove();
        }
    });
}