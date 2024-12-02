// https://restcountries.com/v3.1/all


// functie findCountries
function findCountries() {
    // Ingrediënt ophalen uit het inputveld
    /*const searchInput = document.getElementById("country-search").value.trim();
    // Controleer of er een waarde in de variabele zit
    if (!searchInput) {
        alert("fill in a country to find!");
        return;
    }*/

    const url = `https://restcountries.com/v3.1/all`;
    // Axios gebruiken om de gegevens op te halen
    axios.get(url)
        .then(response => {
            console.log(response.data);
            const countries = response.data;
            if (!countries) {
                // Als er geen country zijn, toon een bericht
                document.getElementById("error-message").innerHTML = `
                        <div class="alert alert-warning" role="alert">
                            Geen countries gevonden met name: ${searchInput}.
                        </div>`;
                return;
            }

            // Dynamisch de country weergeven in cards
            let outputHTML = '';
            countries.forEach(country => {
                // Controleer of het land currencies heeft
                let currencyInfo = '';
                if (country.currencies) {
                    // Itereer door de currencies
                    const currencyKeys = Object.keys(country.currencies);
                    currencyInfo = currencyKeys.map(key => {
                        const currency = country.currencies[key];
                        return `${currency.name} (${currency.symbol || 'Geen symbool'})`;
                    }).join(', ');
                } else {
                    currencyInfo = 'No currency info available.';
                }
                //const currencyInfo = country.currencies ? Object.keys(country.currencies).join(', ') : 'No currency available!'
                const languages = country.languages ? Object.values(country.languages).join(', ') : 'No languages available!';
                outputHTML += `
                    <div class="col">
                        <!--Card-->
                        <article class="card">
                            <!--De vlag-->
                            <img src="${country.flags.svg}" class="card-img-top" alt="country_flag">
                            <div class="card-body">
                                <h5 class="card-title">${country.name.common}</h5>
                                <p class="card-text">Continent: ${country.continents} </p>
                                <p class="card-text">Population: ${country.population.toLocaleString()} </p>
                                <!-- Button trigger modal -->
                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${country.cca3}">
                                    Meer info
                                </button>
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

            // Voeg de kaarten toe aan de container
            document.getElementById("countries-container").innerHTML = outputHTML;
        })
        .catch(error => {
            console.error("Fout bij het ophalen van gegevens:", error);
            document.getElementById("error-message").innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Er is een fout opgetreden bij het ophalen van de gegevens.
                    </div>`;
        });
}

findCountries();