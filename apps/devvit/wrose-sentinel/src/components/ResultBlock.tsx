import { Devvit } from "@devvit/public-api";

export function showResultForm(
  context: Devvit.Context,
  title: string,
  label: string,
  content: string,
): void {
  const form = Devvit.createForm(
    {
      fields: [
        {
          name: "result",
          label,
          type: "paragraph",
          defaultValue: content,
        },
      ],
      title,
      acceptLabel: "Done",
    },
    () => {},
  );
  context.ui.showForm(form);
}