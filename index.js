//CREANDO SERVIDOR WEB CON EXPRESS
const express = require('express');
const morgan = require('morgan'); //middleware que trae info de las peticiones a las rutas del webServer
const cors = require('cors'); //middleware que perminte la solicitud de informacion entre diferentes hosting
const bodyParser = require('body-parser'); 
const app = express();
app.use(bodyParser.json());
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

//DATOS DE LA api
let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

//TRAYENDO RUTA PRINCIPAL DE LA API
app.get('/', (request, response)=>{

    response.send('<h1>API Agenda!</h1><br><p><a href="http://localhost:3001/api/persons">PERSONS..</a><br><a href="http://localhost:3001/api/info">INFO..</a></p>');
});

//trayendo todos los datos de la API
app.get('/api/persons', (request, response)=>{

    response.json(persons);
})

//TRAYENDO INFO DE LA API
app.get('/api/info', (request, response)=>{

    //Codigo para mostar info de la API-Agenda
    const horaActual = new Date().toLocaleString();
    const cantidadEntradas = persons.length;

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

    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);

    if(person){
        response.json(person);
    }else{
        response.status(404).end();
    };
    console.log(person);
    response.json(person);
})

//BORRAR RECURSO
app.delete('/api/persons/:id', (request, response)=>{

    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end();
})

//CREANDO NUEVO OBJETO
const generateId = () => {
    const usedIds = new Set(persons.map(p => p.id)); // Crea un conjunto con los IDs existentes
    let newId;
    do {
        newId = Math.floor(Math.random() * 1000000); // Genera un ID aleatorio de 6 dígitos
    } while (usedIds.has(newId)); // Repite hasta que el ID sea único
    return newId;
};


app.post('/api/persons', (request, response)=>{

    const body = request.body;
    const name = body.name;
    const number = body.number;
   

    if(!name || !number){
        return response.status(400).json({
            error: 'name and phone are required'
        });
    };

    const person = {
        id: generateId(),
        name: name,
        number: number
    };

    persons = persons.concat(person);
    response.json(person);
})

//actualizar objeto

app.put('/api/persons/:name', (request, response)=>{

    
    const body = request.body;
    const personName = body.name; // Obtener el nombre de la persona desde la URL
    const updatedNumber = body.number; // Obtener el nuevo número del cuerpo de la solicitud

    const person = persons.find(p => p.name === personName); 
   
    if (person) {
        person.number = updatedNumber; // Actualizar el número
        response.json(person); // Devolver la persona actualizada
    } else {
        response.status(404).json({ message: 'Persona no encontrada' }); // Maneja el caso en que no se encuentra la persona
    }
})





//definicion de puerto para levantar servidor web
const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server runnig on port http://localhost:${PORT}`);