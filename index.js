//importando controlador de variable de entorno
require('dotenv').config();
//importando DEFINICIONES DE MONGOOSE desde models
const Person = require('./models/person');

//CREANDO SERVIDOR WEB CON EXPRESS
const express = require('express');

const morgan = require('morgan'); //middleware que trae info de las peticiones a las rutas del webServer

const cors = require('cors'); //middleware que perminte la solicitud de informacion entre diferentes hosting

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(express.static('docs')); //middleware necesario para leer archivos static
app.use(cors());
app.use(morgan('tiny')); //middleware de monitoreo en consola de peticiones a endpoints
app.use(express.json());

// Middleware personalizado para registrar el cuerpo de las solicitudes POST.
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log('Datos enviados:', req.body);
    }
    next();
});

//middleware controlador de solicitudes de EndPoints desconocidos
const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
};

//middleware controlador de errores
const errorHandler = (error, request, response, next)=>{
    console.error(error.message);

    if(error.name === 'CastError'){
      response.status(400).send({error: 'malformatted id'})
    } else if(error.name === 'ValidationError'){
        return response.status(400).json({error: error.message})
    }

    next(error)
    
};

//TRAYENDO RUTA PRINCIPAL DE LA API
app.get('/', (request, response)=>{

    response.send('<h1>API Agenda!</h1><br><p><a href="http://localhost:3001/api/persons">PERSONS..</a><br><a href="http://localhost:3001/api/info">INFO..</a></p>');
});

//trayendo todos los datos de la API
app.get('/api/persons', (request, response, next)=>{

    Person.find({}).then(persons =>{

        if(persons){
            response.json(persons);
        }else{
            response.status(404).end();
        }
       
    })
    .catch(error => next(error));
   
});

//TRAYENDO INFO DE LA API
app.get('/api/info', (request, response, next)=>{

    //Codigo para mostar info de la API-Agenda
    const horaActual = new Date().toLocaleString();

    Person.find().then(person =>{
        const respuestaInfo = ()=>{
            return `
                <h1>API-AGENDA||INFO</h1>
                <p>
                    La agenda tiene informacion de <strong>${person.length}</strong> personas, 
                    Ciudad de Mexico <strong>${horaActual}</strong> (Zona horaria America Central).
                    <br>
                    <a href="http://localhost:3001/">Regresar a pagina principal</a>
                </p>`;
        };

        response.send(respuestaInfo())    
    })
    .catch(error => next(error));

});

//TRAYENDO INFO DE LA API POR ID
app.get('/api/persons/:id', (request, response, next)=>{

    Person.findById(request.params.id).then(person =>{
        
        if(person){
          console.log(person);
          response.json(person);
        }else{
            response.status(404).end();
        }
        
    })
    .catch(error => next(error));
    
})

//BORRAR RECURSO
app.delete('/api/persons/:id', (request, response, next)=>{

    Person.deleteOne({_id: request.params.id}).then(() =>{
        //GET ALL PERSONS
        Person.find().then(persons =>{
            //filter person list of eleminate the person eliminate
            const filteredPersons = persons.filter(person => person._id.toString() !== request.params.id);
            
            //send filter list
            response.status(200).json(filteredPersons);
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
 
});

//CREANDO NUEVO OBJETO
app.post('/api/persons', (request, response, next)=>{

    const body = request.body;
    const name = body.name;
    const number = body.number;
   

    if(!name || !number){
        return response.status(400).json({
            error: 'name and phone are required'
        });
    };

    const person = new Person({
        name: name,
        number: number,
    })
    
    person.save().then(savedPerson =>{
        response.json(savedPerson);
    })
    .catch(error => next(error));
    
});

//actualizar objeto

app.put('/api/persons/:name', (request, response, next)=>{

    
    const body = request.body;
    const personName = body.name; // Obtener el nombre de la persona desde la URL
    const updatedNumber = body.number; // Obtener el nuevo número del cuerpo de la solicitud

    Person.findOne({ name: personName }, {runValidators: true, context: 'query'}) // Encuentra la persona por nombre
     .then(person => {
         if (person) {
             person.number = updatedNumber; // Actualiza el número de la persona
             person.save() // Guarda los cambios en la base de datos
                 .then(updatedPerson => {
                     response.status(200).json(updatedPerson); // Envía la persona actualizada al frontend
                 })
                 .catch(error => next(error));
         } else {
             response.status(404).json({ message: 'Persona no actualizda' });
         }
     })
     .catch(error => next(error));

});

app.use(unknownEndpoint);
app.use(errorHandler);





//definicion de puerto para levantar servidor web
// eslint-disable-next-line no-undef
const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server runnig on port http://localhost:${PORT}`);