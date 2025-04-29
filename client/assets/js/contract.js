
// const BASE_URL = "http://localhost:8080/event-management";
// const DEVICE_API_URL = `${BASE_URL}/devices`;
// const SERVICE_API_URL = `${BASE_URL}/services`;
// const LOCATION_API_URL = `${BASE_URL}/locations`;
// const PROVINCE_API_URL = `${BASE_URL}/provinces`;
// const DISTRICT_API_URL = `${BASE_URL}/districts`;
// const WARD_API_URL = `${BASE_URL}/wards`;
// const CONTRACT_API_URL = `${BASE_URL}/contracts`;

// let devices = [];
// let services = [];
// let locations = [];
// let provinces = [];

// function getToken() {
//     return localStorage.getItem("token");
// }

// function formatDate(dateStr) {
//     if (!dateStr) return '';
//     const [year, month, day] = dateStr.split('-');
//     return `${day}/${month}/${year}`;
// }

// function parseDate(dateStr) {
//     if (!dateStr) return null;
//     if (dateStr.includes('/')) {
//         const [day, month, year] = dateStr.split('/').map(Number);
//         return new Date(year, month - 1, day);
//     } else {
//         return new Date(dateStr);
//     }
// }

// function toISODate(dateStr) {
//     const date = parseDate(dateStr);
//     if (!date) return '';
//     return date.toISOString().split('T')[0];
// }

// function initializeContractForm() {
//     const modal = new bootstrap.Modal(document.getElementById('contractModal'), {});
//     modal.show();

//     document.getElementById('contractDate').valueAsDate = new Date();

//     // Xử lý cho các input ngày trong Thông tin hợp đồng
//     setupDatePicker('startDateDisplay', 'startDate');
//     setupDatePicker('endDateDisplay', 'endDate');

//     // Xử lý cho địa điểm tùy chỉnh
//     setupDatePicker('customStartDateDisplay', 'customStartDate');
//     setupDatePicker('customEndDateDisplay', 'customEndDate');

//     // Xử lý cho timeline
//     setupDatePicker('timelineDateDisplay', 'timelineDate');

//     toggleLocationForm();
//     loadInitialData();

//     window.addEventListener("message", function (event) {
//         if (event.data.type === "preloadEvent" && event.data.event) {
//             console.log("Dữ liệu thiết bị nhận được:", event.data.event.device);
//             preloadEvent(event.data);
//         }
//     });
// }

// function setupDatePicker(displayId, inputId) {
//     const displayInput = document.getElementById(displayId);
//     const dateInput = document.getElementById(inputId);
//     const calendarIcon = displayInput.nextElementSibling;

//     // Khi thay đổi ngày trong input date
//     dateInput.addEventListener('change', () => {
//         displayInput.value = formatDate(dateInput.value);
//         if (displayId === 'startDateDisplay' || displayId === 'endDateDisplay') {
//             validateAndUpdateDates();
//         }
//     });

//     // hiển thị lịch
//     calendarIcon.addEventListener('click', () => {
//         dateInput.showPicker();
//     });

//     // Khi nhập tay vào display input
//     displayInput.addEventListener('change', () => {
//         const date = parseDate(displayInput.value);
//         if (date) {
//             dateInput.value = toISODate(displayInput.value);
//             if (displayId === 'startDateDisplay' || displayId === 'endDateDisplay') {
//                 validateAndUpdateDates();
//             }
//         }
//     });
// }

// async function loadInitialData() {
//     try {
//         devices = await fetchData(DEVICE_API_URL);
//         const deviceSelect = document.getElementById('deviceSelect');
//         devices.forEach(device => {
//             const option = document.createElement('option');
//             option.value = device.id;
//             option.textContent = device.name;
//             deviceSelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error(`Lỗi khi tải danh sách thiết bị: ${error.message}`);
//     }

//     try {
//         services = await fetchData(SERVICE_API_URL);
//         const serviceSelect = document.getElementById('serviceSelect');
//         services.forEach(service => {
//             const option = document.createElement('option');
//             option.value = service.id;
//             option.textContent = service.name;
//             serviceSelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error(`Lỗi khi tải danh sách dịch vụ: ${error.message}`);
//     }

