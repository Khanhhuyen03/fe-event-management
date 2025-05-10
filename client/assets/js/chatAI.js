AOS.init({
    duration: 800,
    once: true
});

// Chat functionality
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

const BASE_API_URL = 'http://localhost:8080/event-management';
const AI_URL = `${BASE_API_URL}/api/ai`;
const API_EVENT_TYPES = `${BASE_API_URL}/event-type`;
const API_EVENTS = `${BASE_API_URL}/event`;

// Function to add message to chat box
function addMessage(content, isBot = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
    messageDiv.innerHTML = `
        <span class="sender">${isBot ? 'MyEvent AI' : 'Bạn'}</span>
        ${content}
        <div class="timestamp">${new Date().toLocaleTimeString('vi-VN')}</div>
    `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to create event type buttons
function createEventTypeButtons(eventTypes) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'event-type-buttons';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.marginTop = '10px';

    eventTypes.forEach(type => {
        const button = document.createElement('button');
        button.className = 'event-type-btn';
        button.textContent = type.name;
        button.style.padding = '8px 16px';
        button.style.borderRadius = '20px';
        button.style.border = 'none';
        button.style.background = 'linear-gradient(to right, #0288d1, #0277bd)';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        button.style.transition = 'transform 0.2s, box-shadow 0.2s';

        button.addEventListener('click', () => {
            handleEventTypeClick(type.name);
        });

        buttonContainer.appendChild(button);
    });

    return buttonContainer;
}

// Function to handle event type button click
async function handleEventTypeClick(eventTypeName) {
    addMessage(eventTypeName);
    typingIndicator.classList.add('active');

    try {
        // Get events of selected type
        const response = await fetch(`${API_EVENTS}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch events');

        const events = await response.json();
        const filteredEvents = events.filter(event => event.eventTypeName === eventTypeName);

        if (filteredEvents.length === 0) {
            addMessage(`Hiện không có sự kiện nào thuộc loại "${eventTypeName}".`, true);
        } else {
            let message = `Các sự kiện thuộc loại "${eventTypeName}":<br><br>`;
            filteredEvents.forEach(event => {
                message += `<strong>${event.name}</strong><br>`;
                message += `Mô tả: ${event.description || 'Không có mô tả'}<br>`;
                message += `Chi tiết: ${event.detail || 'Không có chi tiết'}<br><br>`;
            });
            addMessage(message, true);
        }
    } catch (error) {
        addMessage('Có lỗi xảy ra khi lấy danh sách sự kiện. Vui lòng thử lại!', true);
        console.error('Error:', error);
    } finally {
        typingIndicator.classList.remove('active');
    }
}

// Function to initialize conversation
async function initializeConversation() {
    try {
        const response = await fetch(`${AI_URL}/start`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to start conversation');
        const data = await response.json();
        if (data.message) {
            addMessage(data.message, true);
        }

        // Fetch and display event types
        const eventTypesResponse = await fetch(API_EVENT_TYPES, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!eventTypesResponse.ok) throw new Error('Failed to fetch event types');

        const eventTypes = await eventTypesResponse.json();
        const buttonContainer = createEventTypeButtons(eventTypes);

        const lastMessage = chatBox.lastElementChild;
        lastMessage.appendChild(buttonContainer);
    } catch (error) {
        // addMessage('Không thể khởi tạo cuộc trò chuyện. Vui lòng thử lại!', true);
        console.error('Error:', error);
    }
}

// Function to send message to API
async function sendMessageToAPI(message) {
    try {
        typingIndicator.classList.add('active');
        sendBtn.disabled = true;

        const response = await fetch(`${AI_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: message })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        addMessage(data.message || 'Đã nhận yêu cầu, nhưng không có phản hồi cụ thể.', true);
    } catch (error) {
        addMessage('Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!', true);
        console.error('Error:', error);
    } finally {
        typingIndicator.classList.remove('active');
        sendBtn.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chat-box");
    const typingIndicator = document.getElementById("typing-indicator");

    // Gọi API để lấy danh sách loại sự kiện từ database
    async function loadEventTypes() {
        try {
            const response = await fetch(`${AI_URL}/start`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Tạo container cho các button
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "event-type-buttons";

            // Tạo button cho từng loại sự kiện
            data.eventTypes.forEach(type => {
                const button = document.createElement("button");
                button.className = "event-type-btn";
                button.setAttribute("data-type", type);
                button.textContent = type;
                buttonContainer.appendChild(button);
            });

            // Chèn button container ngay sau tin nhắn đầu tiên
            chatBox.appendChild(buttonContainer);
            chatBox.scrollTop = chatBox.scrollHeight;

            // Xử lý sự kiện khi nhấn vào button
            const eventTypeButtons = document.querySelectorAll(".event-type-btn");
            eventTypeButtons.forEach(button => {
                button.addEventListener("click", async () => {
                    const eventType = button.getAttribute("data-type");

                    // Hiển thị tin nhắn người dùng
                    const userMessage = document.createElement("div");
                    userMessage.className = "chat-message user";
                    userMessage.innerHTML = `
                        <span class="sender">Bạn</span>
                        ${eventType}
                        <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                    `;
                    chatBox.appendChild(userMessage);
                    chatBox.scrollTop = chatBox.scrollHeight;

                    // Hiển thị chỉ báo "đang trả lời"
                    typingIndicator.classList.add("active");

                    try {
                        // Gọi API để lấy danh sách sự kiện theo loại
                        const generateResponse = await fetch(`${AI_URL}/generate`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ prompt: eventType }),
                        });

                        if (!generateResponse.ok) {
                            throw new Error(`HTTP error! status: ${generateResponse.status}`);
                        }

                        const generateData = await generateResponse.json();

                        // Ẩn chỉ báo "đang trả lời"
                        typingIndicator.classList.remove("active");

                        // Hiển thị phản hồi từ bot
                        const botMessage = document.createElement("div");
                        botMessage.className = "chat-message bot";
                        botMessage.innerHTML = `
                            <span class="sender">MyEvent AI</span>
                            ${generateData.event || "Danh sách sự kiện cho " + eventType + ":<br>" + formatEventList(generateData.events)}
                            <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                        `;
                        console.log(generateData.events);
                        chatBox.appendChild(botMessage);
                        chatBox.scrollTop = chatBox.scrollHeight;

                        // Ẩn các button sau khi chọn
                        buttonContainer.style.display = "none";
                    } catch (error) {
                        console.error("Lỗi khi gọi API:", error);
                        typingIndicator.classList.remove("active");

                        const errorMessage = document.createElement("div");
                        errorMessage.className = "chat-message bot";
                        errorMessage.innerHTML = `
                            <span class="sender">MyEvent AI</span>
                            Đã có lỗi xảy ra. Vui lòng thử lại!
                            <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                        `;
                        chatBox.appendChild(errorMessage);
                        chatBox.scrollTop = chatBox.scrollHeight;
                    }
                });
            });
        } catch (error) {
            console.error("Lỗi khi tải loại sự kiện:", error);
            const errorMessage = document.createElement("div");
            errorMessage.className = "chat-message bot";
            errorMessage.innerHTML = `
                <span class="sender">MyEvent AI</span>
                Đã có lỗi xảy ra khi tải loại sự kiện. Vui lòng thử lại!
                <div class="timestamp">${new Date().toLocaleTimeString()}</div>
            `;
            chatBox.appendChild(errorMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    // Gọi hàm để tải loại sự kiện khi trang tải
    loadEventTypes();

    // Hàm định dạng danh sách sự kiện
    function formatEventList(events) {
        if (!events || events.length === 0) {
            return "Không tìm thấy sự kiện nào cho loại này.";
        }
        // return events.map(event => `• ${event.name} - ${event.description}
        //     - ${event.img}`).join("<br>");
        return events.map(event => `
            • ${event.name} - ${event.description}<br>
            <img src="http://localhost:8080/event-management/api/v1/FileUpload/files/${event.img}" 
                 alt="${event.name}" 
                 class="img-fluid" 
                 style="height: 100px; width: 200px; object-fit: fill; display: block;">
        `).join("<br>");
    }
});

// Handle send button click
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message);
        sendMessageToAPI(message);
        chatInput.value = '';
        chatInput.style.height = 'auto';
    }
});

