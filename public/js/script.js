const resultContainer = document.getElementById('results');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchTxt');

// Url de la para realizar la llamada a la funcion serverless de Netlify
const url = '/.netlify/functions/fetch-data';

// Url para la definicion de las imagenes w100 al w500 o original para alta resolucion
const urlImg = 'https://image.tmdb.org/t/p/w500';

// Cargar películas populares al inicio
getMovies(url);

// Función para obtener películas populares
async function getMovies(url) {
    const response = await fetch(url);
    const data = await response.json();
    showMovies(data.movies.results);
}

function createMovieElement(movie) {
    // Destruccion del objeto movie para usar los atributos necesario
    const { id, title, backdrop_path, release_date, vote_average, overview } = movie;

    const movieDiv = document.createElement('div');
    // Mostrar diferentes tamaños, dependiendo de la pantalla
    movieDiv.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-4', 'py-2', 'd-flex', 'justify-content-center', 'align-items-center');


    // Ternario por si la imagen no esta disponible, muestre una por defecto
    const imgSrc = backdrop_path
        ? `${urlImg + backdrop_path}`
        : '/img/no-disponible.jpg';
    const date = release_date ? `Estreno: ${release_date}` : 'Fecha desconocida';

    movieDiv.innerHTML = `
        <div class="card h-100" style="width: 22rem;">
            <img src="${imgSrc}" alt="${title}" class="card-img-top same-height"/>
            <div class="card-body d-flex flex-column">
                <h3 class="card-title">${title}</h3>
                <div class="mt-auto">
                    <p class="card-text mb-2">${date}</p>
                    <button class="btn btn-outline-info" id="abrirModal" data-bs-toggle="modal" data-bs-target="#exampleModal">Ver trailer</button>
                </div>
            </div>
        </div>
    `;

    // Evento para abrir el modal
    movieDiv.querySelector('#abrirModal').addEventListener('click', function () {
        openModal(id, overview, vote_average);
    });

    return movieDiv;
}

// Función para mostrar las películas populares
function showMovies(movies) {
    resultContainer.innerHTML = ''; // Limpiar resultados anteriores
    movies.forEach(movie => {
        const movieElement = createMovieElement(movie);
        resultContainer.appendChild(movieElement);
    });
}

function openModal(movieId, movieDescription, vote) {
    const rating = vote.toFixed(2);
    const modalBody = document.getElementById('modal-body');

    fetch(`/.netlify/functions/fetch-data?movieId=${movieId}`)
        .then(response => response.json())
        .then(data => {
            const video = data.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

            // Se muestra el trailer si esta disponible, si no se muestra el mensaje de 'Tráiler no disponible.'
            const trailerHTML = video
                ? `
        <div class="ratio ratio-16x9 mb-3">
          <iframe src="https://www.youtube.com/embed/${video.key}" frameborder="0" allowfullscreen></iframe>
        </div>
      `
                : `<p>Tráiler no disponible.</p>`;

            modalBody.innerHTML = `
      ${trailerHTML}
      <h4>Descripción</h4>
      <p>${movieDescription}</p>
      <p><strong>Puntuación:</strong> <span class="text-${getClassByRate(vote)}">${rating}</span></p>
    `;
        })
        .catch(error => {
            modalBody.innerHTML = `
      <p>Tráiler no disponible.</p>
      <h4>Descripción</h4>
      <p>${movieDescription}</p>
      <p><strong>Puntuación:</strong> <span class="text-${getClassByRate(vote)}">${rating}</span></p>
    `;
        });
}

// Funcion para mostrar con color la calificacion de la pelicula
function getClassByRate(vote) {
    if (vote >= 8) return 'success'
    else if (vote >= 5) return 'warning'
    else return 'danger'
}

// Modal
const modalElement = document.getElementById('exampleModal');
const modalBody = document.getElementById('modal-body');

// Evento que Bootstrap dispara despues de que el modal se cierra.
modalElement.addEventListener('hidden.bs.modal', function () {
    // Limpiar el contenido del modal al cerrarlo y asi forzar al detener el trailer
    modalBody.innerHTML = '';
});

// Buscar pelicula al prensionar la tecla Enter
searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      searchMovie();
    }
  });

searchBtn.addEventListener('click', searchMovie)
function searchMovie() {
    // Obtener el valor del input
    const searchTerm = searchInput.value.trim();

    // Validacion si el input esta vacio, se muestra las peliculas principales
    if (searchTerm === '') {
        getMovies(url);
    } else {
        // Si no está vacío, realiza la búsqueda con el nombre de la pelicula ingresado
        performSearch(searchTerm);
    }
}

// Realiza la búsqueda en la API pasandole el parametro search, funcion serverless de Netlify
function performSearch(search) {
    fetch(`/.netlify/functions/fetch-data?search=${search}`)
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            showMovies(data.results.results);
        })
        .catch(error => {
            resultContainer.innerHTML = `<p>Error al buscar películas</p>`;
        });
}