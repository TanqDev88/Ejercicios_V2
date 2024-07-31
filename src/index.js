const express = require('express');
const multer = require('multer'); //Middleware para Node
const csv = require('csv-parser');// Paquete Node
const fs = require('fs');
const app = express();//instancia de Express para la API
const port = 3000;

const upload = multer({ dest: 'uploads/' });

let crmData = [];

app.post('/upload-csv', upload.single('file'), (req, res) => {
    if (!req.file) { //Verificar aca que subio
        return res.status(400).send('No se subio el archivo');
    }

    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const { ID, Nombre, Email, Créditos } = row;
            
            if (!ID || !Nombre || !Email || !Créditos) { //Validar x fila
                console.warn(`Datos incompletos en la fila: ${JSON.stringify(row)}`);
                return;
            }

            const existingPerson = crmData.find(person => person.ID === ID);
            
            if (existingPerson) {
                existingPerson.Nombre = Nombre;
                existingPerson.Email = Email;
                existingPerson.Créditos = Créditos;
            } else {
                crmData.push({ ID, Nombre, Email, Créditos });
            }
        })
        .on('end', () => {
            fs.unlinkSync(filePath);//Buena practica agregar
            res.send('Se proceso y actualizo el archivo CSV');
        })
        .on('error', (error) => { //OJO ACA, validar archivo
            console.error(`Error al procesar el archivo CSV: ${error.message}`);
            res.status(500).send('Error al procesar el archivo CSV');
        });
});

app.get('/crm-data', (req, res) => {
    res.json(crmData);
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