//     try {
//         locations = await fetchData(LOCATION_API_URL);
//         const locationSelect = document.getElementById('locationSelect');
//         locations.forEach(location => {
//             const option = document.createElement('option');
//             option.value = location.id;
//             option.textContent = location.name;
//             locationSelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error(`Lỗi khi tải danh sách địa điểm: ${error.message}`);
//     }

//     try {
//         provinces = await fetchData(PROVINCE_API_URL);
//         const provinceSelect = document.getElementById('province');
//         provinces.forEach(prov => {
//             const option = document.createElement('option');
//             option.value = prov.id;
//             option.textContent = prov.name;
//             provinceSelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error(`Lỗi khi tải danh sách tỉnh/thành: ${error.message}`);
//     }
// }

// function preloadEvent(eventData) {
//     if (!eventData || !eventData.event) return;

//     const event = eventData.event;

//     document.getElementById("contractType").value = event.name.includes("Hội nghị") ? "Hội nghị" :
//         event.name.includes("Lễ cưới") ? "Đám cưới" :
//             event.name.includes("Sinh nhật") ? "Sinh nhật" :
//                 event.name.includes("Khai trương") ? "Khai trương" : "";
//     updateContractName();
//     document.getElementById("customerName").value = "";
//     document.getElementById("phoneNumber").value = "";

//     const deviceTableBody = document.getElementById("deviceTableBody");
//     deviceTableBody.innerHTML = "";
//     if (event.device && event.device.length > 0) {
//         event.device.forEach(item => {
//             const device = {
//                 id: item.id || Date.now().toString(),
//                 name: item.name,
//                 description: item.description || "Không có mô tả",
//                 supplierName: item.supplier || "Không xác định",
//                 price: item.unitPrice || 0,
//                 image: item.image || "assets/img/default.jpg"
//             };
//             addDeviceToTable(device, item.quantity);
//         });
//     }

//     if (event.service && event.service.length > 0) {
//         event.service.forEach(item => {
//             const service = {
//                 id: item.id || Date.now().toString(),
//                 name: item.name,
//                 description: item.description || "Không có mô tả",
//                 supplierName: item.supplier || "Không xác định",
//                 price: item.unitPrice || 0,
//                 image: item.image || "assets/img/default.jpg"
//             };
//             addServiceToTable(service, item.quantity);
//         });
//     }

//     if (event.locations && event.locations.length > 0) {
//         event.locations.forEach(item => {
//             const location = {
//                 id: item.id || Date.now().toString(),
//                 name: item.name,
//                 supplierName: item.supplier || "Không xác định",
//                 pricePerDay: item.unitPrice || 0,
//                 image: item.image || "assets/img/default.jpg"
//             };
//             addLocationToTable(location);
//         });
//     }

//     if (event.timeline && event.timeline.length > 0) {
//         const timelineBody = document.getElementById("timelineTableBody");
//         timelineBody.innerHTML = "";
//         event.timeline.forEach(item => {
//             let startTime = "Chưa xác định";
//             let description = item;
//             if (typeof item === "string" && item.includes(" - ")) {
//                 const [timeStr, desc] = item.split(" - ");
//                 startTime = timeStr.trim();
//                 description = desc.trim();
//             }
//             const row = document.createElement("tr");
//             row.innerHTML = `<td>${startTime}</td><td>${description}</td>`;
//             timelineBody.appendChild(row);
//         });
//     }

//     updateTotalCost();
// }

// async function updateDistricts() {
//     const provinceId = document.getElementById('province').value;
//     const districtSelect = document.getElementById('district');
//     districtSelect.innerHTML = '<option value="">Quận/Huyện</option>';
//     if (provinceId) {
//         try {
//             const districts = await fetchData(`${DISTRICT_API_URL}?provinceId=${provinceId}`);
//             districts.forEach(district => {
//                 const option = document.createElement('option');
//                 option.value = district.id;
//                 option.textContent = district.name;
//                 districtSelect.appendChild(option);
//             });
//         } catch (error) {
//             console.error(`Lỗi khi lấy quận/huyện: ${error.message}`);
//         }
//     }
// }

