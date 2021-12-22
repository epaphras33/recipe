const mealsElement = document.querySelector('#meals');
const favContainer = document.querySelector('#fav-meals');
const searchTerm = document.querySelector('#search-term');
const searchBtn = document.querySelector('#search');
const mealPopup = document.querySelector('#meal-popup');
const mealInfoElement = document.querySelector('#meal-info');
const popupCloseBtn = document.querySelector('#close-popup');

// Calling all the functions!
getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    addMeal(randomMeal, true);
};

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const respData = await resp.json();
    const ameal = respData.meals[0];
    return ameal;
};

async function getMealBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    const respData = await resp.json();
    const meals = respData.meals;
    return meals;
};

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
                <div class="meal-header">
                    ${random ? `<span class="random">Random Recipe</span>` : ''}
                    <img
                        src="${mealData.strMealThumb}"
                        alt="${mealData.strMeal}"
                    />
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button class="fav-btn">
                        <i class="fa fa-heart"></i>
                    </button>
                </div>
            `;
    
    const btn = meal.querySelector('.meal-body .fav-btn');
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            removeMealFromLS(mealData.idMeal);
            btn.classList.toggle('active');
        } else {
            addMealToLS(mealData.idMeal);
            btn.classList.toggle('active');
        }
        fetchFavMeals();
    });
    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsElement.appendChild(meal);
};

// Adding a meal to the local storage!
function addMealToLS(meal_id) {
    const meal_ids = getMealsFromLS();

    localStorage.setItem('meal_ids', JSON.stringify([...meal_ids, meal_id]));
};

// Removing a meal from the local storage!
function removeMealFromLS(meal_id) {
    const meal_ids = getMealsFromLS();

    localStorage.setItem('meal_ids', JSON.stringify(meal_ids.filter(id => id !== meal_id)));
}

// Getting meals from the local storage!
function getMealsFromLS() {
    const meal_ids = JSON.parse(localStorage.getItem('meal_ids'));

    return meal_ids === null ? [] : meal_ids;
};

async function fetchFavMeals() {
    // Cleaning the FavContainer!
    favContainer.innerHTML = '';

    const meal_ids = getMealsFromLS();

    for (let i = 0; i < meal_ids.length; i++) {
        const meal_id = meal_ids[i];
        meal = await getMealById(meal_id);
        addMealToFav(meal);
    }
};


function addMealToFav(mealData) {
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
                    <img
                        src="${mealData.strMealThumb}"
                        alt="${mealData.strMeal}">
                    <span>${mealData.strMeal}</span>
                    <button class="clear">
                        <i class="fa fa-window-close"></i>
                    </button>
            `;
    
    const btn = favMeal.querySelector('.clear');
    btn.addEventListener('click', () => {
        removeMealFromLS(mealData.idMeal);
        fetchFavMeals();
    });
    favMeal.addEventListener('click', () => {
        showMealInfo(mealData);
    });
    favContainer.appendChild(favMeal);
};

function showMealInfo(mealData) {
    // Cleaning the popup container!
    mealInfoElement.innerHTML = '';
    const mealElement = document.createElement('div');

    // Getting the ingredients and the right measurements!
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} / ${mealData['strMeasure' + i]}`);
        } else {
            break;
        }
    };
    mealElement.innerHTML = `
                    <h2>${mealData.strMeal}</h2>
                    <img
                        src="${mealData.strMealThumb}"
                        alt="${mealData.strMeal}"
                    />
                    <p>${mealData.strInstructions}</p>
                    <h3>The Ingredients</h3>
                    <ul>
                        ${ingredients.map(ing => `
                        <li>${ing}</li>
                        `).join('')}
                    </ul>
                `;
    console.log(mealInfoElement.appendChild(mealElement));

    mealPopup.classList.remove('hidden');
}

searchBtn.addEventListener('click', async () => {
    mealsElement.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealBySearch(search);
    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    } 
});

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
})