// personaMongo.js
const mongoose = require("mongoose");

// Definir el esquema para un contacto
const contactoSchema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true, // El nombre es obligatorio
		trim: true, // Elimina espacios en blanco al principio y al final
	},
	email: {
		type: String,
		required: true, // El email es obligatorio
		unique: true, // Asegura que no haya emails duplicados
		trim: true,
		lowercase: true, // Almacena el email en minúsculas
		match: [
			/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
			"Por favor, ingrese un email válido",
		], // Validación de formato
	},
	fechaNacimiento: {
		type: Date,
		required: true, // La fecha de nacimiento es obligatoria
	},
	// Mongoose añade automáticamente un campo _id como identificador único
});

// Crear el modelo a partir del esquema
const Contacto = mongoose.model("Contacto", contactoSchema);

// Exportar el modelo para poder usarlo en otras partes de la aplicación
module.exports = Contacto;
