export type ContentStage = 'DRAFT'|'REVIEW'|'APPROVED'|'SCHEDULED'|'PUBLISHED'|'ARCHIVED';
export const stages: ContentStage[] = ['DRAFT','REVIEW','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED'];
export const requiresHumanReview = (kind:string) => ['security','legal','finance','regulatory'].includes(kind);
