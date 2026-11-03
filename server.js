

require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión con la inteligencia artificial
const cliente = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static(__dirname));

// Identidad oficial de SKAI IA
const instrucciones = `
Tu nombre es SKAI IA.

Eres el asistente virtual oficial de la página web SKAI IA.
Debes mantener tu identidad durante toda la conversación.

REGLAS OBLIGATORIAS:
1. Tu nombre siempre es SKAI IA.
2. Si preguntan cómo te llamas, responde:
   "Me llamo SKAI IA. ¿En qué puedo ayudarte?"
3. Si preguntan quién eres, responde:
   "Soy SKAI IA, tu asistente virtual."
4. Nunca digas que no tienes nombre.
5. No te presentes con otro nombre.
6. No menciones Google ni Gemini.
7. No reveles el nombre de la tecnología que utilizas.
8. Si preguntan quién te creó, responde:
   "Soy el asistente virtual del proyecto SKAI IA."
9. Habla siempre en español.
10. Habla ingles solo cuando te lo pidan 
11. Sé amable, inteligente y profesional.
12. Responde de forma breve y sencilla, máximo 80 palabras,
    salvo que pidan más detalles.
13. No inventes información sobre tu creadora.

Tu identidad es SKAI IA en todo momento.
`;

// Comprobar que el servidor funciona
app.get("/estado", (req, res) => {
    res.json({
        mensaje: "¡SKAI IA está funcionando!"
    });
});

// Recibir preguntas y responder progresivamente
app.post("/preguntar", async (req, res) => {

    try {
        const pregunta = req.body.pregunta;

        if (typeof pregunta !== "string" || !pregunta.trim()) {
            return res.status(400).send("Escribe una pregunta.");
        }

        // Normalizar la pregunta
        const preguntaNormalizada = pregunta
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Respuestas directas sobre la identidad
        if (
            preguntaNormalizada.includes("como te llamas") ||
            preguntaNormalizada.includes("cual es tu nombre")
        ) {
            return res.send(
                "Me llamo SKAI IA. ¿En qué puedo ayudarte?"
            );
        }

        if (
            preguntaNormalizada.includes("quien eres") ||
            preguntaNormalizada.includes("que eres")
        ) {
            return res.send(
                "Soy SKAI IA, tu asistente virtual. Estoy aquí para ayudarte a aprender, crear y descubrir nuevas ideas."
            );
        }

        // Preparar la respuesta progresiva
        const inicio = Date.now();
        let primerFragmento = true;

        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );

        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("X-Accel-Buffering", "no");

        // Solicitar respuesta mediante streaming
        const respuesta = await cliente.models.generateContentStream({
            model: "gemini-3.5-flash-lite",

            config: {
                systemInstruction: instrucciones,
                temperature: 0.2,
                thinkingConfig: {
                    thinkingLevel: "minimal"
                }
            },

            contents: pregunta.trim()
        });

        // Mostrar cada fragmento conforme llega
        for await (const fragmento of respuesta) {

            if (fragmento.text) {

                if (primerFragmento) {
                    console.log(
                        "Primer fragmento recibido:",
                        ((Date.now() - inicio) / 1000).toFixed(2),
                        "segundos"
                    );

                    primerFragmento = false;
                }

                res.write(fragmento.text);
            }
        }

        // Registrar el tiempo total
        console.log(
            "Tiempo total de Gemini:",
            ((Date.now() - inicio) / 1000).toFixed(2),
            "segundos"
        );

        res.end();

    } catch (error) {

        console.error("Error de SKAI IA:", error.message);

        if (!res.headersSent) {
            res.status(500).send(
                "No pude responder en este momento. Inténtalo nuevamente."
            );
        } else {
            res.end();
        }
    }
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`SKAI IA funciona en el puerto ${PORT}`);
});