// async function updateWards() {
//     const districtId = document.getElementById('district').value;
//     const wardSelect = document.getElementById('ward');
//     wardSelect.innerHTML = '<option value="">Xã/Phường</option>';
//     if (districtId) {
//         try {
//             const wards = await fetchData(`${WARD_API_URL}?districtId=${districtId}`);
//             wards.forEach(ward => {
//                 const option = document.createElement('option');
//                 option.value = ward.id;
//                 option.textContent = ward.name;
//                 wardSelect.appendChild(option);
//             });
//         } catch (error) {
//             console.error(`Lỗi khi lấy xã/phường: ${error.message}`);
//         }
//     }
// }

// function updateContractName() {
//     const contractType = document.getElementById('contractType').value;
//     const contractNameInput = document.getElementById('contractName');
//     if (contractType) {
//         contractNameInput.value = `Hợp đồng tổ chức ${contractType}`;
//     } else {
//         contractNameInput.value = '';
//     }
// }

// function validateAndUpdateDates() {
//     const startDateDisplay = document.getElementById('startDateDisplay');
//     const endDateDisplay = document.getElementById('endDateDisplay');
//     const startDateInput = document.getElementById('startDate');
//     const endDateInput = document.getElementById('endDate');
//     const dateError = document.getElementById('dateError');
//     const minDate = new Date('2025-04-13');

//     const startDate = parseDate(startDateDisplay.value || startDateInput.value);
//     const endDate = parseDate(endDateDisplay.value || endDateInput.value);

//     if (startDateDisplay.value && endDateDisplay.value) {
//         if (startDate < minDate) {
//             dateError.textContent = 'Ngày bắt đầu phải từ 13/04/2025 trở đi (sau 1 tuần từ ngày hiện tại)';
//             dateError.style.display = 'block';
//             startDateDisplay.value = '';
//             startDateInput.value = '';
//             return false;
//         } else if (endDate < minDate) {
//             dateError.textContent = 'Ngày kết thúc phải từ 13/04/2025 trở đi (sau 1 tuần từ ngày hiện tại)';
//             dateError.style.display = 'block';
//             endDateDisplay.value = '';
//             endDateInput.value = '';
//             return false;
//         } else if (startDate > endDate) {
//             dateError.textContent = 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc';
//             dateError.style.display = 'block';
//             startDateDisplay.value = '';
//             endDateDisplay.value = '';
//             startDateInput.value = '';
//             endDateInput.value = '';
//             return false;
//         } else {
//             dateError.style.display = 'none';
//             startDateInput.value = toISODate(startDateDisplay.value);
//             endDateInput.value = toISODate(endDateDisplay.value);
//             updateLocationDates();
//             return true;
//         }
//     }
//     return true;
// }

// function addDevice() {
//     const deviceId = document.getElementById('deviceSelect').value;
//     if (!deviceId) return;
//     const device = devices.find(d => d.id == deviceId);
//     addDeviceToTable(device);
//     updateTotalCost();
// }

// function addDeviceToTable(device, quantity = 1) {
//     const row = document.createElement('tr');
//     const total = device.price * quantity;
//     row.innerHTML = `
//                 <td><img src="${device.image || 'assets/img/default.jpg'}" alt="${device.name}" width="50"></td>
//                 <td>${device.name}</td>
//                 <td>${device.description || 'Không có mô tả'}</td>
//                 <td>${device.supplierName || 'Không xác định'}</td>
//                 <td><input type="number" class="form-control" value="${quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
//                 <td>${device.price.toLocaleString()} VNĐ</td>
//                 <td>${total.toLocaleString()} VNĐ</td>
//                 <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
//             `;
//     document.getElementById('deviceTableBody').appendChild(row);
// }

