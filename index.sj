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
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px;
      border-bottom: 1px solid #20283d;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
    }

    .status {
      font-size: 14px;
      color: #62e6a5;
    }

    main {
      max-width: 900px;
      margin: auto;
      padding: 70px 20px;
      text-align: center;
    }

    .icon {
      font-size: 60px;
      margin-bottom: 15px;
    }

    h1 {
      font-size: 52px;
      margin: 10px 0;
    }

    .subtitle {
      color: #aeb7cc;
      font-size: 19px;
      line-height: 1.6;
    }

    .chat {
      margin: 45px auto 0;
      max-width: 700px;
      background: #101729;
      border: 1px solid #252f48;
      border-radius: 22px;
      padding: 20px;
      text-align: left;
    }

    .message {
      background: #182139;
      padding: 15px;
      border-radius: 14px;
      margin-bottom: 15px;
      color: #dce3f2;
    }

    .input-area {
      display: flex;
      gap: 10px;
    }

    input {
      flex: 1;
      padding: 15px;
      border-radius: 12px;
      border: 1px solid #303b58;
      background: #080d1b;
      color: white;
      outline: none;
      font-size: 16px;
    }

    button {
      padding: 15px 22px;
      border: none;
      border-radius: 12px;
      background: #6d5dfc;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.85;
    }

    footer {
      margin-top: 50px;
      color: #69748c;
      font-size: 14px;
    }
  </style>
</head>

<body>

<header>
  <div class="logo">🤖 Zavelo AI</div>
  <div class="status">● Online</div>
</header>

<main>

  <div class="icon">✨</div>

  <h1>Zavelo AI</h1>

  <p class="subtitle">
    Asistentul tău inteligent pentru idei, informații și conversații.
  </p>

  <div class="chat">

    <div class="message" id="message">
      Salut! Sunt Zavelo AI. Cu ce te pot ajuta?
    </div>

    <div class="input-area">
      <input
        id="question"
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
    const input = document.getElementById("question");
    const message = document.getElementById("message");

    const text = input.value.trim();

    if (!text) {
      return;
    }

    message.innerHTML =
      "Ai întrebat: <strong>" +
      text.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
      "</strong><br><br>" +
      "Zavelo AI este pregătit. Conectarea la motorul AI va fi adăugată în următorul pas.";

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
