import { Devvit } from "@devvit/public-api";

export function showErrorForm(
  context: Devvit.Context,
  title: string,
  message: string,
): void {
  const form = Devvit.createForm(
    {
      fields: [
        {
          name: "error",
          label: "Error",
          type: "paragraph",
          defaultValue:
            `${message}\n\n` + `Automated action taken: false`,
        },
      ],
      title,
      acceptLabel: "OK",
    },
    () => {},
  );
  context.ui.showForm(form);
}