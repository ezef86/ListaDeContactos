// index.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Módulo para manejar rutas de archivos
const Contacto = require("./personaMongo"); // Importamos el modelo de Contacto

const app = express();
const port = 3000; // Usamos el puerto 3000

// Variable para la URL de la base de datos
const dbUrl = "mongodb://172.27.5.140:27017/lista_contactos"; // Reemplaza con tu URL de MongoDB si no es local

// Conexión a la base de datos MongoDB
mongoose
	.connect(dbUrl)
	.then(() => console.log("Conectado a MongoDB"))
	.catch((err) => console.error("Error conectando a MongoDB:", err));

// Middleware para parsear JSON y datos de formulario
app.use(express.json()); // Para parsear cuerpos de solicitud en JSON
app.use(express.urlencoded({ extended: true })); // Para parsear cuerpos de solicitud URL-encoded

// Servir archivos estáticos (como tu formularioAjax.js y formulario.html)
// Esto permite que el navegador acceda a estos archivos
app.use(express.static(path.join(__dirname)));

// Ruta para servir el archivo HTML principal
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "formulario.html"));
});

// --- Rutas de la API para los Contactos ---

// GET /contacts - Obtener todos los contactos
app.get("/contacts", async (req, res) => {
	try {
		const contactos = await Contacto.find(); // Busca todos los documentos de Contacto
		res.json(contactos); // Envía la lista de contactos como respuesta JSON
	} catch (err) {
		res.status(500).json({ message: err.message }); // Manejo de errores
	}
});

// POST /contacts - Crear un nuevo contacto
app.post("/contacts", async (req, res) => {
	const contacto = new Contacto({
		nombre: req.body.nombre,
		email: req.body.email,
		fechaNacimiento: req.body.fechaNacimiento, // Asegúrate de que el formato sea correcto
	});

	try {
		const nuevoContacto = await contacto.save(); // Guarda el nuevo contacto en la BD
		res.status(201).json(nuevoContacto); // Envía el contacto creado con status 201 (Created)
	} catch (err) {
		// Manejo de errores de validación (ej: campo requerido faltante, email duplicado)
		res.status(400).json({ message: err.message });
	}
});

// PUT /contacts/:id - Actualizar un contacto por ID
app.put("/contacts/:id", async (req, res) => {
	try {
		const contacto = await Contacto.findById(req.params.id); // Busca el contacto por ID
		if (contacto == null) {
			return res.status(404).json({ message: "No se encontró el contacto" }); // Contacto no encontrado
		}

		// Actualizar los campos si están presentes en el cuerpo de la solicitud
		if (req.body.nombre != null) {
			contacto.nombre = req.body.nombre;
		}
		if (req.body.email != null) {
			contacto.email = req.body.email;
		}
		if (req.body.fechaNacimiento != null) {
			contacto.fechaNacimiento = req.body.fechaNacimiento;
		}

		const contactoActualizado = await contacto.save(); // Guarda los cambios
		res.json(contactoActualizado); // Envía el contacto actualizado
	} catch (err) {
		res.status(400).json({ message: err.message }); // Manejo de errores (ej: validación al actualizar)
	}
});

// DELETE /contacts/:id - Eliminar un contacto por ID
app.delete("/contacts/:id", async (req, res) => {
	try {
		const resultado = await Contacto.deleteOne({ _id: req.params.id }); // Elimina el contacto por ID
		if (resultado.deletedCount === 0) {
			return res
				.status(404)
				.json({ message: "No se encontró el contacto para eliminar" });
		}
		res.json({ message: "Contacto eliminado" }); // Confirmación de eliminación
	} catch (err) {
		res.status(500).json({ message: err.message }); // Manejo de errores
	}
});

// Iniciar el servidor
app.listen(port, () =>
	console.log(`Servidor corriendo en http://localhost:${port}`)
);
