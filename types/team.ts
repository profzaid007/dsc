export interface TeamExpert {
  id: string;
  name: string;
  photoUrl: string | null;
  roles: string[];
  degree: string | null;
  fieldOfStudy: string | null;
  bio: string;
}