import CurvedLoop from '../CurvedLoop';

export default function MarqueeSection() {
  return (
    <section className="w-full bg-[#0a0a0a] overflow-visible -mt-[150px] md:-mt-[200px]">
      <CurvedLoop
        marqueeText="CARDINAL  ARTHUR ✦ "
        speed={1.5}
        curveAmount={220}
        className="text-white font-heading tracking-widest fill-current uppercase text-2xl md:text-5xl"
      />
    </section>
  );
}
