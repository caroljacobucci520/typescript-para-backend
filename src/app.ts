import express from "express";
import router from "./routes";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
router(app);

app.get("/", (_, res: express.Response) => {
  res.send("Bem vindo ao curso de TypeScript!");
});


function criaPet(id: number, nome: string, especie: string ,idade: number, adotado: boolean) {
  return {
    id,
    nome,
    especie,
    idade,
    adotado,
  };
}

let id = 0;
function geraId() {
  id = id + 1;
  return id;
}

app.post("/pets", (_, res) => {
  const pet1 = criaPet(geraId(), "Bolt", "cachorro", 3, false);
  const pet2 = criaPet(geraId(), "Mel", "gato", 2, false);

  res.send([pet1, pet2]);
});


export default app;
