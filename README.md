# Ejercicios entrevista técnica
***

![Image text](https://github.com/TanqDev88/Ejercicios_V2/blob/main/Image.png)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node-dot-js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

## Contenido
1. [Información general](#general-info)
2. [Tecnologías](#technologies)
3. [Instalación](#installation)
4. [Testing](#testing)


<a name="general-info"></a>
## Información General 
En este repositorio se encuentran los puntos correspondientes la actividad del ejercicio técnico V2
***

### Menú principal

## Estado del Proyecto 🚧 
<details>
    <summary>Click Aquí para Detalle ↩️</summary>
    <br>
   <p align="justify">El proyecto se encuentra finalizado. Ya se encuentran listas las funcionalidades solicitadas🔨 </p>
   </details>
   <hr>

<a name="technologies"></a> 
   ## Tecnologías Utilizadas  💻 

<details>
    <summary>Click Aquí para Detall ↩️</summary>
    <br>
   <p>Tecnologías Utilizada:</p>
<ul>
  <li>JS: <a href="https://www.javascript.com/">Enlace a la documentación oficial</a></li>
   <li>Node.js: <a href="https://nodejs.org/en">Enlace a la documentación oficial</a> </li>
   <li>Express Frameork: <a href="https://expressjs.com/es/">Enlace a la documentación oficial</a></li>
    <li>Postman: <a href="https://www.postman.com/">Enlace a la documentación oficial</a>
</ul>

   </details>

 <a name="installation"></a>  
## Instalación del proyecto
***
Clonar el proyecto desde la siguiente URL de Github. 
```
$ git clone https://github.com/TanqDev88/Ejercicios_V2.git

```
Instalar las siguientes herramientas de manera local:
```
npm install
npm install express multer csv-parser axios
npm install moment

```
Desde la carpeta donde se clonó el proyecto ejecutar el siguiente comando para levantar el servicio:
```
node index.js

```
<a name="testing"></a>  
## Testing  📖🖍️
   
<details>
    <summary>Click Aquí para Detalle ↩️</summary>
    <br>
   <p>1 - POST - Listado</p>
<ul>
  
  PASOS<br>
1- Seleccionar método POST e ingresar la URL = "http://localhost:3000/upload-csv" <br> 
2- Desde la pestaña Body seleccionar la opción "form-data".<br> 
3- Añadir el campo "file" asignando el valor "File"<br>
4- Cargar el archivo listado.csv (adjunto en el mail y disponible en el proyecto)<br>
5- Enviar el POST
</ul>

   <p>2 - POST - Credito</p>
<ul>
  
  PASOS<br>
1- Seleccionar método POST e ingresar la URL = "http://localhost:3000/transfer-credits"<br> 
2- Desde la pestaña Body seleccionar la opción "raw".<br> 
3- Ingresar el siguiente JSON de prueba:<br>
```
{
  "fromID": "1",
  "toID": "2",
  "amount": 5
}

```
5- Enviar el POST
</ul>

<p>3 - GET - Reporte</p>
<ul>
  
  PASOS<br>
1- Seleccionar método GET e ingresar la URL = "[http://localhost:3000/upload-csv](http://localhost:3000/report-credits?startDate=2024-07-01&endDate=2024-08-31)" <br> 
2- Añadir la key "startDate" asignando el valor "2024-07-01"<br>
2- Añadir la key "endDate" asignando el valor "2024-08-01"<br>
2- Enviar el GET.
</ul>

