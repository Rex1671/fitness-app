document.addEventListener('DOMContentLoaded', function() {
    const dietForm = document.getElementById('dietForm');
    const generateBtn = document.getElementById('generateDietBtn');
    const loading = document.getElementById('dietLoading');
    const results = document.getElementById('dietResults');
    const mealPlanContent = document.getElementById('mealPlanContent');
    const nutritionInfo = document.getElementById('nutritionInfo');
    
    dietForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
       
        generateBtn.disabled = true;
        loading.classList.remove('hidden');
        results.classList.add('hidden');
       
        const formData = {
            dietType: document.getElementById('dietType').value,
            calories: document.getElementById('calories').value,
            meals: document.querySelector('input[name="meals"]:checked').value,
            allergies: document.getElementById('allergies').value || 'None'
        };
        
        try {
          
            const prompt = `As a nutritionist, create a ${formData.meals}-meal daily plan for:
- Diet type: ${formData.dietType}
- Calorie target: ${formData.calories} kcal
- Allergies/restrictions: ${formData.allergies}

Include:
1. Detailed meal descriptions
2. Nutritional breakdown per meal
3. Grocery shopping list
4. Preparation tips

Format the response in HTML with clear sections.`;
            
    
            const mealPlan = await callGeminiAPI(prompt);
            
   
            mealPlanContent.innerHTML = mealPlan;
            results.classList.remove('hidden');
            
           
            const nutritionGoals = {
                calories: formData.calories,
                protein: Math.round(formData.calories * 0.3 / 4), 
                carbs: Math.round(formData.calories * 0.5 / 4),   
                fats: Math.round(formData.calories * 0.2 / 9),  
                proteinGoal: Math.round(formData.calories * 0.3 / 4),
                carbsGoal: Math.round(formData.calories * 0.5 / 4),
                fatsGoal: Math.round(formData.calories * 0.2 / 9)
            };
            localStorage.setItem('nutritionGoals', JSON.stringify(nutritionGoals));
        } catch (error) {
            console.error('Error:', error);
            mealPlanContent.innerHTML = `<p class="error">Error generating meal plan: ${error.message}</p>`;
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
