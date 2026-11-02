
require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión con el servicio de inteligencia artificial
const cliente = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static(__dirname));

// Identidad oficial de SKAI IA
const instrucciones = `
Tu nombre es SKAI IA.

Eres el asistente virtual oficial de la página web SKAI IA.
Tienes una identidad propia y debes mantenerla durante toda la conversación.

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
10. Sé amable, inteligente y profesional.
11. Responde de forma breve y sencilla, máximo 80 palabras, salvo que pidan más detalles.
12. No inventes información sobre tu creadora.

Tu identidad es SKAI IA en todo momento.
`;

// Comprobar que el servidor funciona
app.get("/estado", (req, res) => {
    res.json({
        mensaje: "¡SKAI IA está funcionando!"
    });
});

// Recibir y responder preguntas
app.post("/preguntar", async (req, res) => {
    try {
        const pregunta = req.body.pregunta;

        if (typeof pregunta !== "string" || !pregunta.trim()) {
            return res.status(400).json({
                error: "Escribe una pregunta."
            });
        }

        // Preguntas directas sobre su identidad
        const preguntaNormalizada = pregunta
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (
            preguntaNormalizada.includes("como te llamas") ||
            preguntaNormalizada.includes("cual es tu nombre")
        ) {
            return res.json({
                respuesta: "Me llamo SKAI IA. ¿En qué puedo ayudarte?"
            });
        }

        if (
            preguntaNormalizada.includes("quien eres") ||
            preguntaNormalizada.includes("que eres")
        ) {
            return res.json({
                respuesta: "Soy SKAI IA, tu asistente virtual. Estoy aquí para ayudarte a aprender, crear y descubrir nuevas ideas."
            });
        }

        const respuesta = await cliente.models.generateContent({
            model: "gemini-3.5-flash-lite",
            config: {
                systemInstruction: instrucciones,
                temperature: 0.2
            },
            contents: pregunta.trim()
        });

        res.json({
            respuesta: respuesta.text ||
                "No pude generar una respuesta. Inténtalo nuevamente."
        });

    } catch (error) {
        console.error("Error de SKAI IA:", error.message);

        res.status(500).json({
            error: "No pude responder en este momento. Inténtalo nuevamente."
        });
    }
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`SKAI IA funciona en el puerto ${PORT}`);
});
