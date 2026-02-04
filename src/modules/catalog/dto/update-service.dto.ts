import { PartialType } from "@nestjs/mapped-types";
import { CreatePetServiceDTO } from "./create-service.dto";

export class UpdatePetServiceDTO extends PartialType(CreatePetServiceDTO) { }
