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
        let currencyInfo = '';
        if (country.currencies) {
            const currencyKeys = Object.keys(country.currencies);
            currencyInfo = currencyKeys.map(key => {
                const currency = country.currencies[key];
                return `${currency.name} (${currency.symbol || 'Geen symbool'})`;
            }).join(', ');
        } else {
            currencyInfo = 'No currency info available.';
        }

        const languages = country.languages ? Object.values(country.languages).join(', ') : 'No languages available!';

        // Gebruik een unieke kaart-ID voor elke modal
        const mapId = `map-${country.cca3}`;

        outputHTML += `
            <div class="col">
                <button type="button" class="card-btn border-0 p-0 m-0 w-100 text-start" data-bs-toggle="modal" data-bs-target="#${country.cca3}">
                    <article class="card p-3 shadow-sm border-0">
                        <img src="${country.flags.svg}" class="card-img-top" alt="Flag of ${country.name.common}">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${country.name.common}</h5>
                            <p class="card-text mb-1"><span class="fw-bold">Region:</span> ${country.region}</p>
                            <p class="card-text m-0"><span class="fw-bold">Population:</span> ${country.population.toLocaleString()}</p>
                        </div>
                    </article>
                </button>
            </div>
            
            <div class="modal fade" id="${country.cca3}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-4" id="exampleModalLabel">${country.name.common}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row d-block d-lg-flex py-1">
                                <div class="col-12 col-lg-8 modal-kaart mb-4 mb-lg-0">
                                    <div id="${mapId}" style="height: 400px;"></div>
                                </div>
                                <div class="col-12 col-lg-4">
                                    <img class="img-fluid w-100 mb-4" src="${country.flags.svg}" alt="country_flag">
                                    <p class="mb-2"><span class="fw-bold">Capital:</span> ${country.capital}</p>
                                    <p class="mb-2"><span class="fw-bold">Languages:</span> ${languages}</p>
                                    <p class="mb-2"><span class="fw-bold">Currency:</span> ${currencyInfo}</p>
                                    <p class="mb-2"><span class="fw-bold">Population:</span> ${country.population.toLocaleString()}</p>
                                </div>      
                            </div>        
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    countriesContainer.innerHTML = outputHTML;
    errorMessage.innerHTML = '';

    // Voeg eventlisteners toe voor kaarten in modals
    countries.forEach(country => {
        const mapId = `map-${country.cca3}`;
        const modal = document.getElementById(country.cca3);

        modal.addEventListener('shown.bs.modal', () => {
            initializeMap(mapId, country.latlng, country.capitalInfo?.latlng || country.latlng);
        });
    });
}

// Initialiseer een Leaflet-kaart
function initializeMap(mapId, countryCoords, capitalCoords) {
    const mapContainer = document.getElementById(mapId);

    if (!mapContainer || mapContainer.innerHTML !== '') {
        // Vermijd dubbele initialisatie
        return;
    }

    const map = L.map(mapId).setView(countryCoords, 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Voeg marker toe voor de hoofdstad
    if (capitalCoords) {
        L.marker(capitalCoords).addTo(map).bindPopup('Capital').openPopup();
    }
}

// Foutmelding weergeven
function displayError(message) {
    countriesContainer.innerHTML = '';
    errorMessage.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`;
}

// Klikken op de filter button
filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchValue = countrySearch.value.trim();
    const selectedRegion = continentSelect.value;

    if (searchValue && selectedRegion) {
        axios.get(`https://restcountries.com/v3.1/name/${searchValue}`)
            .then(response => {
                const countries = response.data.filter(country =>
                    country.name.common.toLowerCase() === searchValue.toLowerCase() &&
                    country.region === selectedRegion
                );
                if (countries.length === 0) {
                    displayError(`The country "${searchValue}" does not exist in the region "${selectedRegion}".`);
                } else {
                    displayCountries(countries);
                }
            })
            .catch(error => {
                console.error("Error fetching countries:", error);
                displayError(`No results found for "${searchValue}".`);
            });
    } else if (searchValue) {
        axios.get(`https://restcountries.com/v3.1/name/${searchValue}`)
            .then(response => {
                const countries = response.data.filter(country =>
                    country.name.common.toLowerCase() === searchValue.toLowerCase()
                );
                if (countries.length === 0) {
                    displayError(`No exact match found for "${searchValue}".`);
                } else {
                    displayCountries(countries);
                }
            })
            .catch(error => {
                console.error("Error fetching countries:", error);
                displayError(`No results found for "${searchValue}".`);
            });
    } else if (selectedRegion) {
        getCountries(`https://restcountries.com/v3.1/region/${selectedRegion}`);
    } else {
        getCountries(`https://restcountries.com/v3.1/all`);
    }

    countrySearch.value = '';
});

// Initialiseer
getRegions();
getCountries(`https://restcountries.com/v3.1/all`);
