import express from "express";
import petRouter from "../routes/petRouter";
import tutorRouter from "../routes/tutorRouter";
import analyzeRouter from "../routes/analyzeRouter";

const router = (app: express.Router) => {
    app.use("/pets", petRouter);
    app.use("/tutor", tutorRouter);
    app.use("/analyze", analyzeRouter);
};
export default router;
