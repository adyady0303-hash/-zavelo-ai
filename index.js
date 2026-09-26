const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ro">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zavelo AI</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #0b1020;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          text-align: center;
        }

        .container {
          max-width: 700px;
          padding: 40px 20px;
        }

        h1 {
          font-size: 52px;
          margin-bottom: 10px;
        }

        p {
          font-size: 20px;
          color: #b8c0d9;
        }

        .box {
          margin-top: 30px;
          padding: 25px;
          border-radius: 20px;
          background: #151c33;
        }

        button {
          margin-top: 20px;
          padding: 14px 28px;
          border: 0;
          border-radius: 12px;
          background: #6c5ce7;
          color: white;
          font-size: 17px;
          cursor: pointer;
        }

        button:hover {
          opacity: 0.9;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <h1>🤖 Zavelo AI</h1>
        <p>Inteligență artificială simplă, rapidă și accesibilă.</p>

        <div class="box">
          <h2>Bine ai venit la Zavelo AI</h2>
          <p>Platforma ta AI este online.</p>
          <button onclick="alert('Zavelo AI funcționează!')">
            Pornește Zavelo AI
          </button>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Zavelo AI rulează pe portul ${PORT}`);
});
