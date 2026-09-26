const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

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
      min-height: 100vh;
      font-family: Arial, sans-serif;
      background: #070b16;
      color: white;
    }

    header {
      padding: 20px;
      border-bottom: 1px solid #20283d;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
    }

    .online {
      color: #4ade80;
      font-size: 14px;
    }

    main {
      max-width: 850px;
      margin: auto;
      padding: 70px 20px;
      text-align: center;
    }

    .robot {
      font-size: 64px;
    }

    h1 {
      font-size: 52px;
      margin: 15px 0 10px;
    }

    .subtitle {
      color: #aeb7cc;
      font-size: 19px;
      line-height: 1.6;
    }

    .chat {
      margin: 45px auto;
      max-width: 700px;
      background: #101729;
      border: 1px solid #28344f;
      border-radius: 24px;
      padding: 22px;
      text-align: left;
    }

    .welcome {
      background: #19233a;
      padding: 16px;
      border-radius: 14px;
      margin-bottom: 18px;
      line-height: 1.5;
    }

    .input-row {
      display: flex;
      gap: 10px;
    }

    input {
      flex: 1;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #34415e;
      background: #080d19;
      color: white;
      font-size: 16px;
      outline: none;
    }

    button {
      padding: 16px 24px;
      border: 0;
      border-radius: 12px;
      background: #705cff;
      color: white;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.85;
    }

    footer {
      margin-top: 50px;
      color: #68738b;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      h1 {
        font-size: 40px;
      }

      .input-row {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  </style>
</head>

<body>

<header>
  <div class="logo">🤖 Zavelo AI</div>
  <div class="online">● Online</div>
</header>

<main>

  <div class="robot">✨</div>

  <h1>Zavelo AI</h1>

  <p class="subtitle">
    Asistentul tău inteligent pentru conversații, idei și informații.
  </p>

  <div class="chat">

    <div class="welcome" id="response">
      👋 Salut! Sunt Zavelo AI. Scrie un mesaj pentru a începe.
    </div>

    <div class="input-row">

      <input
        id="message"
        type="text"
        placeholder="Scrie mesajul tău..."
        onkeydown="if(event.key === 'Enter') sendMessage()"
      >

      <button onclick="sendMessage()">
        Trimite
      </button>

    </div>

  </div>

  <footer>
    © 2026 Zavelo AI
  </footer>

</main>

<script>
  function sendMessage() {
    const input = document.getElementById("message");
    const response = document.getElementById("response");

    const text = input.value.trim();

    if (!text) {
      return;
    }

    response.innerHTML =
      "💬 <strong>Tu:</strong> " +
      text.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
      "<br><br>" +
      "🤖 <strong>Zavelo AI:</strong> Am primit mesajul tău! Motorul AI va fi conectat în următorul pas.";

    input.value = "";
  }
</script>

</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log("Zavelo AI rulează pe portul " + PORT);
});