// function addService() {
//     const serviceId = document.getElementById('serviceSelect').value;
//     if (!serviceId) return;
//     const service = services.find(s => s.id == serviceId);
//     addServiceToTable(service);
//     updateTotalCost();
// }

// function addServiceToTable(service, quantity = 1) {
//     const row = document.createElement('tr');
//     const total = service.price * quantity;
//     row.innerHTML = `
//                 <td><img src="${service.image || 'assets/img/default.jpg'}" alt="${service.name}" width="50"></td>
//                 <td>${service.name}</td>
//                 <td>${service.description || 'Không có mô tả'}</td>
//                 <td>${service.supplierName || 'Không xác định'}</td>
//                 <td><input type="number" class="form-control" value="${quantity}" min="1" style="width: 80px;" onchange="updateRowCost(this)"></td>
//                 <td>${service.price.toLocaleString()} VNĐ</td>
//                 <td>${total.toLocaleString()} VNĐ</td>
//                 <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
//             `;
//     document.getElementById('serviceTableBody').appendChild(row);
// }

// function updateRowCost(input) {
//     const row = input.closest('tr');
//     const quantity = parseInt(input.value);
//     const unitPrice = parseInt(row.children[5].textContent.replace(/[^0-9]/g, ''));
//     const total = unitPrice * quantity;
//     row.children[6].textContent = total.toLocaleString() + ' VNĐ';
//     updateTotalCost();
// }

// function addLocation() {
//     const locationId = document.getElementById('locationSelect').value;
//     if (!locationId) return;
//     const location = locations.find(l => l.id == locationId);
//     addLocationToTable(location);
//     updateTotalCost();
// }

// function addLocationToTable(location) {
//     const startDate = document.getElementById('startDateDisplay').value;
//     const endDate = document.getElementById('endDateDisplay').value;
//     let diffDays = 0;
//     if (startDate && endDate) {
//         const startDateObj = parseDate(startDate);
//         const endDateObj = parseDate(endDate);
//         const diffTime = Math.abs(endDateObj - startDateObj);
//         diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//     }
//     const row = document.createElement('tr');
//     row.innerHTML = `
//                 <td><img src="${location.image || 'assets/img/default.jpg'}" alt="${location.name}" width="50"></td>
//                 <td>${location.name}</td>
//                 <td>${location.supplierName || 'Không xác định'}</td>
//                 <td>${startDate || 'Chưa xác định'}</td>
//                 <td>${endDate || 'Chưa xác định'}</td>
//                 <td>${diffDays || 'Chưa xác định'}</td>
//                 <td>${location.pricePerDay.toLocaleString()} VNĐ</td>
//                 <td>${diffDays ? (location.pricePerDay * diffDays).toLocaleString() : '0'} VNĐ</td>
//                 <td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">Xóa</button></td>
//             `;
//     document.getElementById('locationTableBody').appendChild(row);
// }

// function removeRow(btn) {
//     btn.parentNode.parentNode.remove();
//     updateTotalCost();
// }

// function updateTotalCost() {
//     let total = 0;
//     const deviceRows = document.getElementById('deviceTableBody').children;
//     const serviceRows = document.getElementById('serviceTableBody').children;
//     const locationRows = document.getElementById('locationTableBody').children;
//     for (let row of deviceRows) total += parseInt(row.children[6].textContent.replace(/[^0-9]/g, ''));
//     for (let row of serviceRows) total += parseInt(row.children[6].textContent.replace(/[^0-9]/g, ''));
//     for (let row of locationRows) total += parseInt(row.children[7].textContent.replace(/[^0-9]/g, '')) || 0;
//     document.getElementById('totalCost').textContent = `${total.toLocaleString()} VNĐ`;
// }

