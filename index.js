const config = require('config');
const Joi = require('joi');
const express = require('express');
const logger = require('./logger');
const app = express();

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(logger);

//Configs
console.log('Application Name:' + config.get('name'));
console.log('Mail Server:' + config.get('mail.host'));
console.log('Mail Password:' + config.get('mail.password'));

app.use(function(req, res, next) {
    console.log('Authenticating...');
    next();
});

const courses = [
    { id: 1, name: 'course1'},
    { id: 2, name: 'course2'}
];

app.get('/', (req, res) => {
    res.send('Hello world!!!!');
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.post('/api/courses', (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given id was not found');
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    //  Look up the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given id was not found');
    //  If not existing, return 404

    //Validate
    //If invalid, return 400 Bad Request
    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Update course
    course.name = req.body.name;
    res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given id was not found');
    
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);
});

function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(course, schema);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

