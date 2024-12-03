// Haal belangrijke elementen uit de DOM (Document Object Model)
const filterForm = document.getElementById("filter-form"); // Het formulier voor het filteren van landen
const countrySearch = document.getElementById("country-search"); // Het zoekveld voor landen
const continentSelect = document.getElementById("continent-select"); // Het dropdown-menu voor continenten
const countriesContainer = document.getElementById("countries-container"); // De container voor het weergeven van landen
const errorMessage = document.getElementById("error-message"); // De container voor het weergeven van foutmeldingen

// Functie om regio's (continenten) dynamisch op te halen
function getRegions() {
    axios.get('https://restcountries.com/v3.1/all') // Haalt alle landen op
        .then(response => {
            // Haal unieke regio's (continenten) uit de responsdata
            const regions = new Set(response.data.map(country => country.region).filter(region => region));

            // Voeg regio's toe aan het dropdown-menu
            regions.forEach(region => {
                const option = document.createElement("option"); // Maak een nieuw <option> element
                option.value = region; // Zet de waarde van de optie naar de regio
                option.textContent = region; // Zet de tekst van de optie naar de regio
                continentSelect.appendChild(option); // Voeg de optie toe aan het dropdown-menu
            });
        })
        .catch(error => {
            console.error("Error loading regions:", error); // Foutafhandeling voor regio's
        });
}

// Functie om landen dynamisch op te halen
function getCountries(url) {
    axios.get(url) // Haalt landen op via de gegeven URL
        .then(response => {
            const countries = response.data; // Verkrijg de lijst van landen uit de response
            // Controleer of er geen landen zijn (bijvoorbeeld een lege array)
            if (!countries || countries.length === 0) {
                displayError("No countries found."); // Toon foutmelding als geen landen zijn gevonden
                return;
            }
            displayCountries(countries); // Als landen gevonden zijn, geef ze weer
        })
        .catch(error => {
            console.error("Error fetching countries:", error); // Foutafhandeling voor landen
            displayError("Error retrieving countries."); // Toon algemene foutmelding
        });
}

// Functie om landen weer te geven in de container
function displayCountries(countries) {
    let outputHTML = ''; // Variabele om HTML output op te bouwen

    // Itereer door elk land en genereer HTML
    countries.forEach(country => {
        let currencyInfo = ''; // Variabele voor de valuta-informatie
        if (country.currencies) { // Controleer of het land valuta-informatie heeft
            const currencyKeys = Object.keys(country.currencies); // Verkrijg de sleutels van de valuta-informatie
            currencyInfo = currencyKeys.map(key => {
                const currency = country.currencies[key];
                return `${currency.name} (${currency.symbol || 'Geen symbool'})`; // Formatteer de valuta-informatie
            }).join(', '); // Maak een lijst van valuta's gescheiden door komma's
        } else {
            currencyInfo = 'No currency info available.'; // Geen valuta beschikbaar
        }

        // Verkrijg de talen van het land
        const languages = country.languages ? Object.values(country.languages).join(', ') : 'No languages available!';

        // Bouw de HTML voor dit land
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
                                         <!--leaflet map-->
                                            <div class="col-12 col-lg-8 modal-kaart mb-4 mb-lg-0">
                                                <!-- Hier komt de leaflet map -->
                                                <img src="https://placehold.co/800x500" class="img-fluid" alt="">
                                            </div>
                                            <div class="col-12 col-lg-4">
                                                <img class="img-fluid w-100 mb-4" src="${country.flags.svg}" alt="country_flag">
                                                <p class="mb-2"><span class="fw-bold">Capitol:</span> ${country.capital}</p>
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

    // Zet de gegenereerde HTML in de container
    countriesContainer.innerHTML = outputHTML;
    errorMessage.innerHTML = ''; // Verwijder foutmeldingen
}

// Functie voor het weergeven van foutmeldingen
function displayError(message) {
    countriesContainer.innerHTML = ''; // Verwijder de landenoutput
    errorMessage.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`; // Toon foutmelding
}

// Event listener voor het filterformulier
filterForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Voorkom de standaard formulieractie

    const searchValue = countrySearch.value.trim(); // Verkrijg de zoekwaarde uit het zoekveld
    const selectedRegion = continentSelect.value; // Verkrijg de geselecteerde regio

    // Als zowel een landnaam als regio geselecteerd zijn
    if (searchValue && selectedRegion) {
        axios.get(`https://restcountries.com/v3.1/name/${searchValue}`) // Zoek landen op naam
            .then(response => {
                const countries = response.data.filter(country =>
                    country.name.common.toLowerCase() === searchValue.toLowerCase() &&
                    country.region === selectedRegion // Filter landen op regio en naam
                );
                if (countries.length === 0) {
                    displayError(`The country "${searchValue}" does not exist in the region "${selectedRegion}".`); // Toon foutmelding als geen landen gevonden
                } else {
                    displayCountries(countries); // Geef de landen weer
                }
            })
            .catch(error => {
                console.error("Error fetching countries:", error); // Foutafhandeling
                displayError(`No results found for "${searchValue}".`); // Toon foutmelding
            });
    } else if (searchValue) { // Alleen zoeken op naam zonder regio
        axios.get(`https://restcountries.com/v3.1/name/${searchValue}`)
            .then(response => {
                const countries = response.data.filter(country =>
                    country.name.common.toLowerCase() === searchValue.toLowerCase() // Filter landen op exacte naam
                );
                if (countries.length === 0) {
                    displayError(`No exact match found for "${searchValue}".`); // Toon foutmelding als geen exacte overeenkomsten gevonden
                } else {
                    displayCountries(countries); // Geef de landen weer
                }
            })
            .catch(error => {
                console.error("Error fetching countries:", error); // Foutafhandeling
                displayError(`No results found for "${searchValue}".`); // Toon foutmelding
            });
    } else if (selectedRegion) { // Alleen zoeken op regio
        getCountries(`https://restcountries.com/v3.1/region/${selectedRegion}`); // Verkrijg landen per regio
    } else { // Geen zoekopdracht, toon alle landen
        getCountries(`https://restcountries.com/v3.1/all`); // Verkrijg alle landen
    }

    countrySearch.value = ''; // Leeg het zoekveld na het indienen
});

// Initialiseer de regio's en landen bij het laden van de pagina
getRegions(); // Haal regio's op bij het laden
getCountries(`https://restcountries.com/v3.1/all`); // Haal alle landen op bij het laden
