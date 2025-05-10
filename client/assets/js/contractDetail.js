
const BASE_URL = "http://localhost:8080/event-management";
const CONTRACT_API_URL = `${BASE_URL}/api/contracts`;
const RENTAL_API_URL = `${BASE_URL}/rentals`;
const CUSTOMER_API_URL = `${BASE_URL}/customers`;
const EVENT_API_URL = `${BASE_URL}/event`;
const DEVICE_API_URL = `${BASE_URL}/devices`;
const SERVICE_API_URL = `${BASE_URL}/services`;
const LOCATION_API_URL = `${BASE_URL}/locations`;
const USER_API_URL = `${BASE_URL}/users`;
const DEVICE_RENTAL_API_URL = `${BASE_URL}/api/device-rentals`;
const SERVICE_RENTAL_API_URL = `${BASE_URL}/api/service-rentals`;
const LOCATION_RENTAL_API_URL = `${BASE_URL}/api/location-rentals`;
const TIMELINE_API_URL = `${BASE_URL}/timelines`;
const baseApiUrl = `${BASE_URL}/api/v1/FileUpload/files/`;
const defaultImagePath = 'assets/img/default.jpg';

let devices = [];
let services = [];
let locations = [];
let users = [];
let currentContract = null;

function getToken() {
    return localStorage.getItem("token");
}

function dinhDangTien(giaTri) {
    return (giaTri || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatDate(dateStr) {
    if (!dateStr) return 'Chưa xác định';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Chưa xác định';
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'Chưa xác định';
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return 'Chưa xác định';
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function fetchData(url, method = "GET", data = null) {
    const token = getToken();
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        }
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Lỗi khi gọi API ${url}:`, error);
        throw error;
    }
}

async function loadInitialData() {
    try {
        const deviceResponse = await fetchData(`${DEVICE_API_URL}/list`);
        devices = deviceResponse.data?.items || [];
        console.log("device: ", devices);

        const serviceResponse = await fetchData(`${SERVICE_API_URL}/list`);
        services = serviceResponse.data?.items || [];

        const locationResponse = await fetchData(`${LOCATION_API_URL}/list`);
        locations = locationResponse.data?.items || [];
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', error.message);
    }
}

function formatStatus(status) {
    switch (status) {
        case "Draft": return 'Bản nháp';
        case "DepositPaid": return 'Đã đặt cọc';
        case "InProgress": return 'Đang Thực Hiện';
        case "WaitingPaid": return 'Chờ Thanh Toán';
        case "Completed": return 'Đã Hoàn Thành';
        case "Cancel": return 'Đã hủy';
        case "AdminCancel": return 'Đã hủy bởi Admin';

        // default: return '<span class="badge bg-secondary">Unknown</span>';
    }
}
async function layChiTietHopDong(contractId) {
    try {
        var contract = await fetchData(`${CONTRACT_API_URL}/${contractId}`);
        contract = contract.result;
        if (!contract) throw new Error('Hợp đồng không tồn tại');

        const rental = await fetchData(`${RENTAL_API_URL}/${contract.rentalId}`);
        const event = await fetchData(`${EVENT_API_URL}/${rental.eventId}`);

        var deviceRentals = await fetchData(`${DEVICE_RENTAL_API_URL}/rental/${rental.id}`);
        deviceRentals = deviceRentals.result;
        const devicesData = deviceRentals.map(rental => {

            return {
                quantity: rental.quantity,
                name: rental?.deviceName || 'Không xác định',
                hourly_salary: rental?.pricePerDay || 0,
                image: rental?.image,
                supplierName: rental.supplierName || 'Không xác định'
            };
        });

        var serviceRentals = await fetchData(`${SERVICE_RENTAL_API_URL}/rental/${rental.id}`);
        serviceRentals = serviceRentals.result;
        const servicesData = serviceRentals.map(rental => {
            return {
                quantity: rental.quantity,
                name: rental?.serviceName || 'Không xác định',
                hourly_salary: rental?.pricePerDay || 0,
                image: rental?.image,
                supplierName: rental?.supplierName || 'Không xác định'
            };
        });

        var locationRentals = await fetchData(`${LOCATION_RENTAL_API_URL}/rental/${rental.id}`);
        locationRentals = locationRentals.result;
        const locationsData = locationRentals.map(rental => {
            return {
                quantity: rental.quantity,
                name: rental?.name || 'Không xác định',
                hourly_rental_fee: rental?.hourly_rental_fee || 0,
                image: rental?.image,
                supplierName: rental?.supplierName || 'Không xác định',
            };
        });

        var timelines = await fetchData(`${TIMELINE_API_URL}/rental/${rental.id}`);
        timelines = timelines.data;
        const timelinesData = timelines.map(timeline => ({
            time_start: timeline.time_start,
            description: timeline.description || 'Không có mô tả'
        }));

        const contractData = {
            id: contract.id,
            name: contract.name,
            status: formatStatus(contract.status),
            total_price: rental.totalPrice || 0,
            rental_start_time: rental.rentalStartTime,
            rental_end_time: rental.rentalEndTime,
            customerName: contract.customerName || 'Không có thông tin',
            customerPhone: contract.customerPhone || 'Không có thông tin',
            customerAddress: contract.address || 'Không có thông tin',
            eventName: event.name || 'Không xác định',
            eventDescription: event.description || 'Không có mô tả',
            devices: devicesData,
            services: servicesData,
            locations: locationsData,
            timelines: timelinesData
        };

        return contractData;
    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết hợp đồng ${contractId}:`, error.message);
        alert(`Lỗi khi lấy chi tiết hợp đồng: ${error.message}`);
        return null;
    }
}

