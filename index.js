const { json } = require("express")
const crypto = require('node:crypto')
const { valideMovie,valideParcialMovie } = require('./schematic')

const express = require('express')
const app = express()
const port = process.env.PORT ?? 1234
const movies = require('./movies.json')

// npm install cors ( para solucionar el problema del cors )
const cors = require('cors')

const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midudev',
    ]

    

// deshabilitar el header x-powered-by: express
app.disable('x-powered-by') 
// sin este middleware no podremos acceder a el request.body
app.use(express.json()) 


// si no se le agrega nada al middkeware cors este colocara un * a todas las cabeceras app.use(cors())
app.use(cors({
    origin:(origin,callback) =>{
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234',
            'https://movies.com',
            'https://midudev',
        ]

        if(ACCEPTED_ORIGINS .includes(origin) || !origin){
        return callback(null, true)
        }

        
    }
}))


app.get('/',(request,response) => {
    response.json({ message: 'hola mundo'})
})

// todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies',(request,response) => {
    /*
    // esto es opcional por si se tiene una lista de direcciones origenes a aceptar
    const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midudev',

    ]
    const origin = require.header('origin')
    if(ACCEPTED_ORIGINS .includes(origin) || !origin){
        response.header('Access-Control-Allow-Origin',origin)
    }
    */
    response.header('Access-Control-Allow-Origin','http://localhost:8080')
    const { genre } = request.query
    console.log(genre)
    if ( genre ){
        const filterMovies = movies.filter(
            movie => movie.genre.some( g => g.toLowerCase() === genre.toLowerCase())
        )
        return response.json(filterMovies)
    }
    response.json(movies)
})

app.post('/movies',(request,response) => {

/*
    const {
        title,
        genre,
        year,
        director,
        duration,
        rate,
        poster
    } = request.body
    */

    const result = valideMovie(request.body)
    console.log(request.body)
    // tambien puede ser un result.error
    if(!result.success) {
        // tambien puede ser la 422  ya que significa que no se pudo crear o procesar
        return response.status(400).json({error: JSON.parse(result.error.message)})
    }



    // npm install zod -E // esta herramienta sirve para validaciones de datos porque se ejecuta en runtime
    const newMovie = {
         // esto tambien funciona en el navegador
        id: crypto.randomUUID(),
        /*
        title,
        genre,
        year,
        director,
        duration,
        rate: rate ?? 0,
        poster
        */
        ...result.data
    }
// Esto no seria REST , porque estamos guardando el estado de la aplicacion en memoria
movies.push(newMovie)
console.log(newMovie)


})


app.patch('/movies/:id',(request,response) => {
    
    const result = valideParcialMovie(request.body)
    
    if(!result.success){
        return response.status(400).json({error: JSON.parse(result.error.message)})
    }



    const { id } = request.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if( movieIndex === -1){
        return response.status(400).json({error: 'No exite la pelicula'})
    }

    // aqui se redefine los argumentos de movies[movieIndex] por los de result.data
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    response.json(updateMovie)


})


app.get('/movies/:id',(request,response) => {
    const { id } = request.params
    const movie = movies.find(movie => movie.id === id)
    if(movie) return response.json(movie)

    response.status(404).json({"message":"Movie not found"})
})

app.delete('/movies/:id',(request,response) => {
    const origin = request.header('origin')
    
    if(ACCEPTED_ORIGINS .includes(origin) || !origin){
        response.header('Access-Control-Allow-Origin',origin)
    }

    const { id } = request.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    
    if(movieIndex === -1){
        return response.status(404).json({Message: 'MOvie not found'})
    }

    movies.splice(movieIndex, 1)

    return response.json({message: 'Movie delete'})
})

app.options('/movies/:id',(request,response) => {
    const origin = request.header('origin')

    if(ACCEPTED_ORIGINS .includes(origin) || !origin){
        response.header('Access-Control-Allow-Origin',origin)
        response.header('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
    }
    response.sendStatus(200)
})
app.listen(port,() => {
    console.log(`el servidor esta corriendo por el puerto ${port}`)
})

// NOTA REST : ARQUITECTURA DE SOFTWARE
// ESCALABILIDAD,PORTABILIDAD,FIABILIDAD,FACIL DE MODIFICAR,VISIBILIDAD,SIMPLICIDAD
// RESURSOS(RESOURCES) CADA RECURSO SE IDENTIFICA CON UNA URL
// METODOS: DEFINIR LAS OPERACINES QUE SE PUEDEN REALIZAR CON LOS RECURSOS ( CRUD )
// REPRESENTACION JSON,XML,HTML
// STATELESS EL CLIENTE DEBE ENVIAR TODA LA INFORMACION NECESARIA PARA PROCESAR LA REQUEST
// PERMITE QUE CLIENTE Y SERVIDOR EVOLUCIONES DE MANERA SEPARADA

// METODOS NORMALES: GET/HEAD/POST
// METODOS COMPLEJOS: PUT/PATCH/DELETE EN ESTO EXISTE CORS PRE-Flight OPTIONS

// IDEMPOTENCIA : PROPIEDAD DE REALIZAR UNA ACCION DETERMINADA VARIAS VECES Y AUN ASI CONSEGUIR SIEMPRE EL MISMO RESULTADO QUE SE OBTENDRIA AL HACERLO UNA VEZ
// POST NO ES IDEMPOTENTE PUT SI ES IDEMPOTENTE 
// METODO PATH: ACTUALIZAR PARCIALMENTE UN ELEMENTO / RECURSO

// npx servor mas la direccion donde esta el html si se ejecuta elnpx desde el mismo rigen del fichero no se coloca nada

// CORS = Error de uso compartido de recursos entre dominios( este problema se puede solucionar desde el servidor)
// usando una respuesta a la peticion de la siguiente manera response.header('Access-Control-Allow-Origin','*')
// se coloca un * para decir que cualquier petcion puede ser respondida pero tambien se podria colocar cual es la direccion
// donde se realiza esa peticion siendo la unica en tener permiso ejemplo  
// response.header('Access-Control-Allow-Origin','http://localhost:8080/')