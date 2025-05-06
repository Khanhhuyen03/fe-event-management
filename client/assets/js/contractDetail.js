// Dữ liệu mẫu tĩnh
const sampleContract = {
    createdAt: "2025-05-04T00:00:00Z",
    name: "Sự kiện Công ty ABC",
    status: "Draft",
    rental: {
        rentalStartTime: "2025-05-01T00:00:00Z",
        rentalEndTime: "2025-05-03T00:00:00Z",
        totalPrice: 50000000,
        devices: [
            { id: 1, name: "Micro", description: "Micro chuyên dụng", hourlyRentalFee: 500000, quantity: 2, img: "device1.jpg" },
            { id: 2, name: "Loa", description: "Loa công suất lớn", hourlyRentalFee: 1000000, quantity: 1, img: "device2.jpg" }
        ],
        humanResources: [
            { id: 1, name: "MC", description: "MC chuyên nghiệp", hourlySalary: 2000000, quantity: 1, img: "hr1.jpg" }
        ],
        locations: [
            { id: 1, name: "Hội trường A", address: "123 Đường ABC", description: "Hội trường 500 chỗ", hourlyRentalFee: 3000000, img: "location1.jpg" }
        ],
        timelines: [
            { startTime: "2025-05-01T09:00:00Z", description: "Khai mạc sự kiện" },
            { startTime: "2025-05-01T12:00:00Z", description: "Tiệc trưa" }
        ],
        user: { firstName: "Nguyễn", lastName: "Văn A", email: "nguyenvana@example.com" }
    },
    customer: { address: "456 Đường XYZ", phoneNumber: "0905123456", name: "Khách Hàng A" }
};

const contractDiffDate = dayjs(sampleContract.rental.rentalEndTime).diff(dayjs(sampleContract.rental.rentalStartTime), 'day') + 1;

// Hiển thị thông tin hợp đồng
document.getElementById("contractName").textContent = sampleContract.name.toUpperCase();
document.getElementById("startDate").textContent = dayjs(sampleContract.rental.rentalStartTime).format("DD/MM/YYYY");
document.getElementById("endDate").textContent = dayjs(sampleContract.rental.rentalEndTime).format("DD/MM/YYYY");
document.getElementById("totalPrice").textContent = formatCurrency(sampleContract.rental.totalPrice);
document.getElementById("customerName").textContent = sampleContract.customer.name;
document.getElementById("customerPhone").textContent = sampleContract.customer.phoneNumber;
document.getElementById("customerAddress").textContent = sampleContract.customer.address;

// Hiển thị trạng thái
const statusTag = document.getElementById("contractStatus");
statusTag.innerHTML = `<span class="ml-4"><span class="${getStatusClass(sampleContract.status)}">${getStatusText(sampleContract.status)}</span></span>`;

// Hiển thị nút hành động dựa trên trạng thái
const depositBtn = document.getElementById("depositBtn");
const payBtn = document.getElementById("payBtn");
const cancelBtn = document.getElementById("cancelBtn");

if (sampleContract.status === "Draft") depositBtn.classList.remove("hidden");
if (sampleContract.status === "WaitingPaid") payBtn.classList.remove("hidden");
if (["DepositPaid", "InProgress"].includes(sampleContract.status)) cancelBtn.classList.remove("hidden");

// Tạo bảng thiết bị
if (sampleContract.rental.devices.length > 0) {
    const devicesTable = document.getElementById("devicesTable");
    devicesTable.classList.remove("hidden");
    devicesTable.innerHTML = `
        <table>
            <tr><th>Tên thiết bị</th><th>Hình ảnh</th><th>Mô tả</th><th>Số lượng</th><th>Đơn giá / ngày</th><th>Thành tiền</th></tr>
            ${sampleContract.rental.devices.map(device => `
                <tr>
                    <td>${device.name}</td>
                    <td><img src="${device.img}" alt="device" width="50" height="50"></td>
                    <td>${device.description}</td>
                    <td>${device.quantity}</td>
                    <td>${formatCurrency(device.hourlyRentalFee)}</td>
                    <td>${formatCurrency(device.hourlyRentalFee * device.quantity * contractDiffDate)}</td>
                </tr>
            `).join('')}
            <tr><th colspan="5">Tổng chi phí</th><td>${formatCurrency(sampleContract.rental.devices.reduce((sum, d) => sum + (d.hourlyRentalFee * d.quantity * contractDiffDate), 0))}</td><td></td></tr>
        </table>`;
}