function hienThiChiTietHopDong(contract) {
    if (!contract) {
        document.getElementById("contractName").textContent = "Không tìm thấy hợp đồng";
        return;
    }
    currentContract = contract;

    document.getElementById("contractName").textContent = contract.name || "Không xác định";
    document.getElementById("startDate").textContent = formatDate(contract.rental_start_time);
    document.getElementById("endDate").textContent = formatDate(contract.rental_end_time);
    document.getElementById("totalPrice").textContent = dinhDangTien(contract.total_price);
    document.getElementById("status").textContent = contract.status || "Draft";
    document.getElementById("customerName").textContent = contract.customerName;
    document.getElementById("customerPhone").textContent = contract.customerPhone;
    document.getElementById("customerAddress").textContent = contract.customerAddress;

    const deviceTableBody = document.getElementById("deviceTableBody");
    deviceTableBody.innerHTML = "";
    if (contract.devices.length === 0) {
        deviceTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không có thiết bị</td></tr>`;
    } else {
        contract.devices.forEach(device => {
            const total = device.hourly_salary * device.quantity;
            const imageUrl = device.image ? `${baseApiUrl}${device.image.split('/').pop()}` : defaultImagePath;
            const row = document.createElement("tr");
            row.innerHTML = `
                        <td><img src="${imageUrl}" alt="${device.name}" style="max-width: 50px;" onerror="this.src='${defaultImagePath}'"></td>
                        <td>${device.name}</td>
                        <td>${device.supplierName}</td>
                        <td>${device.quantity}</td>
                        <td>${dinhDangTien(device.hourly_salary)}</td>
                        <td>${dinhDangTien(total)}</td>
                    `;
            deviceTableBody.appendChild(row);
        });
    }

    const serviceTableBody = document.getElementById("serviceTableBody");
    serviceTableBody.innerHTML = "";
    if (contract.services.length === 0) {
        serviceTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không có dịch vụ</td></tr>`;
    } else {
        contract.services.forEach(service => {
            const total = service.hourly_salary * service.quantity;
            const imageUrl = service.image ? `${baseApiUrl}${service.image.split('/').pop()}` : defaultImagePath;
            const row = document.createElement("tr");
            row.innerHTML = `
                        <td><img src="${imageUrl}" alt="${service.name}" style="max-width: 50px;" onerror="this.src='${defaultImagePath}'"></td>
                        <td>${service.name}</td>
                        <td>${service.supplierName}</td>
                        <td>${service.quantity}</td>
                        <td>${dinhDangTien(service.hourly_salary)}</td>
                        <td>${dinhDangTien(total)}</td>
                    `;
            serviceTableBody.appendChild(row);
        });
    }

    const locationTableBody = document.getElementById("locationTableBody");
    locationTableBody.innerHTML = "";
    if (contract.locations.length === 0) {
        locationTableBody.innerHTML = `<tr><td colspan="8" class="text-center">Không có địa điểm</td></tr>`;
    } else {
        contract.locations.forEach(location => {
            const startDate = new Date(contract.rental_start_time);
            const endDate = new Date(contract.rental_end_time);
            const diffTime = Math.abs(endDate - startDate);
            const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const total = location.hourly_rental_fee * rentalDays;
            const imageUrl = location.image ? `${baseApiUrl}${location.image.split('/').pop()}` : defaultImagePath;
            const row = document.createElement("tr");
            row.innerHTML = `
                        <td><img src="${imageUrl}" alt="${location.name}" style="max-width: 50px;" onerror="this.src='${defaultImagePath}'"></td>
                        <td>${location.name}</td>
                        <td>${location.supplierName}</td>
                        <td>${formatDate(contract.rental_start_time)}</td>
                        <td>${formatDate(contract.rental_end_time)}</td>
                        <td>${rentalDays}</td>
                        <td>${dinhDangTien(location.hourly_rental_fee)}</td>
                        <td>${dinhDangTien(total)}</td>
                    `;
            locationTableBody.appendChild(row);
        });
    }

    const timelineTableBody = document.getElementById("timelineTableBody");
    timelineTableBody.innerHTML = "";
    if (contract.timelines.length === 0) {
        timelineTableBody.innerHTML = `<tr><td colspan="2" class="text-center">Không có lịch trình</td></tr>`;
    } else {
        contract.timelines.forEach(timeline => {
            const row = document.createElement("tr");
            row.innerHTML = `
                        <td>${formatDateTime(timeline.time_start)}</td>
                        <td>${timeline.description}</td>
                    `;
            timelineTableBody.appendChild(row);
        });
    }

    document.getElementById("draftDate").textContent = new Date().toLocaleDateString("vi-VN");
    document.getElementById("draftCustomerName").textContent = contract.customerName;
    document.getElementById("draftCustomerAddress").textContent = contract.customerAddress;
    document.getElementById("draftCustomerPhone").textContent = contract.customerPhone;
    document.getElementById("draftContractName").textContent = contract.name;
    document.getElementById("draftStartDate").textContent = formatDate(contract.rental_start_time);
    document.getElementById("draftEndDate").textContent = formatDate(contract.rental_end_time);
    document.getElementById("draftLocation").textContent = contract.locations.length
        ? contract.locations[0].name
        : contract.customerAddress || "Không xác định";
    document.getElementById("draftTotalPrice").textContent = dinhDangTien(contract.total_price);

    const draftDeviceTableBody = document.getElementById("draftDeviceTableBody");
    draftDeviceTableBody.innerHTML = "";
    contract.devices.forEach((device, index) => {
        const total = device.hourly_salary * device.quantity;
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${device.name}</td>
                    <td>${device.quantity}</td>
                    <td>${dinhDangTien(device.hourly_salary)}</td>
                    <td>${dinhDangTien(total)}</td>
                `;
        draftDeviceTableBody.appendChild(row);
    });

    const draftServiceTableBody = document.getElementById("draftServiceTableBody");
    draftServiceTableBody.innerHTML = "";
    contract.services.forEach((service, index) => {
        const total = service.hourly_salary * service.quantity;
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${service.name}</td>
                    <td>${service.quantity}</td>
                    <td>${dinhDangTien(service.hourly_salary)}</td>
                    <td>${dinhDangTien(total)}</td>
                `;
        draftServiceTableBody.appendChild(row);
    });

    const draftLocationTableBody = document.getElementById("draftLocationTableBody");
    draftLocationTableBody.innerHTML = "";
    contract.locations.forEach((location, index) => {
        const startDate = new Date(contract.rental_start_time);
        const endDate = new Date(contract.rental_end_time);
        const diffTime = Math.abs(endDate - startDate);
        const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const total = location.hourly_rental_fee * rentalDays;
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${location.name}</td>
                    <td>${location.supplierName}</td>
                    <td>${formatDate(contract.rental_start_time)}</td>
                    <td>${formatDate(contract.rental_end_time)}</td>
                    <td>${rentalDays}</td>
                    <td>${dinhDangTien(location.hourly_rental_fee)}</td>
                    <td>${dinhDangTien(total)}</td>
                `;
        draftLocationTableBody.appendChild(row);
    });

    const draftTimelineTableBody = document.getElementById("draftTimelineTableBody");
    draftTimelineTableBody.innerHTML = "";
    contract.timelines.forEach((timeline, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${formatDateTime(timeline.time_start)}</td>
                    <td>${timeline.description}</td>
                `;
        draftTimelineTableBody.appendChild(row);
    });
}

