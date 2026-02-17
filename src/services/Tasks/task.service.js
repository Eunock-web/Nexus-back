import { NotFoundException } from "#lib/exceptions"


export class TaskService{

    //Methode pour la creation d'une tache
    static async createTask(data, projectId){
        const {} = data

        if(!projectId){
           throw new  NotFoundException("Projet inexisant")
        }

        
    }
}