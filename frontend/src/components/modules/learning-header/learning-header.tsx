import TitleComponent from '@/components/ui/title-component';

interface LearningHeaderProps {
  title: string;
  subtitle?: string;
}

const LearningHeader = ({ title, subtitle }: LearningHeaderProps) => {
  return (
    <section className="flex items-center gap-5 pt-10">
      <TitleComponent
        title={title}
        description={subtitle}
        backButton
      />
    </section>
  );
};

export default LearningHeader;
