export interface SubjectResource {
    id?: string;
    userId?: string;
    subjectId: string;
    name: string;
    url: string;
    type: string;
    size?: number;
    createdAt?: string;
}
