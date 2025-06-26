const resultContainer = document.getElementById('results');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchTxt');

// Url de la para realizar la llamada a la funcion serverless de Netlify
const url = '/.netlify/functions/fetch-data';

// Url para la definicion de las imagenes w100 al w500 o original para alta resolucion
const urlImg = 'https://image.tmdb.org/t/p/w500';

// Cargar películas populares al inicio
getMovies(url);

// Función para mostrar loading
function showLoading() {
    resultContainer.innerHTML = `
        <div class="col-12 d-flex justify-content-center align-items-center" style="min-height: 300px;">
            <div class="text-center">
                <div class="loading-spinner mb-3"></div>
                <p class="text-white-50">Cargando películas...</p>
            </div>
        </div>
    `;
}

// Función para obtener películas populares
async function getMovies(url) {
    showLoading();
    try {
        const response = await fetch(url);
        const data = await response.json();
        showMovies(data.movies.results);
    } catch (error) {
        showError('Error al cargar las películas populares');
    }
}

// Función para mostrar errores
function showError(message) {
    resultContainer.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger glass text-center" role="alert">
                <h4 class="alert-heading">¡Oops!</h4>
                <p>${message}</p>
                <button class="btn btn-outline-info" onclick="getMovies(url)">Intentar de nuevo</button>
            </div>
        </div>
    `;
}

function createMovieElement(movie, index = 0) {
    // Destruccion del objeto movie para usar los atributos necesario
    const { id, title, backdrop_path, release_date, vote_average, overview } = movie;

    const movieDiv = document.createElement('div');
    // Mostrar diferentes tamaños, dependiendo de la pantalla
    movieDiv.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-4', 'py-3', 'd-flex', 'justify-content-center', 'align-items-stretch');

    // Ternario por si la imagen no esta disponible, muestre una por defecto
    const imgSrc = backdrop_path
        ? `${urlImg + backdrop_path}`
        : '/img/no-disponible.jpg';
    const date = release_date ? `Estreno: ${release_date}` : 'Fecha desconocida';
    
    // Formatear rating
    const rating = vote_average ? vote_average.toFixed(1) : 'N/A';
    const ratingClass = getRatingClass(vote_average);

    movieDiv.innerHTML = `
        <div class="card h-100" style="width: 100%; max-width: 22rem; animation-delay: ${index * 0.1}s;">
            <div class="position-relative">
                <img src="${imgSrc}" alt="${title}" class="card-img-top same-height"/>
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge ${ratingClass} fs-6 px-2 py-1">
                        ⭐ ${rating}
                    </span>
                </div>
            </div>
            <div class="card-body d-flex flex-column">
                <h3 class="card-title">${title}</h3>
                <div class="mt-auto">
                    <p class="card-text mb-3 text-white-50">${date}</p>
                    <button class="btn btn-outline-info w-100" id="abrirModal" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <i class="fas fa-play me-2"></i>Ver trailer
                    </button>
                </div>
            </div>
        </div>
    `;

    // Evento para abrir el modal
    movieDiv.querySelector('#abrirModal').addEventListener('click', function () {
        openModal(id, overview, vote_average, title);
    });

    return movieDiv;
}

// Función para obtener clase de rating
function getRatingClass(vote) {
    if (vote >= 8) return 'bg-success';
    else if (vote >= 6) return 'bg-warning';
    else if (vote >= 4) return 'bg-info';
    else return 'bg-danger';
}

// Función para mostrar las películas populares
function showMovies(movies) {
    resultContainer.innerHTML = ''; // Limpiar resultados anteriores
    
    if (!movies || movies.length === 0) {
        resultContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info glass text-center" role="alert">
                    <h4 class="alert-heading">Sin resultados</h4>
                    <p>No se encontraron películas con ese término de búsqueda.</p>
                </div>
            </div>
        `;
        return;
    }
    
    movies.forEach((movie, index) => {
        const movieElement = createMovieElement(movie, index);
        resultContainer.appendChild(movieElement);
    });
}

