export interface DiagramPortal {
  host: HTMLDivElement;
  id: string;
  label: string;
  target: HTMLElement;
}

export interface ActiveDiagram {
  label: string;
  target: HTMLElement;
  trigger: HTMLButtonElement;
}
