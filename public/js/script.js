const resultContainer = document.getElementById('results');
const url = '/.netlify/functions/fetch-data';

const urlImg = 'https://image.tmdb.org/t/p/w400'
// Cargar películas populares al inicio
getMovies(url);

// Función para obtener películas populares
async function getMovies(url) {
    const response = await fetch(url);
    const data = await response.json();

    console.log(data.movies.results);
    showMovies(data.movies.results);
}

function createMovieElement(movie) {
    const { id, title, backdrop_path, release_date, vote_average, overview } = movie;

    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie');

    const imgSrc = backdrop_path ? `${urlImg + backdrop_path}` : 'https://th.bing.com/th/id/OIP.H1gHhKVbteqm1U5SrwpPgwAAAA?rs=1&pid=ImgDetMain';
    const date = release_date ? `Estreno: ${release_date}` : 'Fecha desconocida';
    movieDiv.innerHTML = `
        <img src="${imgSrc}" alt="${title}" />
        <div class="movie-info">
            <h3>${title}</h3>
            <p>${date}</p>
            <button class="play-button">Play</button>
        </div>
    `;

    // Agregar el evento para abrir el modal con los videos
    movieDiv.querySelector('.play-button').addEventListener('click', function () {
        openModal(id, overview, vote_average);
    });

    return movieDiv;
}

// Función para mostrar las películas populares
function showMovies(movies) {
    resultContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = createMovieElement(movie);
        resultContainer.appendChild(movieElement);
    });
}












/* MODAL */
const modal = document.getElementById('myModal');
const span = document.getElementsByClassName('close')[0];

function openModal(movieId, movieDescription, vote) {
    const modalBody = document.getElementById('modal-body');
    const rating = vote.toFixed(2);

    // Llamada a la función serverless para obtener los videos de la película
    fetch(`/.netlify/functions/fetch-data?movieId=${movieId}`)
        .then(response => response.json())
        .then(data => {
            const video = data.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

            if (video) {
                modalBody.innerHTML = `
                    <h2>Tráiler</h2>
                    <iframe width="100%" height="315px" src="https://www.youtube.com/embed/${video.key}" frameborder="0" allowfullscreen></iframe>
                    <div class="trailer-info">
                        <h3>Descripción</h3>
                        <p>${movieDescription}</p>
                        <p>Calificación: <span class="${getClassByRate(rating)}">${rating}</span></p>
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <p>Tráiler no disponible.</p>
                    <h3>Descripción</h3>
                    <p>${movieDescription}</p>
                `;
            }

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Error fetching trailer:', error);
            modalBody.innerHTML = `
                <p>Error al cargar el tráiler.</p>
                <h3>Descripción</h3>
                <p>${movieDescription}</p>
            `;
            modal.style.display = 'block';
        });
}

// Función para cerrar el modal
span.onclick = function () {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Función para obtener la clase según la calificación
function getClassByRate(vote) {
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}
