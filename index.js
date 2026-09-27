const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pagina principală Zavelo AI
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ro">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zavelo AI</title>
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: white;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .container {
          width: 100%;
          max-width: 700px;
          text-align: center;
        }

        .logo {
          font-size: 42px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .logo span {
          color: #38bdf8;
        }

        .subtitle {
          color: #cbd5e1;
          margin-bottom: 30px;
        }

        .chat {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid #334155;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }

        #messages {
          min-height: 180px;
          max-height: 350px;
          overflow-y: auto;
          margin-bottom: 15px;
          text-align: left;
        }

        .message {
          padding: 12px 15px;
          border-radius: 12px;
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .bot {
          background: #1e293b;
        }

        .user {
          background: #0369a1;
          text-align: right;
        }

        .input-area {
          display: flex;
          gap: 10px;
        }

        input {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #475569;
          background: #0f172a;
          color: white;
          outline: none;
        }

        button {
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          background: #38bdf8;
          color: #082f49;
          font-weight: bold;
          cursor: pointer;
        }

        button:hover {
          background: #7dd3fc;
        }

        .status {
          margin-top: 20px;
          color: #94a3b8;
          font-size: 13px;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="logo">Zavelo <span>AI</span></div>
        <div class="subtitle">Asistentul tău AI</div>

        <div class="chat">
          <div id="messages">
            <div class="message bot">
              Salut! Sunt Zavelo AI. Cu ce te pot ajuta?
            </div>
          </div>

          <div class="input-area">
            <input
              id="messageInput"
              type="text"
              placeholder="Scrie mesajul tău..."
              autocomplete="off"
            />
            <button onclick="sendMessage()">Trimite</button>
          </div>
        </div>

        <div class="status">
          Zavelo AI • Online
        </div>
      </div>

      <script>
        const input = document.getElementById("messageInput");
        const messages = document.getElementById("messages");

        input.addEventListener("keydown", function(event) {
          if (event.key === "Enter") {
            sendMessage();
          }
        });

        function addMessage(text, type) {
          const message = document.createElement("div");
          message.className = "message " + type;
          message.textContent = text;
          messages.appendChild(message);
          messages.scrollTop = messages.scrollHeight;
        }

        async function sendMessage() {
          const text = input.value.trim();

          if (!text) return;

          addMessage(text, "user");
          input.value = "";

          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                message: text
              })
            });

            const data = await response.json();

            addMessage(data.reply, "bot");
          } catch (error) {
            addMessage(
              "Zavelo AI nu a putut procesa mesajul momentan.",
              "bot"
            );
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API pentru chat
app.post("/api/chat", (req, res) => {
  const message = req.body.message || "";

  let reply = "Am primit mesajul tău: " + message;

  if (message.toLowerCase().includes("salut")) {
    reply = "Salut! 👋 Sunt Zavelo AI. Cu ce te pot ajuta?";
  }

  res.json({
    reply: reply
  });
});

// Pornirea serverului
app.listen(PORT, () => {
  console.log(`Zavelo AI rulează pe portul ${PORT}`);
});
  res.json({
    reply: reply
  });
});

// Pornirea serverului
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Zavelo AI rulează pe portul ${PORT}`);
});
