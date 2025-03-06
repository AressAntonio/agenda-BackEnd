//exportando controlador de variable de entorno
require('dotenv').config();
//  Exportando DEFINICIONES DE MONGOOSE desde models
const Person = require('./models/person');

//CREANDO SERVIDOR WEB CON EXPRESS
const express = require('express');
const morgan = require('morgan'); //middleware que trae info de las peticiones a las rutas del webServer
const cors = require('cors'); //middleware que perminte la solicitud de informacion entre diferentes hosting
const bodyParser = require('body-parser'); 
const app = express();
app.use(bodyParser.json());
app.use(express.static('dist')); //middleware necesario para leer archivos static
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

// Middleware personalizado para registrar el cuerpo de las solicitudes POST.
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log('Datos enviados:', req.body);
    }
    next();
});

//TRAYENDO RUTA PRINCIPAL DE LA API
app.get('/', (request, response)=>{

    response.send('<h1>API Agenda!</h1><br><p><a href="http://localhost:3001/api/persons">PERSONS..</a><br><a href="http://localhost:3001/api/info">INFO..</a></p>');
});

//trayendo todos los datos de la API
app.get('/api/persons', (request, response)=>{

    Person.find({}).then(persons =>{

        response.json(persons);
    })
   
})

//TRAYENDO INFO DE LA API
app.get('/api/info', (request, response)=>{

    //Codigo para mostar info de la API-Agenda
    const horaActual = new Date().toLocaleString();
    const cantidadEntradas = Person.length;

    const respuestaInfo = ()=>{
    return `
        <h1>API-AGENDA||INFO</h1>
        <p>
            La agenda tiene informacion de <strong>${cantidadEntradas}</strong> personas, 
            Ciudad de Mexico <strong>${horaActual}</strong> (Zona horaria America Central).
            <br>
            <a href="http://localhost:3001/">Regresar a pagina principal</a>
        </p>
    `;
    };

    response.send(respuestaInfo());
})

//TRAYENDO INFO DE LA API POR ID
app.get('/api/persons/:id', (request, response)=>{

    Person.findById(request.params.id).then(person =>{
        
        console.log(person);
        response.json(person);
    })
    
})

//BORRAR RECURSO
app.delete('/api/persons/:id', (request, response)=>{

    Person.deleteOne({_id: request.params.id}).then(() =>{
        //GET ALL PERSONS
        Person.find().then(persons =>{
            //filter person list of eleminate the person eliminate
            const filteredPersons = persons.filter(person => person._id.toString() !== request.params.id);
            
            //send filter list
            response.status(200).json(filteredPersons);
        })
        .catch(error =>{
            console.error(error);
            response.status(500).json({error:'Error al obtener las Personas'});
        });
    })
    .catch(error => {
            console.error(error);
            response.status(500).json({ error: 'Error al eliminar la persona' });
    });

    //response.status(204).end();
})

//CREANDO NUEVO OBJETO
app.post('/api/persons', (request, response)=>{

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
    
})

//actualizar objeto

app.put('/api/persons/:name', (request, response)=>{

    
    const body = request.body;
    const personName = body.name; // Obtener el nombre de la persona desde la URL
    const updatedNumber = body.number; // Obtener el nuevo número del cuerpo de la solicitud

    Person.findOne({ name: personName }) // Encuentra la persona por nombre
     .then(person => {
         if (person) {
             person.number = updatedNumber; // Actualiza el número de la persona
             person.save() // Guarda los cambios en la base de datos
                 .then(updatedPerson => {
                     response.status(200).json(updatedPerson); // Envía la persona actualizada al frontend
                 })
                 .catch(error => {
                     console.error(error);
                     response.status(500).json({ error: 'Error al actualizar la persona' });
                 });
         } else {
             response.status(404).json({ message: 'Persona no encontrada' });
         }
     })
     .catch(error => {
         console.error(error);
         response.status(500).json({ error: 'Error al buscar la persona' });
     });
})





//definicion de puerto para levantar servidor web
const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server runnig on port http://localhost:${PORT}`);