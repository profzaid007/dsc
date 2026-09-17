import type { BilingualString } from "@/types/form";

export interface Founder {
  name: BilingualString;
  role: BilingualString;
  bio: BilingualString;
  quote: BilingualString;
  photo: string;
}

export const FOUNDER: Founder = {
  name: { en: "Dr Radwan Abusaif", ar: "د. رضوان أبو سيف" },
  role: { en: "Founder & CEO", ar: "المؤسس والرئيس التنفيذي" },
  bio: {
    en: "Founder and Director of Development Secrets Consultancy (DSC), with extensive academic and professional experience in special education, developmental disabilities, giftedness and talent, psychological and educational assessment, psychometrics, research methodology, and evidence-based intervention.",
    ar: "مؤسس ومدير شركة Development Secrets Consultancy (DSC)، ويتمتع بخبرة أكاديمية ومهنية واسعة في التربية الخاصة، والإعاقات النمائية، والموهبة والتفوق، والتقييم النفسي والتربوي، والقياس النفسي، ومنهجية البحث، والتدخل القائم على الأدلة.",
  },
  quote: {
    en: "Empowering growth through strategy, mentorship, and execution.",
    ar: "تمكين النمو من خلال الاستراتيجية والإرشاد والتنفيذ.",
  },
  photo: "/team/founder.jpg",
};
