var EventAPI = 'http://localhost:8080/event-management/event';
var EventTypeAPI = 'http://localhost:8080/event-management/event-type';
var CreateEventAPI = 'http://localhost:8080/event-management/create-event';
function start() {
    getData((events, eventTypes) => {
        renderEvents(events, eventTypes);
        // window.users = users;
        // window.events = events;
        // window.eventTypes = eventTypes
        if (document.querySelector("#selectEventTypes")) {
            populateEventTypes(eventTypes);
        }
    });
    handleCreateForm();
    if (document.querySelector("#saveEventType")) {
        handleCreateEventType();
    }
    handleAddEventType(); // Thêm xử lý cho nút "+"
    var editEventId = localStorage.getItem("editEventId");
}
start();
function renderEvents(events, eventTypes) {
    var listEvenstBlock = document.querySelector('#list-event tbody');
    if (!listEvenstBlock) return;

    // Hủy DataTables nếu đã khởi tạo
    if ($.fn.DataTable.isDataTable('#list-event')) {
        $('#list-event').DataTable().destroy();
    }

    var htmls = events.map(function (event) {
        var eventType = eventTypes.find(type => type.id === event.event_type_id);
        var eventTypeName = eventType ? eventType.name : "Không xác định";
        return `
            <tr class="list-event-${event.id}">
                <td>${event.name}</td>
                <td>${event.eventTypeName}</td>
                <td style="width: 40%;">${event.description}</td>
                <td>${event.created_at}</td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="btn btn-light action-btn">...</button>
                        <div class="dropdown-content">
                            <button class="dropdown-item delete-btn" data-id="${event.id}">Xoá</button>
                            <button class="dropdown-item update-btn" data-id="${event.id}">Cập nhật</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    listEvenstBlock.innerHTML = htmls.join('');

    // Khởi tạo lại DataTables
    var table = $('#list-event').DataTable({
        "order": [[3, "desc"]],
        "language": {
            "search": "Tìm kiếm:",
            "lengthMenu": "",
            "info": "",
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

    // 🛠 Gán sự kiện dùng delegate để hoạt động trên tất cả các trang
    $('#list-event tbody').on('click', '.action-btn', function (event) {
        let dropdown = $(this).next('.dropdown-content');
        $('.dropdown-content').not(dropdown).hide(); // Ẩn các dropdown khác
        dropdown.toggle();
        event.stopPropagation();
    });

    // Xử lý sự kiện cập nhật
    $('#list-event tbody').on('click', '.update-btn', function () {
        let eventId = $(this).data('id');
        handleUpdateEvent(eventId);
    });

    // Xử lý sự kiện xoá
    $('#list-event tbody').on('click', '.delete-btn', function () {
        let eventId = $(this).data('id');
        handleDeleteEvent(eventId);
    });

    // Đóng dropdown khi bấm ra ngoài
    $(document).click(function () {
        $('.dropdown-content').hide();
    });
}

// function getData(callback) {
//     Promise.all([
//         fetch(EventAPI).then(res => res.json()),
//         fetch(EventTypeAPI).then(res => res.json()),

//     ])
//         .then(([events, eventTypes]) => {
//             callback(events, eventTypes);
//         })
//         .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
// }

function getData(callback) {
    let token = localStorage.getItem("token"); // Lấy token từ localStorage

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    Promise.all([
        fetch(EventAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json()),

        fetch(EventTypeAPI, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json())

    ]).then(([events, eventTypes]) => {
        callback(events, eventTypes);
    })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
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
        event.preventDefault(); // Ngăn chặn reload trang mặc định của form

        var pictureInput = document.querySelector('input[name="picture"]');
        var name = document.querySelector('input[name="name"]').value;
        var description = document.querySelector('input[name="description"]').value;
        var eventTypeID = document.querySelector('select[name="eventype"]').value;
        var detail = document.querySelector('textarea[name="detail"]').value;

        // Kiểm tra dữ liệu đầu vào
        console.log('Form Data:', {
            name,
            description,
            eventTypeID,
            detail,
            hasImage: pictureInput && pictureInput.files.length > 0
        });

        if (!name || !eventTypeID) {
            alert("Vui lòng nhập đầy đủ tên sự kiện và loại sự kiện!");
            return;
        }

        // Sử dụng FormData để gửi dữ liệu
        var formData = new FormData();
        if (pictureInput && pictureInput.files.length > 0) {
            formData.append("img", pictureInput.files[0]); // Gửi file thực tế
        }
        formData.append("name", name);
        formData.append("description", description);
        formData.append("event_type_id", eventTypeID);
        formData.append("detail", detail);
        formData.append("created_at", new Date().toISOString().split('T')[0]);
        formData.append("updated_at", new Date().toISOString().split('T')[0]);

        // Log ra để kiểm tra dữ liệu
        console.log("Dữ liệu gửi lên:");
        for (var pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        createEvent(formData, function (eventResponse) {
            var eventId = eventResponse.id;
            console.log("Event vừa tạo có ID:", eventId);
            console.log("Đã tạo sự kiện thành công:", eventResponse);
            alert("Tạo sự kiện thành công!");
        });
    };
}
function createEvent(data, callback) {
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        alert("Vui lòng đăng nhập lại để tiếp tục!");
        return;
    }

    var options = {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
            // Không set Content-Type vì browser sẽ tự set với boundary cho multipart/form-data
        },
        body: data
    };

    console.log('Sending request to:', CreateEventAPI);
    console.log('Request options:', {
        method: options.method,
        headers: options.headers
    });

    fetch(CreateEventAPI, options)
        .then(async function (response) {
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            const text = await response.text();
            console.log('Response body:', text);

            if (!response.ok) {
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || `HTTP error! Status: ${response.status}`);
                } catch (e) {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
                }
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid JSON response from server');
            }
        })
        .then(function (eventResponse) {
            console.log('Server response:', eventResponse);
            if (eventResponse.code && eventResponse.code !== 200) {
                throw new Error(eventResponse.message || "Lỗi không xác định từ server");
            }
            callback(eventResponse);
        })
        .catch(function (error) {
            console.error("Lỗi khi tạo sự kiện:", error);
            alert("Đã có lỗi xảy ra khi tạo sự kiện: " + error.message);
        });
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
