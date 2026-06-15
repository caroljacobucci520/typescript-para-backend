import express from "express";
import type TipoTutor from "../tipos/TipoTutor";

let listaDeTutores: TipoTutor[] = [];

export default class TutorController {
    criaTutor(req: express.Request, res: express.Response){
        const {id, nome, email, telefone} = req.body as TipoTutor;
        const novoTutor: TipoTutor = {id, nome, email, telefone}
        listaDeTutores.push(novoTutor);
        return res.status(201).json({
            novoTutor,
            message: "Tutor criado com sucesso"});
    }
    listarTodosTutores(_req: express.Request, res: express.Response){
        return res.status(200).json({
            tutores: listaDeTutores,
            message: "Todos os tutores"
        });
    }

    //atualizar tutor
    atualizarTutor(req: express.Request, res: express.Response){
        const {id} = req.params;

        const {nome, email, telefone} = req.body as TipoTutor;
        const tutor = listaDeTutores.find(tutor => tutor.id === Number(id));

        if(!tutor){
            return res.status(404).json({message: "Tutor não encontrado"});
        }

        tutor.nome = nome;
        tutor.email = email;
        tutor.telefone = telefone;

        return res.status(200).json({
            tutor,
            message: "Tutor atualizado com sucesso"
        })
    }
    //Remover tutor
    removerTutor(req: express.Request, res: express.Response){
        const {id} = req.params;

        const tutorIndex = listaDeTutores.findIndex(tutor => tutor.id === Number(id));

        if(tutorIndex === -1){
            return res.status(404).json({message: "Tutor não encontrado"});
        }

        listaDeTutores.splice(tutorIndex, 1);

        return res.status(200).json({
            tutorIndex, 
            message: "Tutor removido com sucesso"
        });
    }

}