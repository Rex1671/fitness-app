document.addEventListener('DOMContentLoaded', function() {
    const bmiForm = document.getElementById('bmiForm');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmiNumber = document.getElementById('bmiNumber');
    const bmiCategory = document.getElementById('bmiCategory');
    const idealWeight = document.getElementById('idealWeight');
    const healthInfo = document.getElementById('healthInfo');
    const results = document.getElementById('bmiResults');

   
    bmiForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBMI();
    });

   
    heightInput.addEventListener('input', calculateBMI);
    weightInput.addEventListener('input', calculateBMI);

    function calculateBMI() {
        const height = parseFloat(heightInput.value) / 100; 
        const weight = parseFloat(weightInput.value);
        
        if (height && weight) {
            const bmi = weight / (height * height);
            const roundedBMI = bmi.toFixed(1);
            
            bmiNumber.textContent = roundedBMI;
            setBMICategory(roundedBMI);
            calculateIdealWeight(height);
            
            results.classList.remove('hidden');
        }
    }

    function setBMICategory(bmi) {
        let category = '';
        let info = '';
        
        if (bmi < 18.5) {
            category = 'Underweight';
            info = 'You may need to gain weight. Consult a doctor or dietitian.';
        } 
        else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal weight';
            info = 'You have a healthy weight. Maintain your current lifestyle.';
        }
        else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            info = 'Consider losing weight through diet and exercise.';
        }
        else {
            category = 'Obese';
            info = 'Consult a healthcare professional for weight management advice.';
        }
        
        bmiCategory.textContent = category;
        bmiCategory.className = 'bmi-category ' + category.toLowerCase().replace(' ', '-');
        healthInfo.textContent = info;
    }

    function calculateIdealWeight(height) {
        const minWeight = (18.5 * height * height).toFixed(1);
        const maxWeight = (24.9 * height * height).toFixed(1);
        idealWeight.textContent = `${minWeight}kg - ${maxWeight}kg`;
    }
});