// Tạo bảng nhân lực
if (sampleContract.rental.humanResources.length > 0) {
    const humanResourcesTable = document.getElementById("humanResourcesTable");
    humanResourcesTable.classList.remove("hidden");
    humanResourcesTable.innerHTML = `
        <table>
            <tr><th>Tên loại hình</th><th>Hình ảnh</th><th>Mô tả</th><th>Số lượng</th><th>Đơn giá / ngày</th><th>Thành tiền</th></tr>
            ${sampleContract.rental.humanResources.map(hr => `
                <tr>
                    <td>${hr.name}</td>
                    <td><img src="${hr.img}" alt="hr" width="50" height="50"></td>
                    <td>${hr.description}</td>
                    <td>${hr.quantity}</td>
                    <td>${formatCurrency(hr.hourlySalary)}</td>
                    <td>${formatCurrency(hr.hourlySalary * hr.quantity * contractDiffDate)}</td>
                </tr>
            `).join('')}
            <tr><th colspan="5">Tổng chi phí</th><td>${formatCurrency(sampleContract.rental.humanResources.reduce((sum, hr) => sum + (hr.hourlySalary * hr.quantity * contractDiffDate), 0))}</td><td></td></tr>
        </table>`;
}

// Tạo bảng địa điểm
if (sampleContract.rental.locations.length > 0) {
    const locationsTable = document.getElementById("locationsTable");
    locationsTable.classList.remove("hidden");
    locationsTable.innerHTML = `
        <table>
            <tr><th>Tên địa điểm</th><th>Địa chỉ</th><th>Hình ảnh</th><th>Mô tả</th><th>Đơn giá / ngày</th><th>Thành tiền</th></tr>
            ${sampleContract.rental.locations.map(location => `
                <tr>
                    <td>${location.name}</td>
                    <td>${location.address}</td>
                    <td><img src="${location.img}" alt="location" width="50" height="50"></td>
                    <td>${location.description}</td>
                    <td>${formatCurrency(location.hourlyRentalFee)}</td>
                    <td>${formatCurrency(location.hourlyRentalFee * contractDiffDate)}</td>
                </tr>
            `).join('')}
            <tr><th colspan="5">Tổng chi phí</th><td>${formatCurrency(sampleContract.rental.locations.reduce((sum, l) => sum + (l.hourlyRentalFee * contractDiffDate), 0))}</td><td></td></tr>
        </table>`;
}

// Hiển thị lịch trình nếu có
if (sampleContract.rental.timelines.length > 0) {
    const timelineSection = document.getElementById("timelineSection");
    const timelineList = document.getElementById("timelineList");
    timelineSection.style.display = "block";
    timelineList.innerHTML = `
        <ul class="list-disc pl-5">
            ${sampleContract.rental.timelines.map(timeline => `
                <li><strong>${dayjs(timeline.startTime).format("YYYY-MM-DD HH:mm")}</strong>: ${timeline.description}</li>
            `).join('')}
        </ul>`;
}

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm lấy lớp CSS và văn bản trạng thái
function getStatusClass(status) {
    switch (status) {
        case "Draft": return "bg-black text-white px-2 py-1 rounded";
        case "Cancel": case "AdminCancel": return "bg-red-500 text-white px-2 py-1 rounded";
        default: return "bg-green-600 text-white px-2 py-1 rounded";
    }
}

function getStatusText(status) {
    switch (status) {
        case "Draft": return "Bản nháp";
        case "Cancel": case "AdminCancel": return "Đã hủy";
        default: return "Chính thức";
    }
}

// Xử lý xem bản thảo hợp đồng và xuất file Word
document.getElementById("viewContractBtn").addEventListener("click", () => {
    const contractHtml = document.getElementById("contractHtml");
    contractHtml.innerHTML = createEventContract(sampleContract);
    contractHtml.classList.remove("hidden");

    const ribbon = document.createElement("div");
    ribbon.className = "ribbon relative";
    const ribbonWrap = document.createElement("div");
    ribbonWrap.className = "ribbon-wrap";
    const ribbonText = document.createElement("div");
    ribbonText.className = `ribbon-text ${getStatusClass(sampleContract.status)}`;
    ribbonText.textContent = getStatusText(sampleContract.status);
    ribbonWrap.appendChild(ribbonText);
    ribbon.appendChild(ribbonWrap);
    contractHtml.insertBefore(ribbon, contractHtml.firstChild);

    // Thêm nút xuất file Word
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Xuất file Word";
    exportBtn.className = "bg-blue-500 text-white px-4 py-2 rounded mt-2";
    exportBtn.addEventListener("click", exportToWord);
    contractHtml.appendChild(exportBtn);
});

