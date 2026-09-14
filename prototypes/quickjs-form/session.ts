import {
  evaluatePresentation,
  type Presentation,
  type Values,
} from "./sandbox";

// Disposable controller model. No submission endpoint, React integration, or schema inference.
export class FormSession {
  private values: Values;
  private presentation: Presentation = {};
  private error: string | null = null;
  private revision = 0;
  private acceptedRevision = -1;
  private request = 0;
  private pending = false;

  constructor(values: Values) {
    this.values = structuredClone(values);
  }

  get snapshot() {
    return structuredClone({
      values: this.values,
      presentation: this.presentation,
      error: this.error,
      revision: this.revision,
      pending: this.pending,
      canSubmit:
        !this.pending &&
        this.error === null &&
        this.acceptedRevision === this.revision,
    });
  }

  edit(field: string, value: string | boolean | number | null) {
    if (!Object.hasOwn(this.values, field))
      throw new Error(`Unknown field: ${field}`);
    this.values[field] = value;
    this.revision += 1;
    this.request += 1;
    this.pending = false;
  }

  async run(source: string, complete = true) {
    const request = ++this.request;
    const revision = this.revision;
    this.pending = true;
    if (!complete) return;
    try {
      const presentation = await evaluatePresentation(source, this.values);
      if (request !== this.request || revision !== this.revision) return;
      this.presentation = presentation;
      this.acceptedRevision = revision;
      this.error = null;
    } catch (error) {
      if (request !== this.request || revision !== this.revision) return;
      this.error = error instanceof Error ? error.message : "Evaluation failed";
    } finally {
      if (request === this.request) this.pending = false;
    }
  }
}
