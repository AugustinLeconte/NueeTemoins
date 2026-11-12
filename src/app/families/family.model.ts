export interface FamilyTranslation { locale: string; name: string; }

export interface Family { publicId: string; name: string; }

export interface FamilyAdmin { publicId: string; translations: FamilyTranslation[]; }

export interface FamilyRequest { translations: FamilyTranslation[]; }
