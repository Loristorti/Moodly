import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/client.js';

export class TeamSummaryDto {
  @ApiProperty({ example: '9fecd689-87b6-4066-8945-5e28d763763c' })
  id: string;

  @ApiProperty({ example: 'Équipe Produit' })
  name: string;
}

export class UserProfileDto {
  @ApiProperty({ example: '670ef073-c27d-4e5a-b45f-6bdbc72e641c' })
  id: string;

  @ApiProperty({ example: 'Alice' })
  firstName: string;

  @ApiProperty({ example: 'Martin' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.EMPLOYEE })
  role: Role;

  @ApiProperty({ type: TeamSummaryDto })
  team: TeamSummaryDto;
}
