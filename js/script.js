document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('trainingForm');
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const planContent = document.getElementById('planContent');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        generateBtn.disabled = true;
        loading.classList.remove('hidden');
        results.classList.add('hidden');
    
        const formData = {
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            sport: document.getElementById('sport').value,
            fitnessLevel: document.querySelector('input[name="fitnessLevel"]:checked').value,
            goals: document.getElementById('goals').value,
            injury: document.getElementById('injury').value || 'None',
            days: document.getElementById('days').value
        };
        
        try {
           
            const prompt = `You're a certified fitness trainer. Create a weekly training plan for:
- Name: ${formData.name}
- Age: ${formData.age}
- Gender: ${formData.gender}
- Sport: ${formData.sport}
- Fitness level: ${formData.fitnessLevel}
- Goal: ${formData.goals}
- Injury history: ${formData.injury}
- Available days: ${formData.days}

Return a detailed 7-day training schedule with:
- Daily workout plan (drills, exercises)
- Recovery tips
- Motivational message
            
Format the response in HTML with proper headings and sections.`;
            
         
            const trainingPlan = await callGeminiAPI(prompt);
            
       
            planContent.innerHTML = trainingPlan;
            results.classList.remove('hidden');
            
           
            initFollowUpChat();
        } catch (error) {
            console.error('Error:', error);
            planContent.innerHTML = `<p class="error">Error generating training plan: ${error.message}</p>`;
            results.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    const progressForm = document.createElement('div');
    progressForm.id = 'progressTracker';
    progressForm.innerHTML = `
        <h2>Daily Progress</h2>
        <div id="progressDays"></div>
        <div id="progressBarContainer">
            <div id="progressBar"></div>
            <span id="progressText">0% Complete</span>
        </div>
    `;
    document.querySelector('.container').appendChild(progressForm);

    function initProgressTracker() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const progressDays = document.getElementById('progressDays');
        
        days.forEach(day => {
            const dayCheck = document.createElement('div');
            dayCheck.className = 'dayCheck';
            dayCheck.innerHTML = `
                <input type="checkbox" id="${day.toLowerCase()}" name="progress">
                <label for="${day.toLowerCase()}">${day}</label>
            `;
            progressDays.appendChild(dayCheck);
         
            const savedState = localStorage.getItem(`progress-${day.toLowerCase()}`);
            if (savedState === 'true') {
                dayCheck.querySelector('input').checked = true;
            }
            
            dayCheck.querySelector('input').addEventListener('change', function() {
                localStorage.setItem(`progress-${day.toLowerCase()}`, this.checked);
                updateProgressBar();
            });
        });
        
        updateProgressBar();
    }

    function updateProgressBar() {
        const checkboxes = document.querySelectorAll('#progressDays input[type="checkbox"]');
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percent = Math.round((checked / total) * 100);
        
        document.getElementById('progressBar').style.width = `${percent}%`;
        document.getElementById('progressText').textContent = `${percent}% Complete`;
    }

    initProgressTracker();

    function initFollowUpChat() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chatContainer';
        chatContainer.innerHTML = `
            <h3>Have questions about your plan?</h3>
            <div id="chatMessages"></div>
            <div class="chat-input">
                <input type="text" id="chatInput" placeholder="Ask about your plan...">
                <button id="sendChatBtn">Send</button>
            </div>
        `;
        results.appendChild(chatContainer);

        document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
        document.getElementById('chatInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    async function sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        addChatMessage('user', message);
        input.value = '';

        try {
           
            const response = await callGeminiAPI(
                `Regarding my training plan: ${message}. Please provide specific advice.`
            );
            addChatMessage('assistant', response);
        } catch (error) {
            addChatMessage('assistant', `Error: ${error.message}`);
        }
    }

    function addChatMessage(role, content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        messageDiv.innerHTML = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function callGeminiAPI(prompt) {
        const apiKey = 'AIzaSyDTMqspY_C4KUwAqozRE7STorg0-HZD2yU';
        const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
        
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const error = data.error || {};
            throw new Error(error.message || `API request failed with status ${response.status}`);
        }

        if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            throw new Error('Invalid response format from Gemini API');
        }
        
        return data.candidates[0].content.parts[0].text;
    }
});
