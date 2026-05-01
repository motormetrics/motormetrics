import { Infobox } from "@web/components/shared/infobox";

interface AboutParfProps {
  title: string;
  content: string;
}

export function AboutParf({ title, content }: AboutParfProps) {
  return <Infobox title={title} content={content} />;
}
