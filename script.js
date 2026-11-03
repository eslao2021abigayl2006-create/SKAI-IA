
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

    // Crear espacio para la respuesta de SKAI IA
    const mensajeIA = document.createElement("div");
    mensajeIA.className = "mensaje ia";
    mensajeIA.textContent = "";
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

        if (!respuesta.ok) {
            throw new Error(await respuesta.text());
        }

        // Leer la respuesta progresivamente
        const lector = respuesta.body.getReader();
        const decodificador = new TextDecoder();

        while (true) {
            const { value, done } = await lector.read();

            if (done) break;

            mensajeIA.textContent += decodificador.decode(value, {
                stream: true
            });

            mensajes.scrollTop = mensajes.scrollHeight;
        }

        mensajeIA.textContent += decodificador.decode();

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