// Hàm xuất file Word
function exportToWord() {
    const contract = sampleContract;
    const dayDiff = dayjs(contract.rental.rentalEndTime).diff(dayjs(contract.rental.rentalStartTime), 'day') + 1;
    const serviceDataCollection = contract.rental.services || [];

    const doc = new docx.Document({
        sections: [
            {
                properties: {},
                children: [
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                                bold: true,
                                font: "Times New Roman",
                                size: 24,
                                alignment: docx.AlignmentType.CENTER
                            })
                        ],
                        spacing: { after: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Độc lập - Tự do - Hạnh phúc",
                                bold: true,
                                underline: { type: docx.UnderlineType.SINGLE },
                                font: "Times New Roman",
                                size: 24,
                                alignment: docx.AlignmentType.CENTER
                            })
                        ],
                        spacing: { after: 400 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "HỢP ĐỒNG DỊCH VỤ",
                                bold: true,
                                font: "Times New Roman",
                                size: 24,
                                alignment: docx.AlignmentType.CENTER
                            })
                        ],
                        spacing: { before: 200, after: 800 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Căn cứ Bộ luật dân sự 2015;",
                                italics: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Căn cứ sự thỏa thuận của 2 bên",
                                italics: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { after: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Hôm nay, ngày ${dayjs(contract.createdAt).format('DD/MM/YYYY')} chúng tôi gồm:`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { after: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "BÊN THUÊ DỊCH VỤ (sau đây gọi là Bên A)",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `TÊN: Ông/Bà ${contract.rental.user.firstName} ${contract.rental.user.lastName}`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `ĐỊA CHỈ: ${contract.customer.address}`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `SỐ ĐIỆN THOẠI: ${contract.customer.phoneNumber}`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `EMAIL: ${contract.rental.user.email}`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { after: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "BÊN CHO THUÊ DỊCH VỤ (sau đây gọi là Bên B)",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `TÊN CÔNG TY: CÔNG TY TRÁCH NHIỆM HỮU HẠN DỊCH VỤ CAMILLE`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `ĐẠI DIỆN: Ông/Bà NGUYỄN VĂN A - Chức danh: GIÁM ĐỐC`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `ĐỊA CHỈ: 385 Hải Phòng, Phường Tân Chính, Quận Thanh Khê, Thành phố Đà Nẵng`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `SỐ ĐIỆN THOẠI: +8432454783`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `EMAIL: camille.event@gmail.com`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { after: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Hai bên thỏa thuận ký kết hợp đồng này với các điều khoản sau:",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200, after: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "ĐIỀU 1: NỘI DUNG DỊCH VỤ THỰC HIỆN",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Bên B cam kết lên kế hoạch và tổ chức sự kiện cho bên A theo bảng danh mục bên dưới.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Tên sự kiện: ${contract.name}`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Thời gian thực hiện: Từ ngày ${dayjs(contract.rental.rentalStartTime).format('DD/MM/YYYY')} đến ngày ${dayjs(contract.rental.rentalEndTime).format('DD/MM/YYYY')}`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ]
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Địa điểm: ${contract.rental.locations.length ? `${contract.rental.locations[0].name} - ${contract.rental.locations[0].address}` : contract.customer.address}`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { after: 200 }
                    }),
                    // Service Table
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Bảng danh mục các dịch vụ kèm theo của sự kiện",
                                bold: true,
                                font: "Times New Roman",
                                size: 24,
                                alignment: docx.AlignmentType.CENTER
                            })
                        ],
                        spacing: { before: 200, after: 100 }
                    }),
                    new docx.Table({
                        width: { size: 100, type: docx.WidthType.PERCENTAGE },
                        borders: {
                            top: { style: docx.BorderStyle.SINGLE, size: 1 },
                            bottom: { style: docx.BorderStyle.SINGLE, size: 1 },
                            left: { style: docx.BorderStyle.SINGLE, size: 1 },
                            right: { style: docx.BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: docx.BorderStyle.SINGLE, size: 1 }
                        },
                        rows: [
                            new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "STT", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "Tên dịch vụ", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "Mô tả", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "Số lượng", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "Đơn giá / ngày", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "Thành tiền", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "Đơn vị tiền", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    })
                                ]
                            }),
                            ...serviceDataCollection.map((item, index) => new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: `${index + 1}`, alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: item.name, alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: item.description, alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: `${item.quantity}`, alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: formatCurrency(item.price), alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: formatCurrency(item.price * item.quantity * dayDiff), alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "VNĐ", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    })
                                ]
                            })),
                            new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "TỔNG CHI PHÍ", bold: true, alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        columnSpan: 5,
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: formatCurrency(contract.rental.totalPrice), alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({ text: "VNĐ", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                        verticalAlign: docx.VerticalAlign.CENTER
                                    })
                                ]
                            })
                        ]
                    }),
                    // Timeline Table (if exists)
                    ...(contract.rental.timelines.length ? [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Bảng lịch trình dự kiến sự kiện",
                                    bold: true,
                                    font: "Times New Roman",
                                    size: 24,
                                    alignment: docx.AlignmentType.CENTER
                                })
                            ],
                            spacing: { before: 400, after: 100 }
                        }),
                        new docx.Table({
                            width: { size: 100, type: docx.WidthType.PERCENTAGE },
                            borders: {
                                top: { style: docx.BorderStyle.SINGLE, size: 1 },
                                bottom: { style: docx.BorderStyle.SINGLE, size: 1 },
                                left: { style: docx.BorderStyle.SINGLE, size: 1 },
                                right: { style: docx.BorderStyle.SINGLE, size: 1 },
                                insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 1 },
                                insideVertical: { style: docx.BorderStyle.SINGLE, size: 1 }
                            },
                            rows: [
                                new docx.TableRow({
                                    children: [
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({ text: "STT", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                            verticalAlign: docx.VerticalAlign.CENTER
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({ text: "Thời gian", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                            verticalAlign: docx.VerticalAlign.CENTER
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({ text: "Mô tả", alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                            verticalAlign: docx.VerticalAlign.CENTER
                                        })
                                    ]
                                }),
                                ...contract.rental.timelines.map((item, index) => new docx.TableRow({
                                    children: [
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({ text: `${index + 1}`, alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                            verticalAlign: docx.VerticalAlign.CENTER
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({ text: dayjs(item.startTime).format('YYYY-MM-DD HH:mm'), alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                            verticalAlign: docx.VerticalAlign.CENTER
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({ text: item.description, alignment: docx.AlignmentType.CENTER, style: { font: "Times New Roman", size: 24 } })],
                                            verticalAlign: docx.VerticalAlign.CENTER
                                        })
                                    ]
                                }))
                            ]
                        })
                    ] : []),
                    // Article 2
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "ĐIỀU 2: GIÁ TRỊ DỊCH VỤ – PHƯƠNG THỨC THANH TOÁN",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 400 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `2.1 Giá trị dịch vụ: ${formatCurrency(contract.rental.totalPrice)} VNĐ`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "2.2 Ngay khi bên B thực hiện cung cấp dịch vụ theo quy định của Điều 1, hai bên sẽ thống nhất và ký kết biên bản thanh lý hợp đồng trong đó có ghi rõ những hạng mục còn thiếu hoặc phát sinh (nếu có). Việc bỏ bớt hoặc bổ sung hạng mục (nếu có) phải được Bên A chấp thuận trước bằng văn bản, giá trị dịch vụ ghi trong biên bản thanh lý hợp đồng sẽ là giá trị thanh toán cuối cùng",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "2.3 Phương thức thanh toán: (Thanh toán bằng tiền mặt hoặc chuyển khoản)",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Bên A thực hiện đặt cọc 30% giá trị hợp đồng cho bên B.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Bên A sẽ thanh toán bằng tiền mặt hoặc chuyển khoản cho bên B 100% phần giá trị dịch vụ kể trên và phát sinh (nếu có) căn cứ trên Biên bản thanh lý hợp đồng trong thời gian 5 ngày làm việc kể từ khi kết thúc thời gian thực hiện chương trình và bên A nhận được biên bản thanh lý hợp đồng và hóa đơn tài chính hợp pháp của bên B.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 },
                        spacing: { after: 200 }
                    }),
                    // Article 3
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "ĐIỀU 3: THỜI HẠN THỎA THUẬN",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "3.1 Thời gian hiệu lực hợp đồng: Bắt đầu từ khi bản hợp đồng này được ký kết đến khi thanh toán hợp đồng kèm theo biên bản thanh lý hợp đồng này.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "3.2 Trong trường hợp hết thời gian hiệu lực ghi trong hợp đồng mà bên A chưa thanh toán dứt điểm các khoản tiền liên quan đến hợp đồng này thì thời gian hiệu lực của hợp đồng sẽ mặc nhiên được gia hạn cho đến khi các khoản tiền được thanh toán dứt điểm cho bên B và hợp đồng này mặc nhiên được cả hai bên A và B coi như đã được thanh lý.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "3.3 Trường hợp một trong hai bên vi phạm bất kỳ điều khoản nào trong bản hợp đồng này hoặc các phụ lục hoặc văn bản bổ sung đính kèm có liên quan đến hợp đồng này thì bên bị vi phạm được quyền chấm dứt trước thời hạn. Bên vi phạm phải bồi thường cho bên bị vi phạm những thiệt hại do việc vi phạm này của mình gây ra.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100, after: 200 }
                    }),
                    // Article 4
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "ĐIỀU 4: QUYỀN LỢI VÀ NGHĨA VỤ CỦA BÊN A",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "4.1 Quyền lợi của bên A:",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Nhận được dịch vụ tốt nhất và đầy đủ nhất do bên B cung cấp.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Quản lý và giám sát các hoạt động do bên B cung cấp và thực hiện.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "4.2 Nghĩa vụ của bên A:",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Thanh toán cho bên B theo như thỏa thuận tại điều 2.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Phối hợp với bên B giải quyết các vấn đề phát sinh xảy ra trong chương trình thuộc về trách nhiệm của bên A.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 },
                        spacing: { after: 200 }
                    }),
                    // Article 5
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "ĐIỀU 5: QUYỀN LỢI VÀ NGHĨA VỤ CỦA BÊN B",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "5.1 Quyền lợi của bên B:",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Nhận được đầy đủ thanh toán của bên A như điều 2.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "5.2 Nghĩa vụ của bên B:",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Bảo đảm tuyển dụng, cung cấp cho bên A các hạng mục đã nêu với số lượng, chất lượng như yêu cầu.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Trong quá trình diễn ra chương trình, Bên B cam kết sẽ trực tiếp theo dõi, giám sát, ghi chép và chụp hình lại trong biên bản nghiệm thu bàn giao cho Bên A.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Cung cấp hóa đơn tài chính hợp pháp đối với dịch vụ cung cấp theo hợp đồng này và các hạng mục phát sinh được bên A chấp thuận (nếu có).",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Phối hợp với bên A giải quyết các vấn đề phát sinh xảy ra trong chương trình thuộc về trách nhiệm của bên B.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Bên B sẽ không chịu trách nhiệm về những dịch vụ nào khác ngoài nội dung và Bảng danh mục dịch vụ.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "- Bên B cam kết không cung cấp và tiết lộ bất kỳ thông tin nào liên quan trực tiếp hay gián tiếp đến sản phẩm của Bên A cũng như các nội dung khác cho bất kỳ bên thứ ba nào mà không có sự đồng ý trước của Bên A bằng văn bản.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        indent: { left: 200 },
                        spacing: { after: 200 }
                    }),
                    // Article 6
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "ĐIỀU 6: GIẢI QUYẾT TRANH CHẤP",
                                bold: true,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 200 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Mọi tranh chấp liên quan đến Hợp đồng này trước hết sẽ được giải quyết thông qua thương lượng và hòa giải giữa các bên. Nếu tranh chấp không giải quyết được thông qua hòa giải thì các bên nhất trí rằng một trong các bên có quyền đưa ra giải quyết tại Tòa án có thẩm quyền.",
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        spacing: { before: 100, after: 400 }
                    }),
                    // Signatures
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "ĐẠI DIỆN BÊN A                              ĐẠI DIỆN BÊN B",
                                bold: true,
                                font: "Times New Roman",
                                size: 24,
                                alignment: docx.AlignmentType.CENTER
                            })
                        ],
                        spacing: { before: 800 }
                    }),
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "(Ký tên, đóng dấu)                          (Ký tên, đóng dấu)",
                                italics: true,
                                font: "Times New Roman",
                                size: 24,
                                alignment: docx.AlignmentType.CENTER
                            })
                        ]
                    })
                ]
            }
        ]
    });

    docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, "hop_dong.docx");
    });
}

