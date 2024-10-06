import fetch from 'node-fetch'

export const handler = async (event, context) => {
    const urlBase = 'https://api.themoviedb.org/3/'
    const apiKey = process.env.API_KEY
    const language = '&language=es-MX'

    // Verificar si se ha enviado un `movieId`
    const movieId = event.queryStringParameters.movieId
    const searchQuery = event.queryStringParameters.search
    
    try {
        if (movieId) {
            // Si se envía `movieId`, obtenemos los videos de esa película
            const videoUrl = `${urlBase}movie/${movieId}/videos?api_key=${apiKey}&language=${language}`
            const response = await fetch(videoUrl)
            const videoData = await response.json()

            return {
                statusCode: 200,
                body: JSON.stringify({
                    videos: videoData
                })
            }
        } else if (searchQuery) {
            // Si se envía `search`, realizamos una búsqueda de películas
            const searchUrl = `${urlBase}search/movie?api_key=${apiKey}&language=${language}&query=${searchQuery}`
            const response = await fetch(searchUrl)
            const searchData = await response.json()
            console.log(searchUrl)
            return {
                statusCode: 200,
                body: JSON.stringify({
                    results: searchData
                })
            };
        } else {
            // Si no se envía ni `movieId` ni `search`, obtenemos las películas populares
            const discoverUrl = `${urlBase}discover/movie?api_key=${apiKey}&language=${language}&sort_by=popularity.desc&page=1`
            console.log(discoverUrl)
            const response = await fetch(discoverUrl)
            const movieData = await response.json()

            return {
                statusCode: 200,
                body: JSON.stringify({
                    movies: movieData
                })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al obtener los datos' })
        }
    }
}