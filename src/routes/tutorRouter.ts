import express from "express";
import TutorController from "../controller/TutorController";

const router = express.Router();

const tutorController = new TutorController();

router.post("/", tutorController.criaTutor);
router.get("/", tutorController.listarTodosTutores);
router.put("/:id", tutorController.atualizarTutor);
router.delete("/:id", tutorController.removerTutor);

export default router;