// Xử lý tải lên bản hợp đồng đã ký
document.getElementById("uploadSignedContract").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const preview = document.getElementById("uploadedContractPreview");
        preview.innerHTML = '';

        if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        } else if (file.type === "application/pdf") {
            const embed = document.createElement("embed");
            embed.src = URL.createObjectURL(file);
            embed.width = "100%";
            embed.height = "500px";
            preview.appendChild(embed);
        }
    }
});

// Hàm tạo HTML hợp đồng
function createEventContract(contract) {
    const serviceDataCollection = [];
    const dayDiff = contractDiffDate;

    contract.rental.devices.forEach(device => {
        serviceDataCollection.push({
            id: device.id,
            name: device.name,
            description: device.description,
            price: device.hourlyRentalFee,
            quantity: device.quantity,
            img: device.img
        });
    });

    contract.rental.humanResources.forEach(hr => {
        serviceDataCollection.push({
            id: hr.id,
            name: hr.name,
            description: hr.description,
            price: hr.hourlySalary,
            quantity: hr.quantity,
            img: hr.img
        });
    });

    contract.rental.locations.forEach(location => {
        serviceDataCollection.push({
            id: location.id,
            name: `Địa điểm tổ chức sự kiện`,
            description: `${location.name} - ${location.address}: ${location.description}`,
            price: location.hourlyRentalFee,
            quantity: 1
        });
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
            <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
            <style type="text/css">
                div, p, b, i, u, li, th, td {
                    font-family: "Times New Roman";
                    font-size: 12pt;
                    margin: 0;
                    color: #000 !important;
                }
                .service-table {
                    margin-top: 20px;
                }
                .service-table table {
                    width: 100%;
                    border: solid 1px #ccc;
                    padding: 10px;
                }
                .service-table table tr td {
                    border: solid 1px #ccc;
                    padding: 10px;
                    text-align: center;
                }
            </style>
        </head>
        <body class="pb-20 contract-detail-body">
        <div class="mx-auto max-w-container px-4 pt-8 container">
            <div class="text-center">
                <div class="my-2"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></div>
                <div class="my-2"><b><u>Độc lập - Tự do - Hạnh phúc</u></b></div>
                <div class="mt-10 mb-20 font-bold">HỢP ĐỒNG DỊCH VỤ</div>
            </div>
            <div class="px-10">
                <div>
                    <ul class="my-4">
                        <li><i>- Căn cứ Bộ luật dân sự 2015;</i></li>
                        <li><i>- Căn cứ sự thỏa thuận của 2 bên</i></li>
                    </ul>
                    <div>Hôm nay, ngày ${dayjs(contract.createdAt).format('DD/MM/YYYY')} chúng tôi gồm:</div>
                </div>
                <div class="my-4">
                    <div><b>BÊN THUÊ DỊCH VỤ</b> (say đây gọi là Bên A)</div>
                    <table>
                        <tr><td>TÊN</td><td>: Ông/Bà ${contract.rental.user.firstName} ${contract.rental.user.lastName}</td></tr>
                        <tr><td>ĐỊA CHỈ</td><td>: ${contract.customer.address}</td></tr>
                        <tr><td>SỐ ĐIỆN THOẠI</td><td>: ${contract.customer.phoneNumber}</td></tr>
                        <tr><td>EMAIL</td><td>: ${contract.rental.user.email}</td></tr>
                    </table>
                </div>
                <div class="my-4">
                    <div><b>BÊN CHO THUÊ DỊCH VỤ</b> (say đây gọi là Bên B)</div>
                    <table>
                        <tr><td>TÊN CÔNG TY</td><td>: CÔNG TY TRÁCH NHIỆM HỮU HẠN DỊCH VỤ CAMILLE</td></tr>
                        <tr><td>ĐẠI DIỆN</td><td class="flex"><li class="flex">: Ông/Bà NGUYỄN VĂN A</li><li class="ml-16 flex">Chức danh: GIÁM ĐỐC</li></td></tr>
                        <tr><td>ĐỊA CHỈ</td><td>: 385 Hải Phòng, Phường Tân Chính, Quận Thanh Khê, Thành phố Đà Nẵng</td></tr>
                        <tr><td>SỐ ĐIỆN THOẠI</td><td>: +8432454783</td></tr>
                        <tr><td>EMAIL</td><td>: camille.event@gmail.com</td></tr>
                    </table>
                </div>
                <div class="my-4">
                    <div>Hai bên thỏa thuận ký kết hợp đồng này với các điều khoản sau:</div>
                    <div class="m-4">
                        <div>
                            <b class="uppercase">Điều 1: Nội dung dịch vụ thực hiện</b>
                            <p>Bên B cam kết lên kế hoạch và tổ chức sự kiện cho bên A theo bảng danh mục bên dưới.</p>
                            <p>Tên sự kiện: ${contract.name}</p>
                            <p>Thời gian thực hiện: Từ ngày ${dayjs(contract.rental.rentalStartTime).format('DD/MM/YYYY')} đến ngày ${dayjs(contract.rental.rentalEndTime).format('DD/MM/YYYY')}</p>
                            <p>Địa điểm: ${contract.rental.locations.length ? `${contract.rental.locations[0].name} - ${contract.rental.locations[0].address}` : contract.customer.address}</p>
                            <div class="service-table">
                                <b class="block w-full text-center my-2">Bảng danh mục các dịch vụ kèm theo của sự kiện</b>
                                <table>
                                    <tr><td>STT</td><td>Tên dịch vụ</td><td>Mô tả</td><td>Số lượng</td><td>Đơn giá / ngày</td><td>Thành tiền</td><td>Đơn vị tiền</td></tr>
                                    ${serviceDataCollection.map((item, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${item.name}</td>
                                            <td>${item.description}</td>
                                            <td>${item.quantity}</td>
                                            <td>${formatCurrency(item.price)}</td>
                                            <td>${formatCurrency(item.price * item.quantity * dayDiff)}</td>
                                            <td>VNĐ</td>
                                        </tr>
                                    `).join('')}
                                    <tr><th colspan="5">TỔNG CHI PHÍ</th><td>${formatCurrency(contract.rental.totalPrice)}</td><td>VNĐ</td></tr>
                                </table>
                            </div>
                            ${contract.rental.timelines.length ? `
                                <div class="service-table my-4">
                                    <b class="block w-full text-center my-2">Bảng lịch trình dự kiến sự kiện</b>
                                    <table>
                                        <tr><td>STT</td><td>Thời gian</td><td>Mô tả</td></tr>
                                        ${contract.rental.timelines.map((item, index) => `
                                            <tr><td>${index + 1}</td><td>${dayjs(item.startTime).format('YYYY-MM-DD HH:mm')}</td><td>${item.description}</td></tr>
                                        `).join('')}
                                    </table>
                                </div>` : ''}
                        </div>
                        <div class="my-4">
                            <b class="uppercase">ĐIỀU 2: GIÁ TRỊ DỊCH VỤ – PHƯƠNG THỨC THANH TOÁN</b>
                            <div class="my-2">2.1 Giá trị dịch vụ: ${formatCurrency(contract.rental.totalPrice)} VNĐ</div>
                            <div class="my-2">2.2 Ngay khi bên B thực hiện cung cấp dịch vụ theo quy định của Điều 1, hai bên sẽ thống nhất và ký kết biên bản thanh lý hợp đồng trong đó có ghi rõ những hạng mục còn thiếu hoặc phát sinh (nếu có). Việc bỏ bớt hoặc bổ sung hạng mục (nếu có) phải được Bên A chấp thuận trước bằng văn bản, giá trị dịch vụ ghi trong biên bản thanh lý hợp đồng sẽ là giá trị thanh toán cuối cùng</div>
                            <div class="my-2">2.3 Phương thức thanh toán: (Thanh toán bằng tiền mặt hoặc chuyển khoản)<ul class="mx-4"><li>- Bên A thực hiện đặt cọc 30% giá trị hợp đồng cho bên B.</li><li>- Bên A sẽ thanh toán bằng tiền mặt hoặc chuyển khoản cho bên B 100% phần giá trị dịch vụ kể trên và phát sinh (nếu có) căn cứ trên Biên bản thanh lý hợp đồng trong thời gian 5 ngày làm việc kể từ khi kết thúc thời gian thực hiện chương trình và bên A nhận được biên bản thanh lý hợp đồng và hóa đơn tài chính hợp pháp của bên B.</li></ul></div>
                        </div>
                        <div class="my-4">
                            <b class="uppercase">ĐIỀU 3: THỜI HẠN THỎA THUẬN</b>
                            <div class="my-2">3.1 Thời gian hiệu lực hợp đồng: Bắt đầu từ khi bản hợp đồng này được ký kết đến khi thanh toán hợp đồng kèm theo biên bản thanh lý hợp đồng này.</div>
                            <div class="my-2">3.2 Trong trường hợp hết thời gian hiệu lực ghi trong hợp đồng mà bên A chưa thanh toán dứt điểm các khoản tiền liên quan đến hợp đồng này thì thời gian hiệu lực của hợp đồng sẽ mặc nhiên được gia hạn cho đến khi các khoản tiền được thanh toán dứt điểm cho bên B và hợp đồng này mặc nhiên được cả hai bên A và B coi như đã được thanh lý.</div>
                            <div class="my-2">3.3 Trường hợp một trong hai bên vi phạm bất kỳ điều khoản nào trong bản hợp đồng này hoặc các phụ lục hoặc văn bản bổ sung đính kèm có liên quan đến hợp đồng này thì bên bị vi phạm được quyền chấm dứt trước thời hạn. Bên vi phạm phải bồi thường cho bên bị vi phạm những thiệt hại do việc vi phạm này của mình gây ra.</div>
                        </div>
                        <div class="my-4">
                            <b class="uppercase">ĐIỀU 4: QUYỀN LỢI VÀ NGHĨA VỤ CỦA BÊN A</b>
                            <div class="my-2">4.1 Quyền lợi của bên A:<ul class="mx-4"><li>- Nhận được dịch vụ tốt nhất và đầy đủ nhất do bên B cung cấp.</li><li>- Quản lý và giám sát các hoạt động do bên B cung cấp và thực hiện.</li></ul></div>
                            <div class="my-2"><div>4.2 Nghĩa vụ của bên A:</div><ul class="mx-4"><li>- Thanh toán cho bên B theo như thỏa thuận tại điều 2.</li><li>- Phối hợp với bên B giải quyết các vấn đề phát sinh xảy ra trong chương trình thuộc về trách nhiệm của bên A.</li></ul></div>
                        </div>
                        <div class="my-4">
                            <b class="uppercase">ĐIỀU 5: QUYỀN LỢI VÀ NGHĨA VỤ CỦA BÊN B</b>
                            <div class="my-2"><div>5.1 Quyền lợi của bên B:</div><ul class="mx-4"><li>- Nhận được đầy đủ thanh toán của bên A như điều 2.</li></ul></div>
                            <div class="my-2"><div>5.2 Nghĩa vụ của bên B:</div><ul class="mx-4"><li>- Bảo đảm tuyển dụng, cung cấp cho bên A các hạng mục đã nêu với số lượng, chất lượng như yêu cầu.</li><li>- Trong quá trình diễn ra chương trình, Bên B cam kết sẽ trực tiếp theo dõi, giám sát, ghi chép và chụp hình lại trong biên bản nghiệm thu bàn giao cho Bên A.</li><li>- Cung cấp hóa đơn tài chính hợp pháp đối với dịch vụ cung cấp theo hợp đồng này và các hạng mục phát sinh được bên A chấp thuận (nếu có).</li><li>- Phối hợp với bên A giải quyết các vấn đề phát sinh xảy ra trong chương trình thuộc về trách nhiệm của bên B.</li><li>- Bên B sẽ không chịu trách nhiệm về những dịch vụ nào khác ngoài nội dung và Bảng danh mục dịch vụ.</li><li>- Bên B cam kết không cung cấp và tiết lộ bất kỳ thông tin nào liên quan trực tiếp hay gián tiếp đến sản phẩm của Bên A cũng như các nội dung khác cho bất kỳ bên thứ ba nào mà không có sự đồng ý trước của Bên A bằng văn bản.</li></ul></div>
                        </div>
                        <div class="my-4">
                            <b class="uppercase">ĐIỀU 6: GIẢI QUYẾT TRANH CHẤP</b>
                            <div class="my-2">Mọi tranh chấp liên quan đến Hợp đồng này trước hết sẽ được giải quyết thông qua thương lượng và hòa giải giữa các bên. Nếu tranh chấp không giải quyết được thông qua hòa giải thì các bên nhất trí rằng một trong các bên có quyền đưa ra giải quyết tại Tòa án có thẩm quyền.</div>
                        </div>
                    </div>
                </div>
                <div class="my-10 flex justify-between px-20 pb-20">
                    <div><div class="text-center uppercase font-bold">ĐẠI DIỆN BÊN A</div><div><i>(Kí tên, đóng dấu)</i></div></div>
                    <div><div class="text-center uppercase font-bold">ĐẠI DIỆN BÊN B</div><div><i>(Kí tên, đóng dấu)</i></div></div>
                </div>
            </div>
        </div>
        </body>
        </html>`;
}