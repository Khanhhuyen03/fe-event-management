var EventAPI = 'http://localhost:8080/event-management/event';
var EventTypeAPI = 'http://localhost:8080/event-management/event-type';
var CreateEventAPI = 'http://localhost:8080/event-management/event/create-event';
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
// function renderEvents(events, eventTypes) {
//     var listEvenstBlock = document.querySelector('#list-event tbody');
//     if (!listEvenstBlock) return;

//     // Hủy DataTables nếu đã khởi tạo
//     if ($.fn.DataTable.isDataTable('#list-event')) {
//         $('#list-event').DataTable().destroy();
//     }

//     var htmls = events.map(function (event) {
//         var eventType = eventTypes.find(type => type.id === event.event_type_id);
//         var eventTypeName = eventType ? eventType.name : "Không xác định";
//         return `
//             <tr class="list-event-${event.id}">
//                 <td>${event.name}</td>
//                 <td>${event.eventTypeName}</td>
//                 <td style="width: 40%;">${event.description}</td>
//                 <td>${event.created_at}</td>
//                 <td class="text-center">
//                     <div class="action-dropdown">
//                         <button class="btn btn-light action-btn">...</button>
//                         <div class="dropdown-content">
//                             <button class="dropdown-item delete-btn" data-id="${event.id}">Xoá</button>
//                             <button class="dropdown-item update-btn" data-id="${event.id}">Cập nhật</button>
//                             <button class="dropdown-item detail-btn" data-id="${event.id}">Xem chi tiết</button>
//                         </div>
//                     </div>
//                 </td>
//             </tr>
//         `;
//     });

//     listEvenstBlock.innerHTML = htmls.join('');

//     // Khởi tạo lại DataTables
//     var table = $('#list-event').DataTable({
//         "order": [[3, "desc"]],
//         "language": {
//             "search": "Tìm kiếm:",
//             "lengthMenu": "",
//             "info": "",
//             "infoEmpty": "Không có dữ liệu",
//             "zeroRecords": "Không tìm thấy kết quả",
//             "paginate": {
//                 "first": "Đầu",
//                 "last": "Cuối",
//                 "next": "Tiếp",
//                 "previous": "Trước"
//             }
//         }
//     });

//     // 🛠 Gán sự kiện dùng delegate để hoạt động trên tất cả các trang
//     $('#list-event tbody').on('click', '.action-btn', function (event) {
//         let dropdown = $(this).next('.dropdown-content');
//         $('.dropdown-content').not(dropdown).hide(); // Ẩn các dropdown khác
//         dropdown.toggle();
//         event.stopPropagation();
//     });

//     // Xử lý sự kiện cập nhật
//     $('#list-event tbody').on('click', '.update-btn', function () {
//         let eventId = $(this).data('id');
//         handleUpdateEvent(eventId);
//     });

//     // Xử lý sự kiện xoá
//     $('#list-event tbody').on('click', '.delete-btn', function () {
//         let eventId = $(this).data('id');
//         handleDeleteEvent(eventId);
//     });
//     // Xử lý sự kiện xem chi tiết
//     $('#list-event tbody').on('click', '.detail-btn', function () {
//         let eventId = $(this).data('id');
//         handleDetailEvent(eventId);
//     });

//     // Đóng dropdown khi bấm ra ngoài
//     $(document).click(function () {
//         $('.dropdown-content').hide();
//     });
// }
function renderEvents(events, eventTypes) {
    const listEvenstBlock = document.querySelector('#list-event tbody');
    if (!listEvenstBlock) return;

    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    fetch(RolesAPI, {
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
                        <td>${event.created_at}</td>
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

    //Lấy token từ localStorage
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
            document.querySelector('select[name="eventype"]').value = event.eventTypeName;

            // Set giá trị cho select box
            const selectElement = document.querySelector('select[name="eventype"]');
            if (event.eventType_id) {
                selectElement.value = event.name;
            }

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
            document.querySelector("#create").onclick = function () {
                const inputPicture = document.querySelector('input[name="picture"]');
                const inputName = document.querySelector('input[name="name"]').value;
                const inputDescription = document.querySelector('input[name="description"]').value;
                const inputEventTypeID = document.querySelector('select[name="eventype"]').value;
                const inputDetail = document.querySelector('textarea[name="detail"]').value;
                const img = inputPicture.files.length > 0 ? imagePreview.src : event.img;

                const updatedEvent = {
                    img: img,
                    name: inputName,
                    description: inputDescription,
                    eventTypeName: inputEventTypeID,
                    detail: inputDetail,
                    created_at: event.created_at,
                    updated_at: new Date().toISOString().split('T')[0]
                };

                fetch(`${EventAPI}/${editEventId}`, {
                    method: 'PATCH',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedEvent)
                })
                    .then(response => response.json())
                    .then(() => {
                        console.log("Cập nhật thành công!");
                        window.location.href = "table-event.html";
                    })
            }
        })
}
//Xoá event
function handleDeleteEvent(id) {
    var options = {
        method: 'DELETE',
        headers: {
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

    //Lấy token từ localStorage
    let token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại!");
        return;
    }

    // Lấy danh sách loại sự kiện
    fetch(EventTypeAPI, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(eventTypes => {
            // Lấy thông tin sự kiện
            return fetch(`${EventAPI}/${editEventId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(event => ({ event, eventTypes })); // Trả về cả event và eventTypes
        })
        .then(({ event, eventTypes }) => {
            // Tìm tên loại sự kiện từ eventTypes dựa trên event.event_type_id
            const eventType = eventTypes.find(type => type.id === event.event_type_id);//coi lại có đổi năm ko
            const eventTypeName = eventType ? eventType.name : "Không xác định";

            // Cập nhật các thẻ <div> với dữ liệu sự kiện
            document.getElementById("inputName").textContent = event.name || "";
            document.getElementById("inputDescription").textContent = event.description || "";
            document.getElementById("inputDetail").textContent = event.detail || "";
            document.getElementById("EventTypes").textContent = event.eventTypeName||"";//eventTypeName; // Gán tên loại sự kiện

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