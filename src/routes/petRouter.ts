import express from "express";
import PetController from "../controller/PetController";

const router = express.Router();

const petController = new PetController();

router.post("/", petController.criaPet);
router.get("/", petController.listarTodosPets);
router.put("/:id", petController.atualizarPet);
router.delete("/:id", petController.removerPet);    

export default router;