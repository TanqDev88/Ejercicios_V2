const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const axios = require("axios");
const { parseISO, isValid, isWithinInterval } = require("date-fns");
const app = express();
const port = 3000;

const upload = multer({ dest: "uploads/" });

app.use(express.json());
const CRM_API_URL = "https://627303496b04786a09002b27.mockapi.io/mock/sucursales";

let crmData = [];
let creditTransfers = [];

async function getPersonById(id) {
  try {
    const response = await axios.get(`${CRM_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

async function updatePerson(id, data) {
  try {
    const response = await axios.put(`${CRM_API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/* Punto 1 Listado POST/GET*/
app.post("/upload-csv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se ha subido ningún archivo");
  }

    const filePath = req.file.path;

  const rows = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", async () => {
      fs.unlinkSync(filePath);

      try {
        for (const row of rows) {
          const { ID, Nombre, Email, Créditos } = row;

          if (!ID || !Nombre || !Email || !Créditos) {
            console.warn(`Datos incompletos en la fila: ${JSON.stringify(row)}`);
            continue;
          }

          const existingPerson = await getPersonById(ID);

          if (existingPerson) {
            await updatePerson(ID, {
              nombre: Nombre,
              email: Email,
              créditos: Créditos,
              createdAt: existingPerson.createdAt || new Date().toISOString(),
              direccion: existingPerson.direccion || "",
              geo: existingPerson.geo || {},
              genero: existingPerson.genero || "",
              pais: existingPerson.pais || ""
            });
          } else {
            console.warn(`Persona con ID ${ID} no encontrada en el CRM`);
          }
        }

        res.send("Se procesó y actualizó el archivo CSV");
      } catch (error) {
        console.error(`Error al actualizar el CRM: ${error.message}`);
        res.status(500).send("Error al actualizar el CRM");
      }
    })
    .on("error", (error) => {
      console.error(`Error al procesar el archivo CSV: ${error.message}`);
      res.status(500).send("Error al procesar el archivo CSV");
  });
});

/* Punto 2 Generacion de Creditos (POST)*/

app.post("/transfer-credits", async (req, res) => {
    const { fromID, toID, amount } = req.body;

  if (!fromID || !toID || !amount) {
    return res.status(400).send("Faltan datos en la solicitud");
  }

  try {
    const fromPerson = await getPersonById(fromID);
    const toPerson = await getPersonById(toID);

    if (!fromPerson || !toPerson) {
        return res.status(404).send("Una o ambas personas no existen");
    }

    if (parseInt(fromPerson.créditos) < amount) {
      return res.status(400).send("Créditos insuficientes para la transferencia");
    }

    fromPerson.créditos = parseInt(fromPerson.créditos) - amount;
    toPerson.créditos = parseInt(toPerson.créditos) + amount;

    await updatePerson(fromID, fromPerson);
    await updatePerson(toID, toPerson);

    creditTransfers.push({
        fromID,
        toID,
        amount,
        date: new Date(),
    });

    res.send("Transferencia de créditos realizada con éxito");
  } catch (error) {
    console.error(`Error en la transferencia de créditos: ${error.message}`);
    res.status(500).send("Error en la transferencia de créditos");
  }
});

/*Punto 3 Generacion de reporte (GET) */
app.get("/report-credits", (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).send("Faltan parámetros");
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) {
        return res.status(400).send("Fechas inválidas");
    }

    const filteredTransfers = creditTransfers.filter((transfer) => {
        return isWithinInterval(new Date(transfer.date), { start, end });
    });

    const totalCredits = filteredTransfers.reduce(
        (sum, transfer) => sum + transfer.amount,
        0
    );

    res.json({
        totalCredits,
        transfers: filteredTransfers,
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
