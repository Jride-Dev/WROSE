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

const resultFormKey = Devvit.createForm(
  (data: any) => {
    const fields = (data.sections || []).map((s: any) => ({
      name: s.label.toLowerCase().replace(/\s+/g, "_"),
      label: s.label,
      type: "paragraph" as const,
      defaultValue: s.content,
      disabled: true,
      ...(s.lineHeight ? { lineHeight: s.lineHeight } : {}),
    }));
    return {
      fields,
      title: data.title,
      ...(data.description !== undefined ? { description: data.description } : {}),
      acceptLabel: "Done",
    };
  },
  () => {},
);

export function showResultForm(context: Context, opts: ResultFormOptions): void {
  context.ui.showForm(resultFormKey, opts as any);
}

export function showErrorForm(context: Context, title: string, message: string): void {
  showResultForm(context, {
    title,
    sections: [{ label: "Notice", content: message, lineHeight: 3 }],
  });
}
