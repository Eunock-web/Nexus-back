import { NotFoundException } from "#lib/exceptions"
import prisma from "#lib/prisma"


export class TaskService{

    //Methode pour la creation d'une tache
    static async createTask(data, sprintId){
        const {title, description, projectId} = data;

        if(!sprintId){
           throw new  NotFoundException("Projet inexisant")
        }

        const taskCreate = await prisma.task.create({
            data : {
                title : title,
                description : description,
                type : type,
                projectId : projectId,
                
            }
        })        
    }
}