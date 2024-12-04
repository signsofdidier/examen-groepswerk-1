// pak de elementen uit de html die we nodig hebben voor de app
const filterForm = document.getElementById("filter-form") // formulier waar filters ingesteld worden
const countrySearch = document.getElementById("country-search") // invoerveld voor de naam van een land
const continentSelect = document.getElementById("continent-select") // dropdown waar gebruiker een continent kiest
const countriesContainer = document.getElementById("countries-container") // hier tonen we de landen
const errorMessage = document.getElementById("error-message") // div om foutmeldingen te tonen

// haalt regio’s op en zet die in de dropdown
function getRegions() {
    axios.get('https://restcountries.com/v3.1/all') // haal alle landen van de api
        .then(response => {
            const regions = new Set(response.data.map(country => country.region).filter(region => region))
            // maak een set met unieke regio’s, en filter lege waardes eruit

            regions.forEach(region => {
                const option = document.createElement("option") // maak een nieuwe option aan
                option.value = region // zet de waarde van de optie op de naam van de regio
                option.textContent = region // zet de zichtbare tekst van de optie
                continentSelect.appendChild(option) // voeg de optie toe aan de dropdown
            })
        })
        .catch(error => {
            console.error("Error loading regions:", error) // log fout als regio’s niet geladen kunnen worden
        })
}

// haalt landen op via de api url en toont ze op de pagina
function getCountries(url) {
    axios.get(url) // maak api-aanroep naar de url
        .then(response => {
            const countries = response.data // zet de data van de response in een variabele
            if (!countries || countries.length === 0) {
                // als er geen landen zijn of array is leeg
                displayError("No countries found.") // foutmelding tonen
                return
            }
            displayCountries(countries) // landen weergeven als er data is
        })
        .catch(error => {
            console.error("Error fetching countries:", error) // fout tonen in de console
            displayError("Error retrieving countries.") // fout tonen in de app
        })
}

// toont een lijst van landen in de pagina
function displayCountries(countries) {
    let outputHTML = ''

    countries.forEach(country => {
        let currencyInfo = '' // hier verzamelen we info over valuta van het land
        if (country.currencies) {
            // check of er valuta is
            const currencyKeys = Object.keys(country.currencies) // haal de keys van de valuta op
            currencyInfo = currencyKeys.map(key => {
                // voor elke key haal de naam en het symbool van de valuta op
                const currency = country.currencies[key]
                return `${currency.name} (${currency.symbol || 'Geen symbool'})`
            }).join(', ') // zet ze samen in een string, gescheiden door een komma
        } else {
            currencyInfo = 'No currency info available.' // standaardtekst als er geen valuta is
        }

        const languages = country.languages ? Object.values(country.languages).join(', ') : 'No languages available!'
        // talen ophalen als ze bestaan, anders standaardtekst

        const mapId = `map-${country.cca3}` // uniek id voor de kaart van elk land

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
        `
    })

    countriesContainer.innerHTML = outputHTML // de opgemaakte html in de container plaatsen
    errorMessage.innerHTML = '' // foutmeldingen leegmaken

    countries.forEach(country => {
        // voor elk land een kaart initialiseren
        const mapId = `map-${country.cca3}`
        const modal = document.getElementById(country.cca3)

        // Luistert naar het event wanneer de modal volledig zichtbaar is en initialiseert de kaart binnenin de modal
        modal.addEventListener('shown.bs.modal', () => {
            initializeMap(mapId, country.latlng, country.capitalInfo?.latlng || country.latlng)
        })
    })
}

// de leaflet kaart
function initializeMap(mapId, countryCoords, capitalCoords) {
    const mapContainer = document.getElementById(mapId)
    if (!mapContainer || mapContainer.innerHTML !== '') {
        // controleer of de kaart al gemaakt is
        return // stop als er al een kaart is
    }

    const map = L.map(mapId).setView(countryCoords, 5) // startpositie van de kaart instellen

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map) // voeg een tile layer toe

    if (capitalCoords) {
        L.marker(capitalCoords).addTo(map) // marker toevoegen voor de hoofdstad
    }
}

// toont foutmeldingen in de pagina
function displayError(message) {
    countriesContainer.innerHTML = '' // maak landen leeg
    errorMessage.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`
    // toon een foutmelding als warning
}

// luistert naar de filterknop en haalt de juiste data op
filterForm.addEventListener("submit", (event) => {
    event.preventDefault() // stop dat de pagina opnieuw laadt

    const searchValue = countrySearch.value.trim() // waarde van zoekveld
    const selectedRegion = continentSelect.value // gekozen continent

    if (searchValue && selectedRegion) {
        // als gebruiker zowel een land als een continent heeft ingevuld
        axios.get(`https://restcountries.com/v3.1/name/${searchValue}`)
            .then(response => {
                const countries = response.data.filter(country =>
                    country.name.common.toLowerCase() === searchValue.toLowerCase() &&
                    country.region === selectedRegion
                ) // filter alleen landen die voldoen aan beide filters
                if (countries.length === 0) {
                    displayError(`The country "${searchValue}" does not exist in the region "${selectedRegion}".`)
                } else {
                    displayCountries(countries)
                }
            })
            .catch(error => {
                console.error("Error fetching countries:", error)
                displayError(`No results found for "${searchValue}".`)
            })
    } else if (searchValue) {
        // alleen zoeken op naam
        axios.get(`https://restcountries.com/v3.1/name/${searchValue}`)
            .then(response => {
                const countries = response.data.filter(country =>
                    country.name.common.toLowerCase() === searchValue.toLowerCase()
                )
                if (countries.length === 0) {
                    displayError(`No exact match found for "${searchValue}".`)
                } else {
                    displayCountries(countries)
                }
            })
            .catch(error => {
                console.error("Error fetching countries:", error)
                displayError(`No results found for "${searchValue}".`)
            })
    } else if (selectedRegion) {
        // alleen zoeken op regio
        getCountries(`https://restcountries.com/v3.1/region/${selectedRegion}`)
    } else {
        // geen filters, toon alle landen
        getCountries(`https://restcountries.com/v3.1/all`)
    }

    countrySearch.value = '' // zoekveld leegmaken na het verzenden
})

// haalt regio’s en landen op
getRegions() // regio’s ophalen
getCountries(`https://restcountries.com/v3.1/all`) // alle landen ophalen bij laden van de pagina