function generateWordDocument() {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 28 })],
                        alignment: "center",
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, underline: true, size: 24 })],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "HỢP ĐỒNG DỊCH VỤ", bold: true, size: 32 })],
                        alignment: "center",
                        spacing: { after: 300 },
                    }),
                    new Paragraph({ children: [new TextRun({ text: `- Căn cứ Bộ luật dân sự 2015;`, italics: true })] }),
                    new Paragraph({ children: [new TextRun({ text: `- Căn cứ sự thỏa thuận của 2 bên;`, italics: true })] }),
                    new Paragraph({
                        children: [new TextRun({ text: `Hôm nay, ngày ${document.getElementById("draftDate").textContent}, chúng tôi gồm:` })],
                        spacing: { after: 200 },
                    }),
                    new Paragraph({ children: [new TextRun({ text: "BÊN THUÊ DỊCH VỤ (sau đây gọi là Bên A)", bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: `TÊN: ${document.getElementById("draftCustomerName").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `ĐỊA CHỈ: ${document.getElementById("draftCustomerAddress").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `SỐ ĐIỆN THOẠI: ${document.getElementById("draftCustomerPhone").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: "BÊN CHO THUÊ DỊCH VỤ (sau đây gọi là Bên B)", bold: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "TÊN CÔNG TY: CÔNG TY TNHH DỊCH VỤ MYEVENT" })] }),
                    new Paragraph({ children: [new TextRun({ text: "ĐẠI DIỆN:  Ông/Bà Huyền Hạnh Minh Trinh Long" })] }),
                    new Paragraph({ children: [new TextRun({ text: "CHỨC DANH: GIÁM ĐỐC" })] }),
                    new Paragraph({ children: [new TextRun({ text: "ĐỊA CHỈ: K384 Điện Biên Phủ, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng" })] }),
                    new Paragraph({ children: [new TextRun({ text: "SỐ ĐIỆN THOẠI: 0819901400" })] }),
                    new Paragraph({ children: [new TextRun({ text: "Hai bên thỏa thuận ký kết hợp đồng này với các điều khoản sau:" })] }),
                    new Paragraph({ children: [new TextRun({ text: "Điều 1: Nội dung dịch vụ thực hiện", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "Bên B cam kết lên kế hoạch và tổ chức sự kiện cho Bên A theo bảng danh mục bên dưới." })] }),
                    new Paragraph({ children: [new TextRun({ text: `Tên sự kiện: ${document.getElementById("draftContractName").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Thời gian thực hiện: Từ ngày ${document.getElementById("draftStartDate").textContent} đến ngày ${document.getElementById("draftEndDate").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: `Địa điểm: ${document.getElementById("draftLocation").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: "Bảng danh mục thiết bị", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Tên thiết bị")] }),
                                    new TableCell({ children: [new Paragraph("Số lượng")] }),
                                    new TableCell({ children: [new Paragraph("Đơn giá")] }),
                                    new TableCell({ children: [new Paragraph("Thành tiền")] }),
                                ],
                            }),
                            ...Array.from(document.getElementById("draftDeviceTableBody").children).map((row, index) => {
                                const cells = row.children;
                                return new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                        new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[3].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[4].textContent)] }),
                                    ],
                                });
                            }),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    new Paragraph({ children: [new TextRun({ text: "Bảng danh mục dịch vụ", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Tên dịch vụ")] }),
                                    new TableCell({ children: [new Paragraph("Số lượng")] }),
                                    new TableCell({ children: [new Paragraph("Đơn giá")] }),
                                    new TableCell({ children: [new Paragraph("Thành tiền")] }),
                                ],
                            }),
                            ...Array.from(document.getElementById("draftServiceTableBody").children).map((row, index) => {
                                const cells = row.children;
                                return new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                        new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[3].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[4].textContent)] }),
                                    ],
                                });
                            }),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    new Paragraph({ children: [new TextRun({ text: "Bảng danh mục địa điểm", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Tên địa điểm")] }),
                                    new TableCell({ children: [new Paragraph("Nhà cung cấp")] }),
                                    new TableCell({ children: [new Paragraph("Từ ngày")] }),
                                    new TableCell({ children: [new Paragraph("Đến ngày")] }),
                                    new TableCell({ children: [new Paragraph("Số ngày thuê")] }),
                                    new TableCell({ children: [new Paragraph("Đơn giá/Ngày")] }),
                                    new TableCell({ children: [new Paragraph("Thành tiền")] }),
                                ],
                            }),
                            ...Array.from(document.getElementById("draftLocationTableBody").children).map((row, index) => {
                                const cells = row.children;
                                return new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                        new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[3].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[4].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[5].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[6].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[7].textContent)] }),
                                    ],
                                });
                            }),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    new Paragraph({ children: [new TextRun({ text: "Bảng lịch trình dự kiến sự kiện", bold: true })], alignment: "center" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Thời gian")] }),
                                    new TableCell({ children: [new Paragraph("Mô tả")] }),
                                ],
                            }),
                            ...Array.from(document.getElementById("draftTimelineTableBody").children).map((row, index) => {
                                const cells = row.children;
                                return new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                                        new TableCell({ children: [new Paragraph(cells[1].textContent)] }),
                                        new TableCell({ children: [new Paragraph(cells[2].textContent)] }),
                                    ],
                                });
                            }),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        },
                    }),
                    new Paragraph({ children: [new TextRun({ text: "Điều 2: Giá trị dịch vụ – Phương thức thanh toán", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: `2.1 Giá trị dịch vụ: ${document.getElementById("draftTotalPrice").textContent}` })] }),
                    new Paragraph({ children: [new TextRun({ text: "2.2 Phương thức thanh toán: Thanh toán bằng tiền mặt hoặc chuyển khoản." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Bên A thực hiện đặt cọc 30% giá trị hợp đồng." })] }),
                    new Paragraph({ children: [new TextRun({ text: "- Bên A thanh toán 100% giá trị dịch vụ trong 5 ngày làm việc." })] }),
                    new Paragraph({ children: [new TextRun({ text: "Điều 3: Thời hạn thỏa thuận", bold: true, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "Thời gian hiệu lực hợp đồng: Từ khi ký kết đến khi thanh toán hợp đồng." })] }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "ĐẠI DIỆN BÊN A", bold: true, allCaps: true }),
                            new TextRun({ text: "                          " }),
                            new TextRun({ text: "ĐẠI DIỆN BÊN B", bold: true, allCaps: true }),
                        ],
                        spacing: { before: 600 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "(Ký tên, đóng dấu)", italics: true }),
                            new TextRun({ text: "                          " }),
                            new TextRun({ text: "(Ký tên, đóng dấu)", italics: true }),
                        ],
                    }),
                ],
            },
        ],
    });
    Packer.toBlob(doc)
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `HopDongDichVu_${currentContract.id}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
            alert(`Lỗi khi tạo file Word: ${error.message}`);
        });
}

async function uploadFile(file, contractId) {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contractId", contractId);

        const response = await fetch(`${BASE_URL}/api/files/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) throw new Error(`Tải lên thất bại: ${response.statusText}`);
        const result = await response.json();
        console.log("Tải lên file thành công:", result);
        return result;
    } catch (error) {
        console.error(`Lỗi khi tải lên file: ${error.message}`);
        throw error;
    }
}

window.onload = async function () {
    // const preloader = document.getElementById("preloader");
    // preloader.style.display = "flex";

    const urlParams = new URLSearchParams(window.location.search);
    const contractId = urlParams.get("id");



    if (!contractId) {
        document.getElementById("contractName").textContent = "Không tìm thấy hợp đồng";
        preloader.style.display = "none";
        return;
    }

    // contractDraft.style.display = "none";

    await loadInitialData();
    const contract = await layChiTietHopDong(contractId);
    if (!contract) return;

    hienThiChiTietHopDong(contract);

    const contractDraft = document.querySelector(".contract-draft");
    const showDraftButton = document.getElementById("showDraftButton");
    const exportDraftButton = document.getElementById("exportDraftButton");
    const uploadSignedDocument = document.getElementById("uploadSignedDocument");
    const scrollTop = document.getElementById("scroll-top");

    showDraftButton.addEventListener("click", () => {
        contractDraft.classList.toggle("show");
        contractDraft.style.display = contractDraft.classList.contains("show") ? "block" : "none";
        showDraftButton.textContent = contractDraft.classList.contains("show")
            ? "Ẩn Bản Thảo Hợp Đồng"
            : "Xem Bản Thảo Hợp Đồng";
        exportDraftButton.style.display = contractDraft.classList.contains("show")
            ? "inline-block"
            : "none";
    });

    exportDraftButton.addEventListener("click", () => {
        if (currentContract) {
            generateWordDocument();
        } else {
            alert("Không có dữ liệu hợp đồng để xuất!");
        }
    });

    uploadSignedDocument.addEventListener("click", async () => {
        const fileInput = document.getElementById("signedDocument");
        const file = fileInput.files[0];
        if (!file) {
            alert("Vui lòng chọn file để tải lên!");
            return;
        }
        if (!currentContract) {
            alert("Không có hợp đồng để liên kết với file!");
            return;
        }
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
            alert("Chỉ hỗ trợ file PDF hoặc Word!");
            return;
        }
        try {
            preloader.style.display = "flex";
            await uploadFile(file, currentContract.id);
            alert("Tải lên hợp đồng đã ký thành công!");
            fileInput.value = "";
            preloader.style.display = "none";
        } catch (error) {
            preloader.style.display = "none";
            alert(`Lỗi khi tải lên: ${error.message}`);
        }
    });

    window.addEventListener("scroll", () => {
        scrollTop.classList.toggle("show", window.scrollY > 200);
    });

    scrollTop.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};