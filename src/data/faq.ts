export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: 'What materials are used in Cardinal Arthur pieces?',
    answer:
      'We source only the finest full-grain leathers and premium hardware. Every piece is meticulously crafted to ensure longevity and an exquisite patina over time.',
  },
  {
    question: 'Do you offer international shipping?',
    answer:
      'Yes, we ship globally. International orders are handled via premium courier services to ensure your pieces arrive safely and promptly, no matter where you are.',
  },
  {
    question: 'What is your design process?',
    answer:
      'Our design process marries heritage craftsmanship with avant-garde aesthetics. Every concept begins with meticulous sketching and prototyping, ensuring perfect proportions before moving into limited-run production.',
  },
  {
    question: 'How long does a custom project usually take?',
    answer:
      'Custom bespoke projects typically require 6 to 8 weeks from initial consultation to final delivery, as every detail is meticulously handcrafted to your exact specifications.',
  },
  {
    question: 'What is your return and exchange policy?',
    answer:
      'We accept returns and exchanges within 14 days of delivery. Items must be in their original, unused condition with all tags and packaging intact. Custom or personalized items are final sale.',
  },
];
