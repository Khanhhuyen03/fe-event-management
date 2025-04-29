const BASE_URL = "http://localhost:8080/event-management";
const DEVICE_API_URL = `${BASE_URL}/devices`;
const SERVICE_API_URL = `${BASE_URL}/services`;
const LOCATION_API_URL = `${BASE_URL}/locations`;
const PROVINCE_API_URL = `${BASE_URL}/provinces`;
const DISTRICT_API_URL = `${BASE_URL}/districts`;
const WARD_API_URL = `${BASE_URL}/wards`;
const RENTAL_API_URL = `${BASE_URL}/rentals`;
const CUSTOMER_API_URL = `${BASE_URL}/customers`;
const USER_API_URL = `${BASE_URL}/users`;
const EVENT_API_URL = `${BASE_URL}/events`;
const TIMELINE_API_URL = `${BASE_URL}/timelines`;
const DEVICE_RENTAL_API_URL = `${BASE_URL}/device-rentals`;
const SERVICE_RENTAL_API_URL = `${BASE_URL}/service-rentals`;
const LOCATION_RENTAL_API_URL = `${BASE_URL}/location-rentals`;

let devices = [];
let services = [];
let locations = [];
let provinces = [];
let events = [];
let selectedItems = [];
let currentSelectionType = null;

function getToken() {
    return localStorage.getItem("token");
}

// Định dạng ngày tháng
function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    } else {
        return new Date(dateStr);
    }
}

function toISODate(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

function toISODateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return '';
    const date = parseDate(dateStr);
    if (!date) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes);
    return date.toISOString();
}