function openModal(movieId, movieDescription, vote, title) {
    const rating = vote ? vote.toFixed(1) : 'N/A';
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modalLabel');
    
    // Actualizar título del modal
    modalTitle.textContent = `${title} - Trailer`;
    
    // Mostrar loading en el modal
    modalBody.innerHTML = `
        <div class="text-center py-4">
            <div class="loading-spinner mb-3"></div>
            <p class="text-white-50">Cargando trailer...</p>
        </div>
    `;

    fetch(`/.netlify/functions/fetch-data?movieId=${movieId}`)
        .then(response => response.json())
        .then(data => {
            const video = data.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

            // Se muestra el trailer si esta disponible, si no se muestra el mensaje de 'Tráiler no disponible.'
            const trailerHTML = video
                ? `
                <div class="ratio ratio-16x9 mb-4">
                  <iframe src="https://www.youtube.com/embed/${video.key}" frameborder="0" allowfullscreen></iframe>
                </div>
              `
                : `
                <div class="alert alert-warning glass text-center mb-4" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Tráiler no disponible
                </div>
              `;

            modalBody.innerHTML = `
              ${trailerHTML}
              <div class="row">
                <div class="col-md-8">
                    <h5 class="text-white mb-3">Descripción</h5>
                    <p class="text-white-50 lh-lg">${movieDescription || 'Descripción no disponible.'}</p>
                </div>
                <div class="col-md-4">
                    <div class="glass p-3 rounded">
                        <h6 class="text-white mb-2">Puntuación</h6>
                        <div class="d-flex align-items-center">
                            <span class="text-${getClassByRate(vote)} fs-4 fw-bold me-2">${rating}</span>
                            <small class="text-white-50">/ 10</small>
                        </div>
                        <div class="progress mt-2" style="height: 6px;">
                            <div class="progress-bar bg-${getClassByRate(vote)}" 
                                 style="width: ${(vote * 10)}%"></div>
                        </div>
                    </div>
                </div>
              </div>
            `;
        })
        .catch(error => {
            modalBody.innerHTML = `
              <div class="alert alert-danger glass text-center mb-4" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Error al cargar el trailer
              </div>
              <div class="row">
                <div class="col-md-8">
                    <h5 class="text-white mb-3">Descripción</h5>
                    <p class="text-white-50 lh-lg">${movieDescription || 'Descripción no disponible.'}</p>
                </div>
                <div class="col-md-4">
                    <div class="glass p-3 rounded">
                        <h6 class="text-white mb-2">Puntuación</h6>
                        <div class="d-flex align-items-center">
                            <span class="text-${getClassByRate(vote)} fs-4 fw-bold me-2">${rating}</span>
                            <small class="text-white-50">/ 10</small>
                        </div>
                        <div class="progress mt-2" style="height: 6px;">
                            <div class="progress-bar bg-${getClassByRate(vote)}" 
                                 style="width: ${(vote * 10)}%"></div>
                        </div>
                    </div>
                </div>
              </div>
            `;
        });
}

// Funcion para mostrar con color la calificacion de la pelicula
function getClassByRate(vote) {
    if (vote >= 8) return 'success'
    else if (vote >= 6) return 'warning'
    else if (vote >= 4) return 'info'
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
        event.preventDefault();
        searchMovie();
    }
});

// Efecto de typing en el placeholder
let placeholderText = "Buscar película...";
let currentText = "";
let isDeleting = false;
let charIndex = 0;

function typeEffect() {
    if (!isDeleting && charIndex < placeholderText.length) {
        currentText += placeholderText.charAt(charIndex);
        charIndex++;
    } else if (isDeleting && charIndex > 0) {
        currentText = currentText.slice(0, -1);
        charIndex--;
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
            setTimeout(typeEffect, 2000);
            return;
        }
    }
    
    if (searchInput && document.activeElement !== searchInput) {
        searchInput.placeholder = currentText;
    }
    
    setTimeout(typeEffect, isDeleting ? 50 : 150);
}

// Iniciar efecto de typing
setTimeout(typeEffect, 1000);

searchBtn.addEventListener('click', searchMovie);

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
    showLoading();
    fetch(`/.netlify/functions/fetch-data?search=${encodeURIComponent(search)}`)
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            showMovies(data.results.results);
        })
        .catch(error => {
            showError('Error al buscar películas. Intenta de nuevo.');
        });
}

// Smooth scroll para mejor UX
document.addEventListener('DOMContentLoaded', function() {
    // Agregar smooth scroll
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Efecto parallax sutil en el fondo
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const bg = document.querySelector('.custom-bg');
        if (bg) {
            bg.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
});