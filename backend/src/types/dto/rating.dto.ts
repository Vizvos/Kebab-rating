import { IsNotEmpty, IsString, IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class CreateRatingDto {
    @IsNotEmpty()
    @IsString()
    foodName!: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(10)
    @Type(() => Number)
    score!: number;

    @IsNotEmpty()
    @IsString()
    description!: string;
}