// function addTimeline() {
//     const timelineDate = document.getElementById('timelineDateDisplay').value;
//     const timelineTime = document.getElementById('timelineTime').value;
//     const timelineDescription = document.getElementById('timelineDescription').value;
//     if (!timelineDate || !timelineTime || !timelineDescription) return;
//     const row = document.createElement('tr');
//     row.innerHTML = `
//                 <td>${timelineDate} ${timelineTime}</td>
//                 <td>${timelineDescription}</td>
//             `;
//     document.getElementById('timelineTableBody').appendChild(row);
//     document.getElementById('timelineDateDisplay').value = '';
//     document.getElementById('timelineDate').value = '';
//     document.getElementById('timelineTime').value = '';
//     document.getElementById('timelineDescription').value = '';
// }

// async function saveContract() {
//     if (!validateAndUpdateDates()) {
//         console.error('Vui lòng kiểm tra lại thời gian tổ chức!');
//         return;
//     }

//     const contract = {
//         contractType: document.getElementById('contractType').value,
//         name: document.getElementById('contractName').value,
//         customerName: document.getElementById('customerName').value,
//         phoneNumber: document.getElementById('phoneNumber').value,
//         startDate: toISODate(document.getElementById('startDateDisplay').value),
//         endDate: toISODate(document.getElementById('endDateDisplay').value),
//         provinceId: document.getElementById('province').value,
//         districtId: document.getElementById('district').value,
//         wardId: document.getElementById('ward').value,
//         addressDetail: document.getElementById('addressDetail').value,
//         contractDate: document.getElementById('contractDate').value,
//         totalCost: parseInt(document.getElementById('totalCost').textContent.replace(/[^0-9]/g, '')),
//         status: "draft",
//         devices: Array.from(document.getElementById('deviceTableBody').children).map(row => ({
//             deviceId: devices.find(d => d.name === row.children[1].textContent)?.id || row.children[1].textContent,
//             quantity: parseInt(row.children[4].querySelector('input').value)
//         })),
//         services: Array.from(document.getElementById('serviceTableBody').children).map(row => ({
//             serviceId: services.find(s => s.name === row.children[1].textContent)?.id || row.children[1].textContent,
//             quantity: parseInt(row.children[4].querySelector('input').value)
//         })),
//         locations: Array.from(document.getElementById('locationTableBody').children).map(row => ({
//             locationId: locations.find(l => l.name === row.children[1].textContent)?.id || row.children[1].textContent,
//             startDate: toISODate(document.getElementById('startDateDisplay').value),
//             endDate: toISODate(document.getElementById('endDateDisplay').value)
//         })),
//         timelines: Array.from(document.getElementById('timelineTableBody').children).map(row => ({
//             startTime: row.children[0].textContent,
//             description: row.children[1].textContent
//         })),
//         locationOption: document.getElementById('providerLocation').checked ? 'provider' : 'customer',
//         customLocation: document.getElementById('providerLocation').checked ? null : {
//             name: document.getElementById('customLocationName').value,
//             address: document.getElementById('customLocationAddress').value,
//             startDate: toISODate(document.getElementById('customStartDateDisplay').value),
//             endDate: toISODate(document.getElementById('customEndDateDisplay').value)
//         }
//     };

//     try {
//         const response = await fetchData(CONTRACT_API_URL, 'POST', contract);
//         console.log('Hợp đồng đã được lưu thành công!');
//         if (window.parent) {
//             window.parent.postMessage({
//                 type: 'newContract',
//                 contract: {
//                     id: response.id,
//                     name: response.name,
//                     total_price: response.totalCost,
//                     rental_start_time: response.startDate,
//                     rental_end_time: response.endDate,
//                     status: response.status || 'draft'
//                 }
//             }, '*');
//         }
//         closeModal();
//     } catch (error) {
//         console.error(`Lỗi khi lưu hợp đồng: ${error.message}`);
//     }
// }

// function updateLocationDates() {
//     const startDate = document.getElementById('startDateDisplay').value;
//     const endDate = document.getElementById('endDateDisplay').value;
//     if (!startDate || !endDate) return;

