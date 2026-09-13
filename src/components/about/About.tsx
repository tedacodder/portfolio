import Section, { SectionKicker, SectionHeading } from "@/components/ui/Section";
import Principles from "./Principles";
import type { Profile, Principle } from "@/types/api";

export default function About({
  profile,
  principles,
}: {
  profile: Profile | null;
  principles: Principle[];
}) {
  if (!profile) return null;

  return (
    <Section id="about">
      <SectionKicker>ABOUT</SectionKicker>
      <SectionHeading>Engineering with curiosity.</SectionHeading>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        {profile.bio}
      </p>

      {principles.length > 0 && (
        <div className="mt-14">
          <Principles principles={principles} />
        </div>
      )}
    </Section>
  );
}
