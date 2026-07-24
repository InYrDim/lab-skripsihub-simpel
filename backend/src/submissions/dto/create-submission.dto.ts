export class CreateTitleDto {
  title: string;
  topic?: string;
  description?: string;
}

export class CreateSubmissionDto {
  titles: CreateTitleDto[];
  documentUrl?: string;
  documentName?: string;
}
