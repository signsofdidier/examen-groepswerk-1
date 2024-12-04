// Verkrijg referenties naar DOM-elementen die we later nodig hebben
const filterForm = document.getElementById("filter-form"); // Formulier waarmee gebruikers filters toepassen
const countrySearch = document.getElementById("country-search"); // Invoerveld voor landnaam
const continentSelect = document.getElementById("continent-select"); // Dropdown voor continenten
const countriesContainer = document.getElementById("countries-container"); // Container waarin de landen worden weergegeven
const errorMessage = document.getElementById("error-message"); // Div voor het weergeven van foutmeldingen

// Dynamisch de beschikbare regio's ophalen
function getRegions() {
    // API-aanroep naar alle landen
    axios.get('https://restcountries.com/v3.1/all')
        .then(response => {
            // Verkrijg alle unieke regio's (bijv. Europa, Azië)
            const regions = new Set(response.data.map(country => country.region).filter(region => region));
            regions.forEach(region => {
                // Voeg elke regio toe als optie in de dropdown
                const option = document.createElement("option");
                option.value = region; // Waarde die wordt gebruikt voor filtering
                option.textContent = region; // Tekst die wordt weergegeven aan de gebruiker
                continentSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error loading regions:", error); // Log fouten voor debugging
        });
}

// Dynamisch landen ophalen en weergeven op basis van een URL
function getCountries(url) {
    axios.get(url)
        .then(response => {
            const countries = response.data;
            if (!countries || countries.length === 0) {
                // Geen landen gevonden
                displayError("No countries found.");
                return;
            }
            // Toon de opgehaalde landen in de UI
            displayCountries(countries);
        })
        .catch(error => {
            console.error("Error fetching countries:", error); // Log fouten
            displayError("Error retrieving countries."); // Toon foutmelding in de UI
        });
}

// Landen in de container tonen
function displayCountries(countries) {
    let outputHTML = ''; // Variabele om de HTML op te bouwen

    countries.forEach(country => {
        // Verkrijg informatie over de valuta
        let currencyInfo = '';
        if (country.currencies) {
            const currencyKeys = Object.keys(country.currencies); // Valutacodes ophalen
            currencyInfo = currencyKeys.map(key => {
                const currency = country.currencies[key];
                return `${currency.name} (${currency.symbol || 'Geen symbool'})`; // Naam en symbool van de valuta
            }).join(', ');
        } else {
            currencyInfo = 'No currency info available.'; // Fallback tekst
        }

        // Verkrijg de talen die in het land worden gesproken
        const languages = country.languages ? Object.values(country.languages).join(', ') : 'No languages available!';

        // Uniek kaart-ID voor Leaflet-kaart in modal
        const mapId = `map-${country.cca3}`;

        // HTML opbouwen voor elk land en een modal
        outputHTML += `
            <div class="col">
                <!-- Kaart-knop -->
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
            
            <!-- Modal voor meer details -->
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
                                    <!-- Kaart-div -->
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

    countriesContainer.innerHTML = outputHTML; // Voeg de HTML toe aan de container
    errorMessage.innerHTML = ''; // Reset foutmeldingen

    // Initialiseer kaarten in modals
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

    const map = L.map(mapId).setView(countryCoords, 5); // Stel beginpositie van de kaart in

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Voeg een marker toe voor de hoofdstad
    if (capitalCoords) {
        L.marker(capitalCoords).addTo(map);
    }
}

// Foutmelding weergeven
function displayError(message) {
    countriesContainer.innerHTML = ''; // Leeg de landencontainer
    errorMessage.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`; // Toon foutmelding
}

// Klikken op de filter button
filterForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Voorkom herladen van de pagina

    const searchValue = countrySearch.value.trim(); // Waarde van zoekveld
    const selectedRegion = continentSelect.value; // Geselecteerde regio

    // Verschillende filteropties
    if (searchValue && selectedRegion) {
        // Zoeken op naam én regio
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
        // Zoeken op naam
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
        // Zoeken op regio
        getCountries(`https://restcountries.com/v3.1/region/${selectedRegion}`);
    } else {
        // Toon alle landen
        getCountries(`https://restcountries.com/v3.1/all`);
    }

    countrySearch.value = ''; // Reset het zoekveld
});

// Initialiseer de applicatie
getRegions(); // Haal regio's op
getCountries(`https://restcountries.com/v3.1/all`); // Haal alle landen op bij start
