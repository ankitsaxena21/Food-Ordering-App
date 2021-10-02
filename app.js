const restaurantDOM = document.querySelector(".restaurants-center");
const search = document.querySelector(".typeahead");
let favourites = new Array(15);
let prev = 0;
let next = 6;
const total = 15;

// fetching the data
class Restaurants {
    async getData() {
        try {
            let response = await fetch("restaurants.json");
            let data = await response.json();
            return data.items;
        }
        catch (err) {
            console.log(err);
        }
    }
}

// display the restaurants
class UI {
    displayItems(restaurants, prev = 0, next = 6) {
        let output = '';
        restaurants = restaurants.slice(prev, next);
        restaurants.forEach(restaurant => {
            output = output + `
            <div class="restaurant">
            <div class="img-container" id=${restaurant.id}>
                <img src="${restaurant.image}" alt="restaurant" class="restaurant-img" />
                <button class="bag-btn">
                    ${(Storage.getFavourite(restaurant.id - 1) === "true") ? "<i class='fa fa-heart fa-lg'></i>" + "favourite" : "add to favourites"}
                </button>
            </div>
            <h3>${restaurant.name}</h3>
            <h4>Location - ${restaurant.location}</h4>
            <h4>Ratings - ${restaurant.rating}</h4>
            <h4>ETA - ${restaurant.ETA}</h4>
            </div>
            `;
        })
        restaurantDOM.innerHTML = output;
    }

    searchText(text, list) {
        let items = _.filter(list, item => {
            name = item.name.toLowerCase();
            return name.includes(text.toLowerCase());
        });
        this.outputTypeahead(items);
    }

    outputTypeahead(items) {
        if (search.value != "") {
            let output = '';
            items.map(item => {
                output = output + `<p class="autocomplete">${item.name}</p>`;
            })
            document.querySelector("#target").innerHTML = output;
            let options = document.querySelector("#target")
            options.addEventListener('click', (e) => {
                search.value = e.target.textContent;
                options.style.display = "none";
            })
            options.style.display = "block";
        }
    }
    getfavouriteButtons() {
        const btns = [...document.querySelectorAll(".bag-btn")];
        btns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                let btnId = e.target.parentNode.id;
                console.log(e.target.textContent)
                if (e.target.textContent == "favourite") {
                    e.target.textContent = "add to favourite";
                    Storage.removeFavourite(btnId);
                } else {
                    e.target.innerHTML = `<i class='fa fa-heart fa-lg'></i>` + "favourite";
                    Storage.setFavourite(btnId);
                }
            })
        })
    }
}

//local storage
class Storage {
    static saveData(items) {
        _.map(items, (item, index) => {
            favourites[index + 1] = item.favourite;
        })
        localStorage.setItem("favourite", JSON.stringify(favourites.slice(1)))
    }
    static getFavourite(id) {
        if (localStorage.getItem("favourite")) {
            let items = localStorage.getItem("favourite");
            items = JSON.parse(items);
            return items[id];
        }

    }
    static setFavourite(id) {
        let i = 1;
        let items = localStorage.getItem("favourite");
        items = JSON.parse(items);
        let newFav = new Array(15);
        while (i <= 15) {
            if (i === parseInt(id)) {
                newFav[i] = "true";
            } else {
                newFav[i] = items[i - 1]
            }

            i++;
        }
        localStorage.setItem("favourite", JSON.stringify(newFav.slice(1)));
    }
    static removeFavourite(id) {
        let i = 1;
        let items = localStorage.getItem("favourite");
        items = JSON.parse(items);
        let newFav = new Array(15);
        while (i <= 15) {
            if (i === parseInt(id)) {
                newFav[i] = "false";
            } else {
                newFav[i] = items[i - 1]
            }

            i++;
        }
        localStorage.setItem("favourite", JSON.stringify(newFav.slice(1)));
    }
}

// creating all objects
const ui = new UI();
const restaurants = new Restaurants();
const storage = new Storage();

//event listeners
document.addEventListener("DOMContentLoaded", () => {
    search.value ='';
    restaurants.getData().then(restaurants => {
        ui.displayItems(restaurants);
        let items = localStorage.getItem("favourite");
        items = JSON.parse(items);
        if (items === null) {
            Storage.saveData(restaurants);
        }
        ui.getfavouriteButtons();
    });
});

search.addEventListener("input", () => {
    if (search.value != '')
        restaurants.getData().then(restaurants => ui.searchText(search.value, restaurants));
});

document.querySelector(".myform").addEventListener("submit", (e) => {
    e.preventDefault();
    document.querySelector("#target").style.display = "none";
    restaurants.getData().then(restaurants => {
        let items = _.filter(restaurants, item => {
            name = item.name.toLowerCase();
            return name.includes(search.value.toLowerCase());
        });
        ui.displayItems(items);
        ui.getfavouriteButtons();
    });
});

document.getElementById("sort").addEventListener("change", (e) => {
    restaurants.getData().then(restaurants => {
        let items = _.sortBy(restaurants, e.target.value);
        if (e.target.value == "rating") {
            items = items.reverse();
        }
        ui.displayItems(items);
        ui.getfavouriteButtons();
    });
});

document.getElementById("filter").addEventListener("change", (e) => {
    restaurants.getData().then(restaurants => {
        let items = _.filter(restaurants, item => {
            tags = item.tags
            return tags.includes(e.target.value);
        });
        ui.displayItems(items);
        ui.getfavouriteButtons();
    });
});

document.querySelector("#pagination").addEventListener("click", (e) => {
    if (e.target.textContent.includes("next") && next < total) {
        prev = prev + 6;
        next = next + 6;
        restaurants.getData().then(restaurants => {
            ui.displayItems(restaurants, prev, next);
            ui.getfavouriteButtons();
        })
    }
    else if (e.target.textContent.includes("previous") && prev >= 0) {
        prev = prev - 6;
        next = next - 6;
        restaurants.getData().then(restaurants => {
            ui.displayItems(restaurants, prev, next);
            ui.getfavouriteButtons();
        });
    }
});

document.querySelector(".favourites").addEventListener("click", (e) => {
    let items = localStorage.getItem("favourite");
    items = JSON.parse(items);
    restaurants.getData().then(restaurants => {
        let fav = [];
        restaurants.forEach((restaurant, index) => {
            if(items[index] == "true"){
                fav.push(restaurant);
            }
        });
        ui.displayItems(fav);
        ui.getfavouriteButtons();
    });
    
});
