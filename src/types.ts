export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Annotation {
  id: string;
  x: number;           // % viewport width
  y: number;           // px from top
  comment: string;     // User's note about the element
  element: string;     // e.g. "button", "input", "link"
  elementPath: string; // e.g. "body > div > button"
  timestamp: number;
  selectedText?: string;
  boundingBox?: BoundingBox;
  nearbyText?: string;
  cssClasses?: string;
  accessibility?: string;
  isFixed?: boolean;
}

export interface RecordedStep {
  stepNumber: number;
  url: string;
  action: string;           // User description: "click on Pepperoni button"
  annotations: Annotation[];
}

export interface Recording {
  startUrl: string;
  steps: RecordedStep[];
  createdAt: number;
}
