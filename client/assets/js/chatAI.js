AOS.init({
    duration: 800,
    once: true
});
// //import fetch, { Headers } from 'node-fetch'; // Use import for ES modules
// //const fetch = require('node-fetch');

const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

const AI_API = 'http://localhost:4200/v1/chat/completions';
const AI_CONVERSATION = 'http://localhost:4200/v1/chat/conversations';

// Hiển thị tin nhắn
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

// Gửi message đến API và hiển thị phản hồi
async function sendMessageToAPI(message) {
    const conversationId = localStorage.getItem('conversationId');
    if (!conversationId) {
        console.error('Chưa có conversationId.');
        return;
    }
    try {
        typingIndicator.classList.add('active');
        sendBtn.disabled = true;
        const url = `${AI_CONVERSATION}/${conversationId}`;
        // const response = await fetch(url, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         role: 'user', 
        //         message: message
        //     })
        // });

        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json, text/plain, */*");
        myHeaders.append("Accept-Language", "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5");
        myHeaders.append("Cache-Control", "no-cache");
        myHeaders.append("Connection", "keep-alive");
        myHeaders.append("DNT", "1");
        myHeaders.append("Pragma", "no-cache");
        myHeaders.append("Referer", "http://localhost:4200/chat");
        myHeaders.append("Sec-Fetch-Dest", "empty");
        myHeaders.append("Sec-Fetch-Mode", "cors");
        myHeaders.append("Sec-Fetch-Site", "same-origin");
        myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36");
        myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"");
        myHeaders.append("sec-ch-ua-mobile", "?0");
        myHeaders.append("sec-ch-ua-platform", "\"Windows\"");
        myHeaders.append("Cookie", "__next_hmr_refresh_hash__=2b16818064f712aad776e812d6d6b2a9633457081244afec");


        // const raw = JSON.stringify({
        //     "model": "flow-NewFlow",
        //     "messages": [
        //         {
        //             "role": "user",
        //             "content": "Hạnh",
        //             "processNodeId": "7c077172-d199-40c8-9ad4-172d7db7cf08"
        //         }
        //     ],
        //     "stream": false,
        //     "metadata": {
        //         "flujo": "true",
        //         "conversationId": "707e05be-f630-4b8e-bf45-b6131f5d9557"
        //     }
        // });

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            // body: raw,
            redirect: "follow"
        };
        fetch("http://localhost:4200/v1/chat/conversations/a7112bf4-2963-4896-8ece-27031dfece78", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log("Hạnh nè: ", result))
            .catch((error) => console.error(error));
        

        // fetch("http://localhost:4200/v1/chat/completions", requestOptions)
        //     .then((response) => response.text())
        //     .then((result) => console.log("Hạnh: ",result))
        //     .catch((error) => console.error(error));

        // const data = await response.json();
        // const aiMessage = data[4]?.content || 'Không có phản hồi từ AI.';
        // addMessage(aiMessage, true);
    } catch (err) {
        console.error(err);
        addMessage('Lỗi khi gọi API. Vui lòng thử lại!', true);
    } finally {
        typingIndicator.classList.remove('active');
        sendBtn.disabled = false;
    }
}

async function createConversation() {
    if (!chatBox) return;
    try {
        typingIndicator.classList.add('active');
        sendBtn.disabled = true;
        // fetch(`${AI_API}?model=flow-NewFlow&message=Xin chào&temperature=0.0`)
        //     .then((response) => response.json())
        //     .then((result) => {
        //         const message = result.choices?.[0]?.message?.content;
        //         console.log('Assistant message:', message);})
        //     .catch((error) => console.error('Error:', error));
        const data = await fetch(`${AI_API}?model=flow-NewFlow&message=Xin chào&temperature=0.0`);
        const response = await data.json();
        const message = response.choices?.[0]?.message?.content;
        const conversationID = response.conversation_id;
        console.log('conversation_id:', conversationID);
        localStorage.setItem('conversationId', conversationID);
        console.log('Assistant message:', message);
        console.log("ID", localStorage.getItem('conversationId'));
        addMessage(message, true);

    } catch (err) {
        console.error(err);
        addMessage('Hiện tại đang mất kết nối. Xin quay lại sau!', true);
    } finally {
        typingIndicator.classList.remove('active');
        sendBtn.disabled = false;
    }
}
window.addEventListener('DOMContentLoaded', () => {
    createConversation();
});


// Xử lý khi gửi tin nhắn
sendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        sendBtn.disabled = true;
        chatInput.disabled = true;
        addMessage(message);
        sendMessageToAPI(message);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.disabled = false;
        chatInput.disabled = false;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

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
// // // Initialize conversation on page load
// // window.addEventListener('load', createConversation());
// // createConversation();