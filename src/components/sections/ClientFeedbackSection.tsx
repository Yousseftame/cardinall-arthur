import { Star } from 'lucide-react';

const FEEDBACKS = [
  {
    id: 1,
    title: "A designer who truly understands users.",
    text: "“Working with Novasite was a remarkable experience. Their ability to translate user needs into intuitive and clean designs is exceptional. They always think one step ahead and ensure every decision is backed by purpose. Our product became significantly easier to use after their redesign.”",
    name: "Sarah Mitchell",
    role: "Product Manager",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop",
    align: "justify-start",
    marginTop: "mt-[10vh]",
  },
  {
    id: 2,
    title: "From the first meeting, it was clear that Novasite brings clarity and structure to the design process.",
    text: "“They delivered beautiful wireframes, prototypes, and a well-organized design system that made our development team's job much easier. Highly recommended!”",
    name: "Daniel Lee",
    role: "Lead Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    align: "justify-end",
    marginTop: "mt-[15vh]",
  },
  {
    id: 3,
    title: "A rare mix of creativity and problem-solving.",
    text: "“What impressed me most was their ability to turn complex features into simple, easy-to-understand flows. Their visuals are modern, clean, and perfectly aligned with our brand. They brought life to our dashboard and improved usability across the board.”",
    name: "Emily Chen",
    role: "UX Director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    align: "justify-center",
    marginTop: "mt-[15vh]",
  },
  {
    id: 4,
    title: "Exceptionally detail-oriented and user-focused.",
    text: "“Every screen they produce is a work of art. The attention to spacing, typography, and micro-interactions makes the final product feel incredibly premium.”",
    name: "Alex Carter",
    role: "Startup Founder",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    align: "justify-end",
    marginTop: "mt-[15vh]",
  },
  {
    id: 5,
    title: "Professional, fast, and extremely reliable.",
    text: "“Novasite consistently delivered high-quality work on time. Their attention to detail and commitment to creating the best possible user experience set them apart. They are a valuable addition to any design team.”",
    name: "Michael Torres",
    role: "CEO",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    align: "justify-start",
    marginTop: "mt-[15vh]",
  }
];

export default function ClientFeedbackSection() {
  return (
    <section className="relative w-full bg-[#0a0a0a] text-white">
      {/* Sticky Title Background */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden z-0 pointer-events-none">
        <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.85] text-center flex flex-col items-center justify-center">
          <span>CLIENT</span>
          <span>FEEDBACK</span>
        </h2>
      </div>

      {/* Scrolling Cards Container */}
      <div className="relative z-10 w-full px-2 md:px-4 lg:px-8 pb-[20vh] -mt-[100vh]">
        
        {/* Top spacer to let user see the title first before cards arrive */}
        <div className="h-[60vh]"></div>

        <div className="flex flex-col w-full">
          {FEEDBACKS.map((feedback) => (
            <div key={feedback.id} className={`w-full flex ${feedback.align} ${feedback.marginTop}`}>
              <div className="bg-[#121212]/50 backdrop-blur-lg border border-white/5 p-6 md:p-8 flex flex-col max-w-[420px] w-full rounded-md shadow-2xl">
                {/* Stars */}
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#dc143c] text-[#dc143c]" />
                  ))}
                </div>
                
                {/* Highlight Title */}
                <h3 className="text-white text-lg md:text-xl font-bold leading-snug tracking-tighter mt-5">
                  {feedback.title}
                </h3>
                
                {/* Review Text */}
                <p className="text-gray-200 text-[15px] leading-relaxed tracking-tight mt-3">
                  {feedback.text}
                </p>
                
                {/* User Info */}
                <div className="flex items-center gap-4 mt-6">
                  <img 
                    src={feedback.image} 
                    alt={feedback.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-[#dc143c] font-medium text-base">{feedback.name}</span>
                    <span className="text-white text-sm">{feedback.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