// Handle Enter key press
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Basic speech recognition (if supported)
const micBtn = document.getElementById('mic-btn');
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.style.background = 'linear-gradient(to right, #d32f2f, #b71c1c)';
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        micBtn.style.background = 'linear-gradient(to right, #0288d1, #0277bd)';
        sendBtn.click();
    };

    recognition.onerror = () => {
        micBtn.style.background = 'linear-gradient(to right, #0288d1, #0277bd)';
        addMessage('Không thể nhận diện giọng nói. Vui lòng thử lại!', true);
    };
} else {
    micBtn.disabled = true;
    micBtn.style.background = '#d1d5db';
}

// Initialize conversation on page load
window.addEventListener('load', initializeConversation);

// Thêm vào cuối mã JavaScript hiện tại
const chatAIButton = document.getElementById('chatAI');
// Hàm lấy danh sách loại sự kiện từ API
async function fetchEventTypes() {
    try {
        const response = await fetch(API_EVENT_TYPES, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Không thể lấy danh sách loại sự kiện');

        const data = await response.json();
        // Giả sử API trả về một mảng các loại sự kiện, ví dụ: [{name: "Hội nghị"}, {name: "Tiệc cưới"}, ...]
        const eventTypes = data.map(item => item.name).join(', ');
        const message = `Các loại sự kiện hiện có: ${eventTypes || 'Không có loại sự kiện nào.'}`;
        addMessage(message, true);
    } catch (error) {
        addMessage('Không thể lấy danh sách loại sự kiện. Vui lòng thử lại!', true);
        console.error('Error:', error);
    }
}

// Xử lý sự kiện click cho nút chatAI
chatAIButton.addEventListener('click', fetchEventTypes);