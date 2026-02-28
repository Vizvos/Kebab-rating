import { IsNotEmpty, IsString, IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class CreatePlaceDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    lat!: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    lon!: number;
}
