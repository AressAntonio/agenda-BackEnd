/* eslint-disable no-undef */
const mongoose = require('mongoose');


if (process.argv.length < 3){
    console.log('give password as argument');
    process.exit(1);
};

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://aressgarrido:${password}@cluster0.rk8zc.mongodb.net/agendaApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

if(process.argv.length === 3){

//OBTENIENDO DATOS DE LA DB
 Person.find({}).then(result => {

    result.forEach(person => {
      console.log(person)
    });
    mongoose.connection.close();

 });


}else if(process.argv.length === 4){
    //TRAER NUMERO TELEFONICO DE PERSONA USANDO LA RESTRICCION DE CONSULTA
    Person.find({name: name}).then(result => {
        result.forEach(person => {
          console.log(`the phone number of ${person.name} is: ${person.number}.`)
        })
        mongoose.connection.close()
    });

}else if(process.argv.length === 5){
   //AGREGAR NEW PERSON A LA DB
    const person = new Person({
        name: name,
        number: number,
   
    });
   
   
    person.save().then(() =>{

     console.log('person save!');
     console.log(`added: ${name} number: ${number} to phonebook.`)
     mongoose.connection.close();

    });


}else{console.log('error')};

