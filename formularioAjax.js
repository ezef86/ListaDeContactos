// formularioAjax.js

document.addEventListener("DOMContentLoaded", () => {
	// --- Referencias a los elementos del DOM ---
	const contactForm = document.getElementById("contactForm");
	const contactIdInput = document.getElementById("contactId");
	const nombreInput = document.getElementById("nombre");
	const emailInput = document.getElementById("email");
	const fechaNacimientoInput = document.getElementById("fechaNacimiento");
	const contactListDiv = document.getElementById("contactList");
	const submitButton = contactForm.querySelector('button[type="submit"]');
	const cancelEditButton = document.getElementById("cancelEdit");

	// --- Funciones para interactuar con Local Storage ---

	// Cargar contactos desde Local Storage
	const loadContactsFromLocalStorage = () => {
		const contacts = localStorage.getItem("contacts");
		return contacts ? JSON.parse(contacts) : [];
	};

	// Guardar contactos en Local Storage
	const saveContactsToLocalStorage = (contacts) => {
		localStorage.setItem("contacts", JSON.stringify(contacts));
	};

	// Agregar/Actualizar un contacto en Local Storage
	const upsertContactInLocalStorage = (contact) => {
		let contacts = loadContactsFromLocalStorage();
		const index = contacts.findIndex((c) => c._id === contact._id);
		if (index !== -1) {
			// Actualizar contacto existente
			contacts[index] = contact;
		} else {
			// Agregar nuevo contacto
			contacts.push(contact);
		}
		saveContactsToLocalStorage(contacts);
	};

	// Eliminar un contacto de Local Storage
	const removeContactFromLocalStorage = (contactId) => {
		let contacts = loadContactsFromLocalStorage();
		contacts = contacts.filter((c) => c._id !== contactId);
		saveContactsToLocalStorage(contacts);
	};

	// --- Funciones para interactuar con la API del Servidor (XMLHttpRequest) ---

	// Obtener todos los contactos del servidor
	const fetchContacts = () => {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", "/contacts", true); // Método GET, ruta /contacts, asíncrono
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				const contacts = JSON.parse(xhr.responseText);
				saveContactsToLocalStorage(contacts); // Sincronizar Local Storage
				renderContactList(contacts); // Renderizar la lista
			} else {
				console.error("Error al obtener contactos:", xhr.statusText);
				// Si falla al obtener del servidor, intentar cargar desde Local Storage
				const contacts = loadContactsFromLocalStorage();
				renderContactList(contacts);
				alert(
					"No se pudieron cargar los contactos del servidor. Mostrando datos locales."
				);
			}
		};
		xhr.onerror = () => {
			console.error("Error de red al obtener contactos.");
			// Si hay error de red, intentar cargar desde Local Storage
			const contacts = loadContactsFromLocalStorage();
			renderContactList(contacts);
			alert(
				"Error de red al conectar con el servidor. Mostrando datos locales."
			);
		};
		xhr.send(); // Enviar la solicitud
	};

	// Enviar datos del formulario (Agregar o Actualizar)
	const submitContactForm = (data, method, url) => {
		const xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.setRequestHeader("Content-Type", "application/json"); // Indicar que enviamos JSON
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				const responseContact = JSON.parse(xhr.responseText);
				upsertContactInLocalStorage(responseContact); // Actualizar Local Storage
				fetchContacts(); // Volver a cargar y renderizar la lista completa para reflejar los cambios
				clearForm(); // Limpiar el formulario
				alert("Operación exitosa");
			} else {
				const error = JSON.parse(xhr.responseText);
				console.error("Error en la operación:", xhr.status, error.message);
				alert(
					`Error: ${
						error.message || "Hubo un problema al guardar el contacto."
					}`
				);
				// Opcional: Si falla el guardar, puedes intentar actualizar Local Storage directamente
				// si la operación era una edición, aunque esto podría desincronizar si el error
				// fue de validación del servidor. La mejor práctica es confiar en el servidor.
			}
		};
		xhr.onerror = () => {
			console.error("Error de red al enviar datos del formulario.");
			alert("Error de red al conectar con el servidor.");
		};
		xhr.send(JSON.stringify(data)); // Enviar los datos como string JSON
	};

	// Eliminar un contacto
	const deleteContact = (contactId) => {
		const xhr = new XMLHttpRequest();
		xhr.open("DELETE", `/contacts/${contactId}`, true);
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				removeContactFromLocalStorage(contactId); // Eliminar de Local Storage
				fetchContacts(); // Volver a cargar y renderizar la lista
				alert("Contacto eliminado con éxito");
			} else {
				const error = JSON.parse(xhr.responseText);
				console.error("Error al eliminar contacto:", xhr.status, error.message);
				alert(
					`Error al eliminar: ${
						error.message || "Hubo un problema al eliminar el contacto."
					}`
				);
			}
		};
		xhr.onerror = () => {
			console.error("Error de red al eliminar contacto.");
			alert("Error de red al conectar con el servidor.");
		};
		xhr.send();
	};

	// --- Funciones de Renderizado y UI ---

	// Renderizar la lista de contactos en el DOM
	const renderContactList = (contacts) => {
		contactListDiv.innerHTML = ""; // Limpiar la lista actual

		if (contacts.length === 0) {
			contactListDiv.innerHTML = "<p>No hay contactos aún.</p>";
			return;
		}

		contacts.forEach((contact) => {
			// Convertir la fecha a un formato más legible si es necesario
			const date = new Date(contact.fechaNacimiento);
			// Formato DD/MM/YYYY (ejemplo básico)
			const formattedDate = `${date.getDate()}/${
				date.getMonth() + 1
			}/${date.getFullYear()}`;

			const contactItem = document.createElement("div");
			contactItem.classList.add(
				"list-group-item",
				"contact-item",
				"d-flex",
				"justify-content-between",
				"align-items-center"
			);
			// Almacenar el ID y otros datos relevantes en atributos data para fácil acceso
			contactItem.dataset.id = contact._id;
			contactItem.dataset.nombre = contact.nombre;
			contactItem.dataset.email = contact.email;
			contactItem.dataset.fechaNacimiento = contact.fechaNacimiento; // Guardamos la fecha original

			contactItem.innerHTML = `
                <div>
                    <h5>${contact.nombre}</h5>
                    <p class="mb-1">Email: ${contact.email}</p>
                    <p class="mb-1">Nacimiento: ${formattedDate}</p>
                </div>
                <div>
                    <button class="btn btn-sm btn-secondary me-2 edit-btn">Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn">Eliminar</button>
                </div>
            `;
			contactListDiv.appendChild(contactItem);
		});
	};

	// Limpiar el formulario
	const clearForm = () => {
		contactIdInput.value = "";
		nombreInput.value = "";
		emailInput.value = "";
		fechaNacimientoInput.value = "";
		submitButton.textContent = "Guardar Contacto"; // Restaurar texto del botón
		cancelEditButton.style.display = "none"; // Ocultar botón de cancelar
		// Remover clases de validación de Bootstrap
		contactForm.classList.remove("was-validated");
		nombreInput.classList.remove("is-invalid", "is-valid");
		emailInput.classList.remove("is-invalid", "is-valid");
		fechaNacimientoInput.classList.remove("is-invalid", "is-valid");
	};

	// Cargar datos de un contacto en el formulario para editar
	const loadContactForEdit = (contact) => {
		contactIdInput.value = contact._id;
		nombreInput.value = contact.nombre;
		emailInput.value = contact.email;
		// Formatear la fecha para el input type="date" (YYYY-MM-DD)
		const date = new Date(contact.fechaNacimiento);
		const year = date.getFullYear();
		const month = ("0" + (date.getMonth() + 1)).slice(-2); // Añadir cero inicial si es necesario
		const day = ("0" + date.getDate()).slice(-2); // Añadir cero inicial si es necesario
		fechaNacimientoInput.value = `${year}-${month}-${day}`;

		submitButton.textContent = "Actualizar Contacto"; // Cambiar texto del botón
		cancelEditButton.style.display = "inline-block"; // Mostrar botón de cancelar

		// Opcional: Desplazarse suavemente hacia el formulario
		contactForm.scrollIntoView({ behavior: "smooth" });
	};

	// --- Validación del Formulario ---
	const validateForm = () => {
		let isValid = true;
		const requiredFields = [nombreInput, emailInput, fechaNacimientoInput];

		// Reiniciar estilos de validación
		contactForm.classList.remove("was-validated");
		nombreInput.classList.remove("is-invalid", "is-valid");
		emailInput.classList.remove("is-invalid", "is-valid");
		fechaNacimientoInput.classList.remove("is-invalid", "is-valid");

		requiredFields.forEach((input) => {
			if (!input.value.trim()) {
				// Usar trim() para comprobar si está vacío o solo con espacios
				input.classList.add("is-invalid");
				isValid = false;
			} else {
				input.classList.add("is-valid");
			}
		});

		// Validación básica de email (adicional al "required")
		const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
		if (!emailRegex.test(emailInput.value.trim())) {
			emailInput.classList.add("is-invalid");
			isValid = false;
		} else if (emailInput.classList.contains("is-valid")) {
			// Si ya estaba marcado como válido por el 'required', no quitarlo
		} else {
			emailInput.classList.add("is-valid");
		}

		if (!isValid) {
			// Agregar clase de validación de Bootstrap para mostrar mensajes
			contactForm.classList.add("was-validated");
		}

		return isValid;
	};

	// --- Manejadores de Eventos ---

	// Manejar el envío del formulario
	contactForm.addEventListener("submit", (e) => {
		e.preventDefault(); // Prevenir el envío estándar del formulario
		e.stopPropagation(); // Detener la propagación del evento

		// Realizar validación con nuestra función personalizada
		const isValid = validateForm();
		// **Importante:** Añadir la clase 'was-validated' al formulario.
		// Esto le indica a Bootstrap que muestre los estilos de validación
		// (bordes rojos/verdes y mensajes de feedback).
		contactForm.classList.add("was-validated");

		if (!isValid) {
			// Ejecutar validación antes de enviar
			alert(
				"Por favor, completa todos los campos obligatorios y revisa los errores."
			);
			return; // Detener si la validación falla
		}

		const id = contactIdInput.value;
		const nombre = nombreInput.value.trim(); // Usar trim() al obtener valores
		const email = emailInput.value.trim();
		const fechaNacimiento = fechaNacimientoInput.value; // El input date ya da YYYY-MM-DD

		const contactData = { nombre, email, fechaNacimiento };

		if (id) {
			// Si hay un ID, es una actualización
			submitContactForm(contactData, "PUT", `/contacts/${id}`);
		} else {
			// Si no hay ID, es un nuevo contacto
			submitContactForm(contactData, "POST", "/contacts");
		}
	});

	// Manejar clics en los botones de editar/eliminar (Delegación de eventos)
	contactListDiv.addEventListener("click", (e) => {
		const target = e.target;
		const contactItem = target.closest(".contact-item"); // Encontrar el contenedor del contacto

		if (!contactItem) return; // Si no se hizo clic en un item de contacto, salir

		const contactId = contactItem.dataset.id; // Obtener el ID del atributo data

		if (target.classList.contains("edit-btn")) {
			// Acción de Editar
			const contact = {
				_id: contactItem.dataset.id,
				nombre: contactItem.dataset.nombre,
				email: contactItem.dataset.email,
				fechaNacimiento: contactItem.dataset.fechaNacimiento, // Usar la fecha original
			};
			loadContactForEdit(contact); // Cargar los datos en el formulario
		} else if (target.classList.contains("delete-btn")) {
			// Acción de Eliminar
			if (confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
				deleteContact(contactId); // Llamar a la función de eliminar
			}
		}
	});

	// Manejar clic en el botón de cancelar edición
	cancelEditButton.addEventListener("click", () => {
		clearForm(); // Limpiar el formulario y restaurar el estado
	});

	// --- Cargar contactos al iniciar la página ---
	fetchContacts(); // Llamar a esta función al cargar el DOM
});
