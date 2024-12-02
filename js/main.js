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
                outputHTML += `
                    <div class="col">
                        <!--Card-->
                        <article class="card">
                            <!--De vlag-->
                            <img src="${country.flags.svg}" class="card-img-top" alt="">
                            <div class="card-body">
                                <h5 class="card-title">${country.name.common}</h5>
                                <p class="card-text">Continent: ${country.continents} </p>
                                <p class="card-text">Population: ${country.population.toLocaleString()} </p>
                                <!-- Button trigger modal -->
                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    Meer info
                                </button>
                            </div>
                        </article>
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