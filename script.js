
async function enviarMensaje() {
    const entrada = document.getElementById("pregunta");
    const mensajes = document.getElementById("mensajes");
    const boton = document.querySelector(".chat-escribir button");

    if (!entrada || !mensajes || !boton) {
        console.error("No se encontraron los elementos del chat.");
        return;
    }

    const pregunta = entrada.value.trim();

    if (pregunta === "" || boton.disabled) return;

    // Mostrar pregunta del usuario
    const mensajeUsuario = document.createElement("div");
    mensajeUsuario.className = "mensaje usuario";
    mensajeUsuario.textContent = pregunta;
    mensajes.appendChild(mensajeUsuario);

    entrada.value = "";
    boton.disabled = true;

    // Mostrar mensaje de espera
    const mensajeIA = document.createElement("div");
    mensajeIA.className = "mensaje ia";
    mensajeIA.textContent = "SKAI IA está pensando...";
    mensajes.appendChild(mensajeIA);

    mensajes.scrollTop = mensajes.scrollHeight;

    try {
        const respuesta = await fetch("/preguntar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pregunta: pregunta
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No pude responder.");
        }

        if (!datos.respuesta) {
            throw new Error("No recibí una respuesta.");
        }

        mensajeIA.textContent = datos.respuesta;

    } catch (error) {
        mensajeIA.textContent =
            error.message || "No pude conectarme con SKAI IA.";

        console.error("Error del chat:", error);

    } finally {
        boton.disabled = false;
        entrada.focus();
        mensajes.scrollTop = mensajes.scrollHeight;
    }
}

// Permitir enviar preguntas con Enter
document.addEventListener("DOMContentLoaded", function () {
    const entrada = document.getElementById("pregunta");

    if (entrada) {
        entrada.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter") {
                evento.preventDefault();
                enviarMensaje();
            }
        });
    }
});



