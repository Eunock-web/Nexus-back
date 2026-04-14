import { NotFoundException } from "#lib/exceptions";
import prisma from "#lib/prisma";


export class SprintService{

    static async CreateSprint(data, projectId){
        const {name, startDate, endDate} = data;
        if(!projectId){
            throw new NotFoundException("L'id du  projet est requis")
        }

        const sprintCreate = await prisma.sprint.create({
            data : {
                name : name,
                startDate : startDate,
                endDate : endDate,
                projectId : projectId
            }
        })

        if(sprintCreate){
            return {
                success : true,
                data : sprintCreate
            }
        }
    }
}