const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie tiltle is required'
    }),
    year: z.number().int().positive().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).optional().default(5.5),
    poster: z.string().url({
        message:'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action','Adventure','Comedy','Drama','fantasy','Horror','Thriller','Sci-Fi'],{
            required_error:'Movie genre is required',
            invalid_type_error: 'MOvie genre must be an array of enum genre'
        })
        
        // tambien podria hacer asi 
        //z.enum(['Action','Adventure','Comedy','Drama','fantasy','Horror','Thriller','Sci-Fi']).array()
    )
    
})

function valideMovie(object) {
    return movieSchema.safeParse(object)
}

function valideParcialMovie(input) {
    // el  metodo partial() hace que todas las validaciones sean opcionales
    return movieSchema.partial().safeParse(input)
}

module.exports = {
    valideMovie,
    valideParcialMovie
}