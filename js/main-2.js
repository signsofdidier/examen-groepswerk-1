const filterForm = document.getElementById("filter-form");
const countrySearch = document.getElementById("country-search");
const continentSelect = document.getElementById("continent-select");
const countriesContainer = document.getElementById("countries-container");
const errorMessage = document.getElementById("error-message");

// Haal de regio's dynamisch op
function getRegions() {
    axios.get('https://restcountries.com/v3.1/all')
        .then(response => {
            const regions = new Set(response.data.map(country => country.region).filter(region => region));
            regions.forEach(region => {
                const option = document.createElement("option");
                option.value = region;
                option.textContent = region;
                continentSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error loading regions:", error);
        });
}

// Dynamische landen ophalen en weergeven
function getCountries(url) {
    axios.get(url)
        .then(response => {
            const countries = response.data;
            if (!countries || countries.length === 0) {
                displayError("No countries found.");
                return;
            }
            displayCountries(countries);
        })
        .catch(error => {
            console.error("Error fetching countries:", error);
            displayError("Error retrieving countries.");
        });
}

// Landen weergeven in de container
function displayCountries(countries) {
    let outputHTML = '';
    countries.forEach(country => {
        outputHTML += `
                <div class="col">
                    <article class="card">
                        <img src="${country.flags.svg}" class="card-img-top" alt="Flag of ${country.name.common}">
                        <div class="card-body">
                            <h5 class="card-title">${country.name.common}</h5>
                            <p class="card-text">Region: ${country.region}</p>
                            <p class="card-text">Population: ${country.population.toLocaleString()}</p>
                        </div>
                    </article>
                </div>
                
                <div class="modal fade" id="${country.cca3}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-xl">
                            <div class="modal-content bg-secondary">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5" id="exampleModalLabel">${country.name.common}</h1>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body d-flex">
                                    <!--leaflet map-->
                                    <div class="modal-kaart">
                                        <!-- Hier komt de leaflet map -->
                                    </div>
                                    <!--land info-->
                                    <div class="modal-info">
                                        <p>Capitol: ${country.capital}</p>
                                        <p>Language: ${languages}</p>
                                        <p>currency: ${currencyInfo}</p>
                                        <p>Population: ${country.population.toLocaleString()}</p>
                                        <img class="img-modal" src="${country.flags.svg}" alt="country_flag">
                                    </div>
                    
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
            `;
    });
    countriesContainer.innerHTML = outputHTML;
    errorMessage.innerHTML = '';
}

// Foutmelding weergeven
function displayError(message) {
    countriesContainer.innerHTML = '';
    errorMessage.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`;
}

// Formulierverwerking
filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchValue = countrySearch.value.trim();
    const selectedRegion = continentSelect.value;

    if (searchValue && selectedRegion) {
        // Zoek een specifiek land binnen een specifieke regio
        axios.get(`https://restcountries.com/v3.1/name/${searchValue}`)
            .then(response => {
                const countries = response.data.filter(country => country.region === selectedRegion);
                if (countries.length === 0) {
                    displayError(`The country "${searchValue}" does not exist in the region "${selectedRegion}".`);
                } else {
                    displayCountries(countries);
                }
            })
            .catch(error => {
                console.error("Error fetching countries:", error);
                displayError("Error retrieving countries.");
            });
    } else if (searchValue) {
        // Zoek een land zonder rekening te houden met de regio
        getCountries(`https://restcountries.com/v3.1/name/${searchValue}`);
    } else if (selectedRegion) {
        // Zoek alle landen binnen een regio
        getCountries(`https://restcountries.com/v3.1/region/${selectedRegion}`);
    } else {
        // Als geen van beide is ingevuld, laad alle landen
        getCountries(`https://restcountries.com/v3.1/all`);
    }
});

// Initialiseer
getRegions();
getCountries(`https://restcountries.com/v3.1/all`);