// Lấy thông tin nhà cung cấp
async function fetchSupplier(userId) {
    try {
        const user = await fetchData(`${USER_API_URL}/${userId}`);
        if (user.role_id === 'SUPPLIER') {
            return user;
        }
        return null;
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin nhà cung cấp: ${error.message}`);
        return null;
    }
}


function initializeContractForm() {
    const modal = new bootstrap.Modal(document.getElementById('contractModal'), {});
    modal.show();

    document.getElementById('contractDate').valueAsDate = new Date();

    setupDatePicker('startDateDisplay', 'startDate');
    setupDatePicker('endDateDisplay', 'endDate');
    setupDatePicker('customStartDateDisplay', 'customStartDate');
    setupDatePicker('customEndDateDisplay', 'customEndDate');
    setupDatePicker('timelineDateDisplay', 'timelineDate');

    toggleLocationForm();
    loadInitialData();

    window.addEventListener("message", function (event) {
        if (event.data.type === "preloadEvent" && event.data.event) {
            console.log("Dữ liệu sự kiện nhận được:", event.data.event.device);
            preloadEvent(event.data);
        }
        if (event.data.type === "preloadItem" && event.data.item) {
            console.log("Dữ liệu item nhận được:", event.data.item);
            preloadItem(event.data.item);
        }
    });
}


function setupDatePicker(displayId, inputId) {
    const displayInput = document.getElementById(displayId);
    const dateInput = document.getElementById(inputId);
    const calendarIcon = displayInput.nextElementSibling;

    
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7);
    dateInput.min = minDate.toISOString().split('T')[0];

    dateInput.addEventListener('change', () => {
        displayInput.value = formatDate(dateInput.value);
        if (displayId === 'startDateDisplay' || displayId === 'endDateDisplay') {
            validateAndUpdateDates();
        }
    });

    calendarIcon.addEventListener('click', () => {
        dateInput.showPicker();
    });

    displayInput.addEventListener('change', () => {
        const date = parseDate(displayInput.value);
        if (date) {
            dateInput.value = toISODate(displayInput.value);
            if (displayId === 'startDateDisplay' || displayId === 'endDateDisplay') {
                validateAndUpdateDates();
            }
        }
    });
}


async function loadInitialData() {
    try {
        devices = await fetchData(DEVICE_API_URL);
        for (const device of devices) {
            const supplier = await fetchSupplier(device.user_id);
            device.supplierName = supplier ? `${supplier.first_name} ${supplier.last_name}` : 'Không xác định';
        }
    } catch (error) {
        console.error(`Lỗi khi tải danh sách thiết bị: ${error.message}`);
    }

    try {
        services = await fetchData(SERVICE_API_URL);
        for (const service of services) {
            const supplier = await fetchSupplier(service.user_id);
            service.supplierName = supplier ? `${supplier.first_name} ${supplier.last_name}` : 'Không xác định';
        }
    } catch (error) {
        console.error(`Lỗi khi tải danh sách dịch vụ: ${error.message}`);
    }

    try {
        locations = await fetchData(LOCATION_API_URL);
        for (const location of locations) {
            const supplier = await fetchSupplier(location.user_id);
            location.supplierName = supplier ? `${supplier.first_name} ${supplier.last_name}` : 'Không xác định';
        }
    } catch (error) {
        console.error(`Lỗi khi tải danh sách địa điểm: ${error.message}`);
    }

    try {
        provinces = await fetchData(PROVINCE_API_URL);
        const provinceSelect = document.getElementById('province');
        provinces.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.id;
            option.textContent = prov.name;
            provinceSelect.appendChild(option);
        });
    } catch (error) {
        console.error(`Lỗi khi tải danh sách tỉnh/thành: ${error.message}`);
    }

    try {
        events = await fetchData(EVENT_API_URL);
        const contractTypeSelect = document.getElementById('contractType');
        contractTypeSelect.innerHTML = '<option value="">Chọn loại sự kiện</option>';
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.name;
            contractTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error(`Lỗi khi tải danh sách sự kiện: ${error.message}`);
    }
}


async function openItemSelectionModal(type) {
    currentSelectionType = type;
    selectedItems = [];
    const modalTitle = document.getElementById("itemSelectionTitle");
    const itemContainer = document.getElementById("itemSelectionContainer");
    const selectedCount = document.getElementById("selectedCount");
    itemContainer.innerHTML = "";
    selectedCount.textContent = "Đã chọn: 0 mục";

    let items;
    if (type === "device") {
        modalTitle.textContent = "Chọn thiết bị";
        items = devices;
    } else if (type === "service") {
        modalTitle.textContent = "Chọn dịch vụ";
        items = services;
    } else if (type === "location") {
        modalTitle.textContent = "Chọn địa điểm";
        items = locations;
    }

    try {
        if (!items || items.length === 0) {
            throw new Error(`Không có dữ liệu ${type}`);
        }
        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "col-md-4 item-card";
            card.innerHTML = `
                <div class="card">
                    <img src="${item.img || item.image || 'assets/img/default.jpg'}" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">${item.description || "Không có mô tả"}</p>
                        <p class="card-text">Giá: ${(item.hourly_salary || item.hourly_rental_fee || 0).toLocaleString()} VNĐ</p>
                        <p class="card-text">Nhà cung cấp: ${item.supplierName || "Không xác định"}</p>
                        <p class="card-text">Địa điểm: ${item.place || "Không xác định"}</p>
                        <input type="number" class="form-control quantity-input" value="1" min="1" style="display: none;">
                    </div>
                </div>
            `;
            card.addEventListener("click", () => toggleItemSelection(item, card));
            itemContainer.appendChild(card);
        });

        const modal = new bootstrap.Modal(document.getElementById("itemSelectionModal"), {});
        modal.show();
    } catch (error) {
        console.error(`Lỗi khi tải danh sách ${type}: ${error.message}`);
        itemContainer.innerHTML = "<p>Lỗi tải dữ liệu! Vui lòng thử lại.</p>";
    }
}


function toggleItemSelection(item, card) {
    const quantityInput = card.querySelector(".quantity-input");
    const index = selectedItems.findIndex(i => i.id === item.id);
    const selectedCount = document.getElementById("selectedCount");

    if (index === -1) {
        card.classList.add("selected");
        quantityInput.style.display = "block";
        selectedItems.push({
            ...item,
            quantity: parseInt(quantityInput.value),
            category: currentSelectionType
        });
    } else {
        card.classList.remove("selected");
        quantityInput.style.display = "none";
        selectedItems.splice(index, 1);
    }

    selectedCount.textContent = `Đã chọn: ${selectedItems.length} mục`;

    quantityInput.addEventListener("change", () => {
        const idx = selectedItems.findIndex(i => i.id === item.id);
        if (idx !== -1) {
            selectedItems[idx].quantity = parseInt(quantityInput.value);
        }
    }, { once: true });
}


function confirmItemSelection() {
    if (selectedItems.length > 0) {
        selectedItems.forEach(item => {
            if (item.category === "device") {
                addDeviceToTable(item, item.quantity);
            } else if (item.category === "service") {
                addServiceToTable(item, item.quantity);
            } else if (item.category === "location") {
                addLocationToTable(item);
            }
        });
        updateTotalCost();
        const modal = bootstrap.Modal.getInstance(document.getElementById("itemSelectionModal"));
        modal.hide();
    } else {
        alert("Vui lòng chọn ít nhất một mục!");
    }
}


async function preloadEvent(eventData) {
    if (!eventData || !eventData.event) return;

    const event = eventData.event;

    document.getElementById("contractType").value = event.id || '';
    updateContractName();
    document.getElementById("customerName").value = "";
    document.getElementById("phoneNumber").value = "";

    const deviceTableBody = document.getElementById("deviceTableBody");
    deviceTableBody.innerHTML = "";
    if (event.device && event.device.length > 0) {
        for (const item of event.device) {
            const supplier = await fetchSupplier(item.user_id);
            const device = {
                id: item.id || Date.now().toString(),
                name: item.name,
                description: item.description || "Không có mô tả",
                supplierName: supplier ? `${supplier.first_name} ${supplier.last_name}` : "Không xác định",
                hourly_salary: item.hourly_salary || 0,
                img: item.img || item.image || "assets/img/default.jpg",
                place: item.place || "Không xác định"
            };
            addDeviceToTable(device, item.quantity);
        }
    }

    if (event.service && event.service.length > 0) {
        for (const item of event.service) {
            const supplier = await fetchSupplier(item.user_id);
            const service = {
                id: item.id || Date.now().toString(),
                name: item.name,
                description: item.description || "Không có mô tả",
                supplierName: supplier ? `${supplier.first_name} ${supplier.last_name}` : "Không xác định",
                hourly_salary: item.hourly_salary || 0,
                image: item.image || item.img || "assets/img/default.jpg",
                place: item.place || "Không xác định"
            };
            addServiceToTable(service, item.quantity);
        }
    }

    if (event.location && event.location.length > 0) {
        for (const item of event.location) {
            const supplier = await fetchSupplier(item.user_id);
            const location = {
                id: item.id || Date.now().toString(),
                name: item.name,
                supplierName: supplier ? `${supplier.first_name} ${supplier.last_name}` : "Không xác định",
                hourly_rental_fee: item.hourly_rental_fee || 0,
                img: item.img || item.image || "assets/img/default.jpg",
                place: item.place || "Không xác định"
            };
            addLocationToTable(location);
        }
    }

    if (event.timeline && event.timeline.length > 0) {
        const timelineBody = document.getElementById("timelineTableBody");
        timelineBody.innerHTML = "";
        event.timeline.forEach(item => {
            let startTime = "Chưa xác định";
            let description = item;
            if (typeof item === "string" && item.includes(" - ")) {
                const [timeStr, desc] = item.split(" - ");
                startTime = timeStr.trim();
                description = desc.trim();
            }
            const row = document.createElement("tr");
            row.innerHTML = `<td>${startTime}</td><td>${description}</td>`;
            timelineBody.appendChild(row);
        });
    }

    updateTotalCost();
}

async function preloadItem(item) {
    const { category, ...itemData } = item;

    let supplierName = 'Không xác định';
    if (itemData.user_id) {
        const supplier = await fetchSupplier(itemData.user_id);
        supplierName = supplier ? `${supplier.first_name} ${supplier.last_name}` : 'Không xác định';
    }

    const standardizedItem = {
        id: itemData.id || Date.now().toString(),
        name: itemData.name,
        description: itemData.description || "Không có mô tả",
        supplierName: supplierName,
        hourly_salary: itemData.hourly_salary || itemData.hourly_rental_fee || 0,
        hourly_rental_fee: itemData.hourly_rental_fee || 0,
        img: itemData.img || itemData.image || "assets/img/default.jpg",
        place: itemData.place || "Không xác định",
        quantity: itemData.quantity || 1
    };

    if (category === "device") {
        addDeviceToTable(standardizedItem, standardizedItem.quantity);
    } else if (category === "service") {
        addServiceToTable(standardizedItem, standardizedItem.quantity);
    } else if (category === "location") {
        addLocationToTable(standardizedItem);
    }

    updateTotalCost();
}

async function updateDistricts() {
    const provinceId = document.getElementById('province').value;
    const districtSelect = document.getElementById('district');
    districtSelect.innerHTML = '<option value="">Quận/Huyện</option>';
    if (provinceId) {
        try {
            const districts = await fetchData(`${DISTRICT_API_URL}?provinceId=${provinceId}`);
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        } catch (error) {
            console.error(`Lỗi khi lấy quận/huyện: ${error.message}`);
        }
    }
}

async function updateWards() {
    const districtId = document.getElementById('district').value;
    const wardSelect = document.getElementById('ward');
    wardSelect.innerHTML = '<option value="">Xã/Phường</option>';
    if (districtId) {
        try {
            const wards = await fetchData(`${WARD_API_URL}?districtId=${districtId}`);
            wards.forEach(ward => {
                const option = document.createElement('option');
                option.value = ward.id;
                option.textContent = ward.name;
                wardSelect.appendChild(option);
            });
        } catch (error) {
            console.error(`Lỗi khi lấy xã/phường: ${error.message}`);
        }
    }
}


function updateContractName() {
    const eventId = document.getElementById('contractType').value;
    const contractNameInput = document.getElementById('contractName');
    const event = events.find(e => e.id == eventId);
    if (event) {
        contractNameInput.value = `Hợp đồng tổ chức ${event.name}`;
    } else {
        contractNameInput.value = '';
    }
}


function validateAndUpdateDates() {
    const startDateDisplay = document.getElementById('startDateDisplay');
    const endDateDisplay = document.getElementById('endDateDisplay');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const dateError = document.getElementById('dateError');


    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7);

    const startDate = parseDate(startDateDisplay.value || startDateInput.value);
    const endDate = parseDate(endDateDisplay.value || endDateInput.value);

    if (startDateDisplay.value && endDateDisplay.value) {
        if (startDate < minDate) {
            dateError.textContent = `Ngày bắt đầu phải từ sau 1 tuần từ ngày hiện tại`;
            dateError.style.display = 'block';
            startDateDisplay.value = '';
            startDateInput.value = '';
            return false;
        } else if (endDate < minDate) {
            dateError.style.display = 'block';
            endDateDisplay.value = '';
            endDateInput.value = '';
            return false;
        } else if (startDate > endDate) {
            dateError.textContent = 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc';
            dateError.style.display = 'block';
            startDateDisplay.value = '';
            endDateDisplay.value = '';
            startDateInput.value = '';
            endDateInput.value = '';
            return false;
        } else {
            dateError.style.display = 'none';
            startDateInput.value = toISODate(startDateDisplay.value);
            endDateInput.value = toISODate(endDateDisplay.value);
            updateLocationDates();
            return true;
        }
    }
    return true;
}

// Thêm thiết bị vào bảng
function addDeviceToTable(device, quantity = 1) {
    const row = document.createElement('tr');
    const total = (device.hourly_salary || 0) * quantity;
    row.dataset.deviceId = device.id; 
    row.innerHTML = `
        <td><img src="${device.img || device.image || 'assets/img/default.jpg'}" alt="${device.name}" width="50"></td>
        <td>${device.name}</td>
        <td>${device.description || 'Không có mô tả'}</td>
        <td>${device.supplierName || 'Không xác định'}</td>
        <td><input type="number" class="form-control" value="${quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
        <td>${(device.hourly_salary || 0).toLocaleString()} VNĐ</td>
        <td>${total.toLocaleString()} VNĐ</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
    `;
    document.getElementById('deviceTableBody').appendChild(row);
}

// Thêm dịch vụ vào bảng
function addServiceToTable(service, quantity = 1) {
    const row = document.createElement('tr');
    const total = (service.hourly_salary || 0) * quantity;
    row.dataset.serviceId = service.id; 
    row.innerHTML = `
        <td><img src="${service.image || service.img || 'assets/img/default.jpg'}" alt="${service.name}" width="50"></td>
        <td>${service.name}</td>
        <td>${service.description || 'Không có mô tả'}</td>
        <td>${service.supplierName || 'Không xác định'}</td>
        <td><input type="number" class="form-control" value="${quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
        <td>${(service.hourly_salary || 0).toLocaleString()} VNĐ</td>
        <td>${total.toLocaleString()} VNĐ</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
    `;
    document.getElementById('serviceTableBody').appendChild(row);
}

// Thêm địa điểm vào bảng
function addLocationToTable(location) {
    const startDate = document.getElementById('startDateDisplay').value;
    const endDate = document.getElementById('endDateDisplay').value;
    let diffDays = 0;
    if (startDate && endDate) {
        const startDateObj = parseDate(startDate);
        const endDateObj = parseDate(endDate);
        const diffTime = Math.abs(endDateObj - startDateObj);
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    const row = document.createElement('tr');
    row.dataset.locationId = location.id; 
    row.innerHTML = `
        <td><img src="${location.img || location.image || 'assets/img/default.jpg'}" alt="${location.name}" width="50"></td>
        <td>${location.name}</td>
        <td>${location.supplierName || 'Không xác định'}</td>
        <td>${startDate || 'Chưa xác định'}</td>
        <td>${endDate || 'Chưa xác định'}</td>
        <td>${diffDays || 'Chưa xác định'}</td>
        <td>${(location.hourly_rental_fee || 0).toLocaleString()} VNĐ</td>
        <td>${diffDays ? ((location.hourly_rental_fee || 0) * diffDays).toLocaleString() : '0'} VNĐ</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
    `;
    document.getElementById('locationTableBody').appendChild(row);
}

// Cập nhật chi phí hàng
function updateRowCost(input) {
    const row = input.closest('tr');
    const quantity = parseInt(input.value);
    const unitPrice = parseInt(row.children[5].textContent.replace(/[^0-9]/g, ''));
    const total = unitPrice * quantity;
    row.children[6].textContent = total.toLocaleString() + ' VNĐ';
    updateTotalCost();
}


function removeRow(btn) {
    btn.parentNode.parentNode.remove();
    updateTotalCost();
}


function updateTotalCost() {
    let total = 0;
    const deviceRows = document.getElementById('deviceTableBody').children;
    const serviceRows = document.getElementById('serviceTableBody').children;
    const locationRows = document.getElementById('locationTableBody').children;
    for (let row of deviceRows) total += parseInt(row.children[6].textContent.replace(/[^0-9]/g, ''));
    for (let row of serviceRows) total += parseInt(row.children[6].textContent.replace(/[^0-9]/g, ''));
    for (let row of locationRows) total += parseInt(row.children[7].textContent.replace(/[^0-9]/g, '')) || 0;
    document.getElementById('totalCost').textContent = `${total.toLocaleString()} VNĐ`;
}

// Thêm timeline
function addTimeline() {
    const timelineDate = document.getElementById('timelineDateDisplay').value;
    const timelineTime = document.getElementById('timelineTime').value;
    const timelineDescription = document.getElementById('timelineDescription').value;
    if (!timelineDate || !timelineTime || !timelineDescription) return;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${timelineDate} ${timelineTime}</td>
        <td>${timelineDescription}</td>
    `;
    document.getElementById('timelineTableBody').appendChild(row);
    document.getElementById('timelineDateDisplay').value = '';
    document.getElementById('timelineDate').value = '';
    document.getElementById('timelineTime').value = '';
    document.getElementById('timelineDescription').value = '';
}

// Kết hợp địa chỉ
function getFullAddress() {
    const provinceId = document.getElementById('province').value;
    const districtId = document.getElementById('district').value;
    const wardId = document.getElementById('ward').value;
    const addressDetail = document.getElementById('addressDetail').value;

    const province = provinces.find(p => p.id == provinceId)?.name || '';
    const district = document.getElementById('district').selectedOptions[0]?.text || '';
    const ward = document.getElementById('ward').selectedOptions[0]?.text || '';

    return [addressDetail, ward, district, province].filter(Boolean).join(', ');
}

// Lưu hợp đồng
async function saveContract() {
    if (!validateAndUpdateDates()) {
        console.error('Vui lòng kiểm tra lại thời gian tổ chức!');
        return;
    }

    const customerName = document.getElementById('customerName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const eventId = document.getElementById('contractType').value;
    if (!customerName || !phoneNumber || !eventId) {
        console.error('Vui lòng nhập đầy đủ tên khách hàng, số điện thoại và loại sự kiện!');
        return;
    }

    const customer = {
        name: customerName,
        phone_number: phoneNumber,
        address: getFullAddress(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const rental = {
        custom_location: document.getElementById('providerLocation').checked ? null : {
            name: document.getElementById('customLocationName').value,
            address: document.getElementById('customLocationAddress').value,
            startDate: toISODate(document.getElementById('customStartDateDisplay').value),
            endDate: toISODate(document.getElementById('customEndDateDisplay').value)
        },
        rental_start_time: toISODate(document.getElementById('startDateDisplay').value),
        rental_end_time: toISODate(document.getElementById('endDateDisplay').value),
        total_price: parseInt(document.getElementById('totalCost').textContent.replace(/[^0-9]/g, '')),
        event_id: eventId,
        updated_at: new Date().toISOString()
    };

    const deviceRentals = Array.from(document.getElementById('deviceTableBody').children).map(row => ({
        device_id: row.dataset.deviceId,
        quantity: parseInt(row.children[4].querySelector('input').value)
    }));

    const serviceRentals = Array.from(document.getElementById('serviceTableBody').children).map(row => ({
        service_id: row.dataset.serviceId,
        quantity: parseInt(row.children[4].querySelector('input').value)
    }));

    const locationRentals = Array.from(document.getElementById('locationTableBody').children).map(row => ({
        location_id: row.dataset.locationId,
        quantity: 1
    }));

    const timelines = Array.from(document.getElementById('timelineTableBody').children).map(row => ({
        description: row.children[1].textContent,
        time_start: toISODateTime(row.children[0].textContent.split(' ')[0], row.children[0].textContent.split(' ')[1]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));

    try {
        const existingCustomer = await fetchData(`${CUSTOMER_API_URL}?phone_number=${phoneNumber}`);
        let customerId;

        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
        } else {
            const customerResponse = await fetchData(CUSTOMER_API_URL, 'POST', customer);
            customerId = customerResponse.id;
            console.log('Khách hàng mới đã được lưu:', customerResponse);
        }

        rental.user_id = customerId;

        const rentalResponse = await fetchData(RENTAL_API_URL, 'POST', rental);
        console.log('Hợp đồng đã được lưu:', rentalResponse);

        for (const deviceRental of deviceRentals) {
            await fetchData(DEVICE_RENTAL_API_URL, 'POST', {
                ...deviceRental,
                rental_id: rentalResponse.id
            });
        }

        for (const serviceRental of serviceRentals) {
            await fetchData(SERVICE_RENTAL_API_URL, 'POST', {
                ...serviceRental,
                rental_id: rentalResponse.id
            });
        }

        for (const locationRental of locationRentals) {
            await fetchData(LOCATION_RENTAL_API_URL, 'POST', {
                ...locationRental,
                rental_id: rentalResponse.id
            });
        }

        for (const timeline of timelines) {
            await fetchData(TIMELINE_API_URL, 'POST', {
                ...timeline,
                rental_id: rentalResponse.id
            });
        }

        if (window.parent) {
            window.parent.postMessage({
                type: 'newContract',
                contract: {
                    id: rentalResponse.id,
                    name: document.getElementById('contractName').value,
                    total_price: rentalResponse.total_price,
                    rental_start_time: rentalResponse.rental_start_time,
                    rental_end_time: rentalResponse.rental_end_time,
                    status: 'draft'
                }
            }, '*');
        }

        closeModal();
    } catch (error) {
        console.error(`Lỗi khi lưu dữ liệu: ${error.message}`);
    }
}

// Cập nhật ngày địa điểm
function updateLocationDates() {
    const startDate = document.getElementById('startDateDisplay').value;
    const endDate = document.getElementById('endDateDisplay').value;
    if (!startDate || !endDate) return;

    const startDateObj = parseDate(startDate);
    const endDateObj = parseDate(endDate);
    const diffTime = Math.abs(endDateObj - startDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const locationRows = document.getElementById('locationTableBody').children;
    for (let row of locationRows) {
        row.children[3].textContent = startDate;
        row.children[4].textContent = endDate;
        row.children[5].textContent = diffDays;
        row.children[7].textContent = (parseInt(row.children[6].textContent.replace(/[^0-9]/g, '')) * diffDays).toLocaleString() + ' VNĐ';
    }
    updateTotalCost();
}

// Hiển thị/ẩn form địa điểm
function toggleLocationForm() {
    const providerForm = document.getElementById('providerLocationForm');
    const customerForm = document.getElementById('customerLocationForm');
    const isProvider = document.getElementById('providerLocation').checked;
    providerForm.classList.toggle('active', isProvider);
    customerForm.classList.toggle('active', !isProvider);
}

// Đóng modal
function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('contractModal'));
    modal.hide();
    if (window.parent) window.parent.postMessage('closeIframe', '*');
}


async function fetchData(url, method = "GET", data = null) {
    const token = getToken();
    const options = {
        method: method,
        headers: { "Content-Type": "application/json" }
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`${method} thất bại! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', initializeContractForm);