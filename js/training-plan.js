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
            days: document.getElementById('days').value,
            workoutTypes: Array.from(document.querySelectorAll('input[name="workoutType"]:checked')).map(el => el.value),
            duration: document.getElementById('duration').value || 60
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
- Preferred workout types: ${formData.workoutTypes.join(', ')}
- Session duration: ${formData.duration} minutes

Return a detailed 7-day training schedule with:
- Daily workout plan (drills, exercises)
- Recovery tips
- Motivational message
            
Format the response in HTML with proper headings and sections.`;
            
            const trainingPlan = await callGeminiAPI(prompt);
            
            planContent.innerHTML = `
                <div class="training-plan-container">
                    ${trainingPlan
                        .replace(/<h2>/g, '<div class="training-day"><h2>')
                        .replace(/<\/h2>/g, '</h2>')
                        .replace(/<h3>/g, '<div class="training-section"><h3>')
                        .replace(/<\/h3>/g, '</h3>')
                        .replace(/<p>/g, '<div class="training-content"><p>')
                        .replace(/<\/p>/g, '</p></div>')
                    }
                </div>
                <style>
                    .training-plan-container {
                        font-family: 'Segoe UI', sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .training-day {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 20px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .training-section {
                        background-color: #f8f9fa;
                        padding: 12px 15px;
                        border-left: 4px solid #667eea;
                        margin: 15px 0;
                        border-radius: 0 4px 4px 0;
                    }
                    .training-content {
                        background-color: white;
                        padding: 10px 15px;
                        border-radius: 4px;
                        margin: 10px 0;
                        line-height: 1.6;
                    }
                    .training-day h2 {
                        margin: 0;
                        font-size: 1.5rem;
                    }
                    .training-section h3 {
                        margin: 0;
                        color: #495057;
                    }
                    ul, ol {
                        padding-left: 20px;
                    }
                    li {
                        margin-bottom: 8px;
                    }
                </style>
            `;
            results.classList.remove('hidden');
            
            const workoutDays = {};
            const dayElements = planContent.querySelectorAll('h2, h3');
            
            dayElements.forEach(dayEl => {
                const dayName = dayEl.textContent.trim().split(' ')[0];
                if (daysOfWeek.includes(dayName)) {
                    const workout = {
                        name: `${formData.sport} Training`,
                        duration: 60,
                        intensity: formData.fitnessLevel
                    };
                    workoutDays[dayName.toLowerCase()] = workout;
                }
            });
            
          
            Object.entries(workoutDays).forEach(([day, workout]) => {
                localStorage.setItem(`workout-${day}`, JSON.stringify(workout));
            });

            if (!localStorage.getItem('workoutProgress')) {
                localStorage.setItem('workoutProgress', JSON.stringify({
                    completed: 0,
                    lastCompleted: null,
                    streak: 0
                }));
            }

            planContent.innerHTML += `
                <div class="progress-actions">
                    <button id="completeWorkout" class="btn btn-primary">Mark Workout Complete</button>
                    <div id="progressStats" class="mt-3"></div>
                </div>
            `;

            document.getElementById('completeWorkout').addEventListener('click', function() {
                const progress = JSON.parse(localStorage.getItem('workoutProgress'));
                const today = new Date().toISOString().split('T')[0];
                
                progress.completed++;
                progress.lastCompleted = today;
                
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (progress.lastCompleted === yesterdayStr) {
                    progress.streak++;
                } else if (progress.lastCompleted !== today) {
                    progress.streak = 1;
                }
                
                localStorage.setItem('workoutProgress', JSON.stringify(progress));
              
                document.getElementById('progressStats').innerHTML = `
                    <p>Workouts completed: ${progress.completed}</p>
                    <p>Current streak: ${progress.streak} days</p>
                    <p>Last workout: ${progress.lastCompleted}</p>
                `;
            });

         
            const progress = JSON.parse(localStorage.getItem('workoutProgress'));
            document.getElementById('progressStats').innerHTML = `
                <p>Workouts completed: ${progress.completed}</p>
                <p>Current streak: ${progress.streak} days</p>
                <p>Last workout: ${progress.lastCompleted || 'Never'}</p>
            `;
        } catch (error) {
            console.error('Error:', error);
            planContent.innerHTML = `<p class="error">Error generating training plan: ${error.message}</p>`;
            results.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

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
