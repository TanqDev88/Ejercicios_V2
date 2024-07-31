const express = require('express');
const multer = require('multer'); //Middleware para Node
const csv = require('csv-parser');// Paquete Node
const fs = require('fs');
const app = express();//instancia de Express para la API
const port = 3000;
// Aca maneja la carga,
const upload = multer({ dest: 'uploads/' });

// Middleware para el JSON
app.use(express.json());

let crmData = [];

/* Punto 1 No modificar*/
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

/* Manejar los creditos para el punto 2*/

// Ruta
app.post('/transfer-credits', (req, res) => {
    const { fromID, toID, amount } = req.body;

    // Validar campos 
    if (!fromID || !toID || !amount) {
        return res.status(400).send('Faltan datos en la solicitud');
    }

    // Buscar los Clients
    const fromPerson = crmData.find(person => person.ID === fromID);
    const toPerson = crmData.find(person => person.ID === toID);

    // OJO! Validar que las personas existan
    if (!fromPerson || !toPerson) {
        return res.status(404).send('Una o ambas personas no existen');
    }

    // OJO! Validar que la persona que transfiere tenga suficientes créditos
    if (fromPerson.Créditos < amount) {
        return res.status(400).send('Créditos insuficientes para la transferencia');
    }

    fromPerson.Créditos -= amount;
    toPerson.Créditos += amount;

    res.send('Transferencia de créditos realizada con éxito');
});

/* Generacion de reportes para el punto 3*/
app.get('/report-credits', (req, res) => {
    const { startDate, endDate } = req.query;

    // Valida fecha (intervalo)
    if (!startDate || !endDate) {
        return res.status(400).send('Faltan parámetros');
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // OJO - Validar las fechas
    if (!isValid(start) || !isValid(end)) {
        return res.status(400).send('Fechas inválidas');
    }

    // Filtrar fecha
    const filteredTransfers = creditTransfers.filter(transfer => {
        return isWithinInterval(new Date(transfer.date), { start, end });
    });

    const totalCredits = filteredTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);

    res.json({
        totalCredits,
        transfers: filteredTransfers
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
