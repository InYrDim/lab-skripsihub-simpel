export class CreateTitleDto {
  title: string;
  description?: string;
}

export class CreateSubmissionDto {
  titles: CreateTitleDto[];
}
