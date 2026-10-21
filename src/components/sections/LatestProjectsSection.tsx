import ScrollExpand from '../ScrollExpand';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { useLatestProjects } from '../../hooks/useLatestProjects';
import { resolveLatestProjectImage } from '../../data/latestProjectImages';

const buttonClass =
  'px-8 py-4 md:px-10 md:py-5 bg-white text-black uppercase font-bold tracking-widest text-sm md:text-base rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-300 mt-4 shadow-xl';

/** Bare domains (google.com) open as external sites, never as site paths. */
function normalizeButtonLink(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed)) {
    return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  }
  if (/^(mailto:|tel:|#|\/|\?)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function LatestProjectsSection() {
  const { data: projects = [] } = useLatestProjects();

  if (projects.length === 0) return null;

  return (
    <section className="w-full bg-transparent text-white relative pt-10 md:pt-20 pb-20">
      <div className="flex flex-col items-center justify-center -mb-4 md:-mb-12 relative z-10">
        <h2 className="font-heading text-4xl md:text-6xl uppercase leading-[0.9] text-center font-light tracking-tighter">
          <DiaTextReveal
            text="LATEST PROJECTS"
            textColor="#ffffff"
            colors={["#ffffff", "#ffffff", "transparent"]}
            duration={1.5}
            delay={0.2}
            once={true}
          />
        </h2>
      </div>

      {projects.map((project, index) => {
        const isLast = index === projects.length - 1;
        return (
        <ScrollExpand
          key={project.id}
          useWindowScroll={true}
          src={resolveLatestProjectImage(project.imageKey)}
          mediaType="image"
          scrollHint="SCROLL TO DISCOVER"
          startWidth={50}
          startHeight={70}
          startRadius={24}
          endRadius={0}
          mediaZoom={1.2}
          {...(!isLast ? { holdDistance: 2.2 } : {})}
          className={
            index === 0 ? 'w-full' : 'w-full -mt-[220vh] relative z-20'
          }
          style={index === 0 ? undefined : { zIndex: 20 + index }}
        >
          <div className="flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6 md:space-y-8">
            <h3 className="font-heading text-5xl md:text-8xl uppercase text-white drop-shadow-lg font-light tracking-tighter">
              {project.title}
            </h3>
            <p className="text-white/90 text-lg md:text-2xl font-light max-w-2xl text-center leading-relaxed drop-shadow-md">
              {project.description}
            </p>
            {project.buttonLink ? (
              <a
                href={normalizeButtonLink(project.buttonLink)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass}
              >
                {project.buttonText}
              </a>
            ) : (
              <button type="button" className={buttonClass}>
                {project.buttonText}
              </button>
            )}
          </div>
        </ScrollExpand>
        );
      })}
    </section>
  );
}
