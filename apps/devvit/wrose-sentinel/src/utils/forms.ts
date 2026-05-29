import { Devvit, Context } from "@devvit/public-api";

export interface Section {
  label: string;
  content: string;
  lineHeight?: number;
}

export interface ResultFormOptions {
  title: string;
  description?: string;
  sections: Section[];
}

export function showResultForm(context: Context, opts: ResultFormOptions): void {
  const fields = opts.sections.map((s) => ({
    name: s.label.toLowerCase().replace(/\s+/g, "_"),
    label: s.label,
    type: "paragraph" as const,
    defaultValue: s.content,
    disabled: true,
    ...(s.lineHeight ? { lineHeight: s.lineHeight } : {}),
  }));

  const formOpts: {
    fields: typeof fields;
    title: string;
    description?: string;
    acceptLabel: string;
  } = {
    fields,
    title: opts.title,
    acceptLabel: "Done",
  };
  if (opts.description !== undefined) formOpts.description = opts.description;
  const form = Devvit.createForm(formOpts, () => {});
  context.ui.showForm(form);
}

export function showErrorForm(context: Context, title: string, message: string): void {
  showResultForm(context, {
    title,
    sections: [{ label: "Notice", content: message, lineHeight: 3 }],
  });
}