//     const startDateObj = parseDate(startDate);
//     const endDateObj = parseDate(endDate);
//     const diffTime = Math.abs(endDateObj - startDateObj);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//     const locationRows = document.getElementById('locationTableBody').children;
//     for (let row of locationRows) {
//         row.children[3].textContent = startDate;
//         row.children[4].textContent = endDate;
//         row.children[5].textContent = diffDays;
//         row.children[7].textContent = (parseInt(row.children[6].textContent.replace(/[^0-9]/g, '')) * diffDays).toLocaleString() + ' VNĐ';
//     }
//     updateTotalCost();
// }

// function toggleLocationForm() {
//     const providerForm = document.getElementById('providerLocationForm');
//     const customerForm = document.getElementById('customerLocationForm');
//     const isProvider = document.getElementById('providerLocation').checked;
//     providerForm.classList.toggle('active', isProvider);
//     customerForm.classList.toggle('active', !isProvider);
// }

// function closeModal() {
//     const modal = bootstrap.Modal.getInstance(document.getElementById('contractModal'));
//     modal.hide();
//     if (window.parent) window.parent.postMessage('closeIframe', '*');
// }

// async function fetchData(url, method = "GET", data = null) {
//     const token = getToken();
//     const options = {
//         method: method,
//         headers: { "Content-Type": "application/json" }
//     };
//     if (token) options.headers["Authorization"] = `Bearer ${token}`;
//     if (data) options.body = JSON.stringify(data);

//     try {
//         const response = await fetch(url, options);
//         if (!response.ok) throw new Error(`${method} thất bại! Status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         throw error;
//     }
// }

// document.addEventListener('DOMContentLoaded', initializeContractForm);
// //hiển thị item_detail trong contract
// function preloadItem(item) {
//     const { category, ...itemData } = item;

//     // Chuẩn hóa dữ liệu để phù hợp với bảng trong contract.html
//     const standardizedItem = {
//         id: itemData.id || Date.now().toString(),
//         name: itemData.name,
//         description: itemData.description || "Không có mô tả",
//         supplierName: itemData.user_id ? "Không xác định" : "Không xác định", // Có thể cải thiện nếu có API users
//         price: itemData.hourly_rental_fee || itemData.hourly_salary || 0, // Dùng cho thiết bị/dịch vụ
//         pricePerDay: itemData.hourly_rental_fee || 0, // Dùng cho địa điểm
//         image: itemData.image || "assets/img/default.jpg",
//     };

//     // Thêm vào bảng tương ứng dựa trên category
//     if (category === "device") {
//         addDeviceToTable(standardizedItem, 1);
//     } else if (category === "service") {
//         addServiceToTable(standardizedItem, 1);
//     } else if (category === "location") {
//         addLocationToTable(standardizedItem);
//     }

//     updateTotalCost(); // Cập nhật tổng tiền sau khi thêm
// }

// // Cập nhật hàm initializeContractForm để xử lý cả preloadItem (thay vì chỉ thêm mới, ta sửa trực tiếp hàm này)
// function initializeContractForm() {
//     const modal = new bootstrap.Modal(document.getElementById('contractModal'), {});
//     modal.show();

//     document.getElementById('contractDate').valueAsDate = new Date();

//     // Xử lý cho các input ngày trong Thông tin hợp đồng
//     setupDatePicker('startDateDisplay', 'startDate');
//     setupDatePicker('endDateDisplay', 'endDate');

//     // Xử lý cho địa điểm tùy chỉnh
//     setupDatePicker('customStartDateDisplay', 'customStartDate');
//     setupDatePicker('customEndDateDisplay', 'customEndDate');

//     // Xử lý cho timeline
//     setupDatePicker('timelineDateDisplay', 'timelineDate');

//     toggleLocationForm();
//     loadInitialData();

//     window.addEventListener("message", function (event) {
//         if (event.data.type === "preloadEvent" && event.data.event) {
//             console.log("Dữ liệu thiết bị nhận được:", event.data.event.device);
//             preloadEvent(event.data);
//         }
//         // Thêm xử lý cho preloadItem từ item_detail.html
//         if (event.data.type === "preloadItem" && event.data.item) {
//             console.log("Dữ liệu item nhận được:", event.data.item);
//             preloadItem(event.data.item);
//         }
//     });
// }
