export interface TermsSection {
  title: string;
  paragraphs: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: 'Introduction',
    paragraphs: [
      'Welcome to Cardinal Arthur. By accessing our website, placing an order, or using our services, you agree to these Terms & Conditions. Please read them carefully before making a purchase.',
    ],
  },
  {
    title: 'Products & Availability',
    paragraphs: [
      'All products displayed on our site are subject to availability. We reserve the right to limit quantities, discontinue items, or refuse any order at our discretion.',
      'Product images are for illustrative purposes. Slight variations in color, texture, or finish may occur due to the nature of handcrafted materials.',
    ],
  },
  {
    title: 'Pricing & Payment',
    paragraphs: [
      'Prices are listed in Egyptian Pounds (EGP) unless otherwise stated and may change without prior notice. The price charged is the price displayed at checkout at the time of order confirmation.',
      'Payment must be completed through the methods offered at checkout. Orders remain pending until payment is confirmed as paid.',
    ],
  },
  {
    title: 'Shipping & Delivery',
    paragraphs: [
      'Delivery times are estimates and may vary by location and courier conditions. Risk of loss transfers to you upon delivery to the address provided at checkout.',
      'Please ensure your shipping details are accurate. Cardinal Arthur is not responsible for delays or failed delivery caused by incorrect information.',
    ],
  },
  {
    title: 'Returns & Exchanges',
    paragraphs: [
      'Eligible items may be returned or exchanged within 14 days of delivery if unused, in original condition, and with all packaging intact.',
      'Custom, personalized, or made-to-order pieces are final sale and cannot be returned unless they arrive damaged or defective.',
    ],
  },
  {
    title: 'Intellectual Property',
    paragraphs: [
      'All content on this website — including designs, photography, text, logos, and branding — is the property of Cardinal Arthur and may not be used without prior written permission.',
    ],
  },
  {
    title: 'Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by law, Cardinal Arthur shall not be liable for indirect, incidental, or consequential damages arising from your use of the site or purchase of products.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      'For questions about these Terms & Conditions, please reach out via our contact channels on the website or email INFO@CARDINAL.COM.',
    ],
  },
];

export const TERMS_LAST_UPDATED = 'October 2026';
