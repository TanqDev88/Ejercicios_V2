const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { parseISO, isValid, isWithinInterval } = require('date-fns');
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.json());

let crmData = [];
let creditTransfers = [];

/* Punto 1 Listado POST/GET*/
app.post('/upload-csv', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se ha subido ningún archivo');
    }

    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const { ID, Nombre, Email, Créditos } = row;
            
            if (!ID || !Nombre || !Email || !Créditos) { 
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
            fs.unlinkSync(filePath);
            res.send('Se proceso y actualizo el archivo CSV');
        })
        .on('error', (error) => {
            console.error(`Error al procesar el archivo CSV: ${error.message}`);
            res.status(500).send('Error al procesar el archivo CSV');
        });
});

app.get('/crm-data', (req, res) => {
    res.json(crmData);
});

/* Punto 2 Generacion de Creditos (POST)*/

app.post('/transfer-credits', (req, res) => {
    const { fromID, toID, amount } = req.body;

    if (!fromID || !toID || !amount) {
        return res.status(400).send('Faltan datos en la solicitud');
    }

    const fromPerson = crmData.find(person => person.ID === fromID);
    const toPerson = crmData.find(person => person.ID === toID);

    if (!fromPerson || !toPerson) {
        return res.status(404).send('Una o ambas personas no existen');
    }

    if (fromPerson.Créditos < amount) {
        return res.status(400).send('Créditos insuficientes para la transferencia');
    }

    fromPerson.Créditos -= amount;
    toPerson.Créditos += amount;

    creditTransfers.push({
        fromID,
        toID,
        amount,
        date: new Date()
    });

    res.send('Transferencia de créditos realizada con éxito');
});

/*Punto 3 Generacion de reporte (GET) */
app.get('/report-credits', (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).send('Faltan parámetros');
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) {
        return res.status(400).send('Fechas inválidas');
    }

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
