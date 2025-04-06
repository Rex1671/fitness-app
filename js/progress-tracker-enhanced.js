
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const exerciseTypes = ['Cardio', 'Strength', 'Flexibility', 'Balance'];
const badges = {
  workout: {name: 'Workout Warrior', earned: false, icon: 'fa-dumbbell', desc: 'Complete 300+ workout minutes in a week'},
  hydration: {name: 'Hydration Hero', earned: false, icon: 'fa-tint', desc: 'Drink 35+ glasses of water in a week'},
  consistency: {name: 'Consistency King', earned: false, icon: 'fa-crown', desc: 'Log progress 5+ days in a week'}
};

let weeklyData = {
    workouts: [0, 0, 0, 0, 0, 0, 0], 
    water: [0, 0, 0, 0, 0, 0, 0],   
    weights: [],                     
    exerciseTypes: ['', '', '', '', '', '', ''],
    goals: {
        workoutMinutes: 300,
        waterGlasses: 35,
        targetWeight: null
    },
    achievements: []
};

function loadProgressData() {
    const savedData = localStorage.getItem('weeklyProgress');
    if (savedData) weeklyData = JSON.parse(savedData);
}


function saveProgressData() {
    localStorage.setItem('weeklyProgress', JSON.stringify(weeklyData));
}

function getCurrentDay() {
    return (new Date().getDay() + 6) % 7; 
}

function initGoalSettings() {
    const modal = document.createElement('div');
    modal.id = 'goalModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Set Your Weekly Goals</h2>
            <form id="goalForm">
                <div class="form-group">
                    <label for="goalWorkout">Workout Minutes:</label>
                    <input type="number" id="goalWorkout" value="${weeklyData.goals.workoutMinutes}">
                </div>
                <div class="form-group">
                    <label for="goalWater">Water Glasses:</label>
                    <input type="number" id="goalWater" value="${weeklyData.goals.waterGlasses}">
                </div>
                <div class="form-group">
                    <label for="goalWeight">Target Weight (kg):</label>
                    <input type="number" step="0.1" id="goalWeight" value="${weeklyData.goals.targetWeight || ''}">
                </div>
                <button type="submit" class="btn">Save Goals</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('goalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        weeklyData.goals.workoutMinutes = parseInt(document.getElementById('goalWorkout').value);
        weeklyData.goals.waterGlasses = parseInt(document.getElementById('goalWater').value);
        weeklyData.goals.targetWeight = parseFloat(document.getElementById('goalWeight').value);
        saveProgressData();
        modal.style.display = 'none';
        updateCharts();
    });
}

function checkAchievements() {
    const workoutTotal = weeklyData.workouts.reduce((a, b) => a + b, 0);
    const waterTotal = weeklyData.water.reduce((a, b) => a + b, 0);
    const loggedDays = weeklyData.workouts.filter(min => min > 0).length;

    badges.workout.earned = workoutTotal >= weeklyData.goals.workoutMinutes;
    badges.hydration.earned = waterTotal >= weeklyData.goals.waterGlasses;
    badges.consistency.earned = loggedDays >= 5;

    Object.values(badges).forEach(badge => {
        if (badge.earned && !weeklyData.achievements.includes(badge.name)) {
            weeklyData.achievements.push(badge.name);
            showAchievementToast(badge);
        }
    });
}

function showAchievementToast(badge) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <i class="fas ${badge.icon}"></i>
        <div>
            <strong>${badge.name} Unlocked!</strong>
            <small>${badge.desc}</small>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => toast.remove(), 5000);
}

function generatePlanCard(type, content) {
    const cardId = `plan-${Date.now()}`;
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.id = cardId;
    card.innerHTML = `
        <h3>${type} Plan</h3>
        <div class="plan-content">${content}</div>
        <button class="delete-plan" data-id="${cardId}">Delete</button>
    `;
    document.getElementById('plans-container').appendChild(card);
    

    card.querySelector('.delete-plan').addEventListener('click', function() {
        document.getElementById('plans-container').removeChild(card);
    });
}

window.addEventListener('load', function() {
    loadProgressData();
    initGoalSettings();
    

    const progressForm = document.getElementById('progressForm');
    const dietPlanBtn = document.getElementById('generate-diet-plan');
    const trainingPlanBtn = document.getElementById('generate-training-plan');
    
    if (progressForm) {
        progressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dayIndex = getCurrentDay();
            const workoutVal = parseInt(document.getElementById('workoutMinutes').value) || 0;
            const waterVal = parseInt(document.getElementById('waterGlasses').value) || 0;
            
            weeklyData.workouts[dayIndex] = workoutVal;
            weeklyData.water[dayIndex] = waterVal;
            
            const weight = parseFloat(document.getElementById('currentWeight').value);
            if (weight) {
                weeklyData.weights.push({
                    date: new Date().toISOString().split('T')[0],
                    weight: weight
                });
            }
            
            saveProgressData();
            updateCharts();
            checkAchievements();
            alert('Progress saved successfully!');
        });
    }

    if (dietPlanBtn) {
        dietPlanBtn.addEventListener('click', function() {
            const dietPlan = "Sample diet plan: High protein, moderate carbs, low fat";
            generatePlanCard('Diet', dietPlan);
        });
    }

    if (trainingPlanBtn) {
        trainingPlanBtn.addEventListener('click', function() {
            const trainingPlan = "Sample training plan: 3x strength, 2x cardio per week";
            generatePlanCard('Training', trainingPlan);
        });
    }

    setTimeout(() => {
        initWorkoutChart();
        initNutritionChart();
        initTrendChart();
        updateProgressBar(calculateProgress());
    }, 100);
});


function calculateProgress() {
    const workoutTotal = weeklyData.workouts.reduce((a, b) => a + b, 0);
    const waterTotal = weeklyData.water.reduce((a, b) => a + b, 0);
    const workoutGoal = weeklyData.goals.workoutMinutes || 300;
    const waterGoal = weeklyData.goals.waterGlasses || 35;
    return Math.round((Math.min(100, workoutTotal/workoutGoal*100) * 0.7) + 
                     (Math.min(100, waterTotal/waterGoal*100) * 0.3));
}

function updateCharts() {
    if (window.workoutChart) window.workoutChart.update();
    if (window.trendChart) window.trendChart.update();
    updateProgressBar(calculateProgress());
}

function initWorkoutChart() {
    const ctx = document.getElementById('workoutChart')?.getContext('2d');
    if (!ctx) return;
    
    window.workoutChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Workout Minutes',
                data: weeklyData.workouts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true, max: 120 } } }
    });
}


function initNutritionChart() {
    const ctx = document.getElementById('nutritionChart')?.getContext('2d');
    if (!ctx) return;
    
    window.nutritionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fats'],
            datasets: [{
                data: [30, 40, 30],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

function initTrendChart() {
    const ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;
    
    const weightData = weeklyData.weights.slice(-4).map(entry => entry.weight);
    const labels = weeklyData.weights.slice(-4).map(entry => 
        new Date(entry.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
    );
    
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Weight Trend (kg)',
                data: weightData.length ? weightData : [0, 0, 0, 0],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });
}

// Update progress bar display
function updateProgressBar(percent) {
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    if (bar && text) {
        bar.style.width = `${percent}%`;
        text.textContent = `${percent}% Complete`;
    }
}
