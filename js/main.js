// https://restcountries.com/v3.1/all

// Functie om de cocktails op te halen
function zoekLanden() {
    // Land ophalen uit het inputveld
    const land = document.getElementById("ingredient").value.trim();
    // Controleer of er een waarde in de variabele zit
    if (!land) {
        alert("Voer een land in om te zoeken!");
        return;
    }

    const url = `https://restcountries.com/v3.1/all`;
    // Axios gebruiken om de gegevens op te halen
    axios.get(url)
        .then(response => {
            console.log(response);
            // const cocktails = response.data.drinks;
            // if (!cocktails) {
            //     // Als er geen cocktails zijn, toon een bericht
            //     document.getElementById("cocktail-lijst").innerHTML = `
            //             <div class="alert alert-warning" role="alert">
            //                 Geen cocktails gevonden met ingrediënt: ${ingredient}.
            //             </div>`;
            //     return;
            // }
            //
            // // Dynamisch de cocktails weergeven in cards
            // let outputHTML = '';
            // cocktails.forEach(cocktail => {
            //     outputHTML += `
            //             <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            //                 <div class="card h-100">
            //                     <img src="${cocktail.strDrinkThumb}" class="card-img-top" alt="${cocktail.strDrink}">
            //                     <div class="card-body">
            //                         <h5 class="card-title">${cocktail.strDrink}</h5>
            //                         <p class="card-text">Heerlijke cocktail op basis van ${ingredient}.</p>
            //                         <button class="btn btn-primary">
            //                             <i class="bi bi-info-circle"></i> Meer info
            //                         </button>
            //                     </div>
            //                 </div>
            //             </div>
            //         `;
            // });
            //
            // // Voeg de kaarten toe aan de container
            // document.getElementById("cocktail-lijst").innerHTML = outputHTML;
        })
        // .catch(error => {
        //     console.error("Fout bij het ophalen van gegevens:", error);
        //     document.getElementById("cocktail-lijst").innerHTML = `
        //             <div class="alert alert-danger" role="alert">
        //                 Er is een fout opgetreden bij het ophalen van de gegevens.
        //             </div>`;
        // });
}