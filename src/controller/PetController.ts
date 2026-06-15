import express from "express";
import type TipoPet from "../tipos/TipoPet";

let listaDePets: TipoPet[] = [];

export default class PetController {
    criaPet(req: express.Request, res: express.Response){
        const {id, nome, especie, idade, adotado} = req.body as TipoPet;
        const novoPet: TipoPet = {id, nome, especie, idade, adotado}
        listaDePets.push(novoPet);
        return res.status(201).json({
            novoPet,
            message: "Pet criado com sucesso"});
    }

    listarTodosPets(_req: express.Request, res: express.Response){
        return res.status(200).json({
            pets: listaDePets,
            message: "Lista de Pets"});   
    }

    atualizarPet(req: express.Request, res: express.Response){
        const {id} = req.params;

        const {nome, especie, idade, adotado} = req.body as TipoPet;

        const pet = listaDePets.find(pet => pet.id === Number(id));
        if(!pet){
            return res.status(404).json({message: "Pet não encontrado"});
        }

        //todos os campos devem ser preenchidos
        if(!nome || !especie || idade === undefined || adotado === undefined){
            return res.status(419).json({
                message: "Todos os campos devem ser preenchidos"});
        }

        pet.nome = nome;
        pet.especie = especie;
        pet.idade = idade;
        pet.adotado = adotado;
        
        return res.status(200).json({
            pet,
            message: "Pet atualizado com sucesso"
        });

        }
//Caso de uso: garantir que o atributo "adotado" seja alterado para true quando o pet for adotado
    adotarPet(req: express.Request, res: express.Response){
        const {id} = req.params;

        const {nome, especie, idade, adotado} = req.body as TipoPet;

        const pet = listaDePets.find(pet => pet.id === Number(id));
        if(!pet){
            return res.status(404).json({message: "Pet não encontrado"});
        }

        pet.adotado = true;

        return res.status(200).json({
            pet,
            message: "Pet adotado com sucesso"
        });
    }
    removerPet(req: express.Request, res: express.Response){    
        const {id} = req.params;

        const {nome, especie, idade, adotado} = req.body as TipoPet;

        const pet = listaDePets.find(pet => pet.id === Number(id));
        if(!pet){
            return res.status(404).json({message: "Pet não encontrado"});
        }

        const index = listaDePets.indexOf(pet);
        listaDePets.splice(index, 1);

        return res.status(200).json({
            pet,
            message: "Pet removido com sucesso"
        });
        
        
    }
}