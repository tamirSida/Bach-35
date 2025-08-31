export interface Drill {
  id?: string;
  name: string;
  techniques: string[];
  terrains: string[];
  region: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Config {
  techniques: string[];
  terrains: string[];
  regions: string[];
}