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
  url: string;         // Page URL where annotation was made
  selectedText?: string;
  boundingBox?: BoundingBox;
  nearbyText?: string;
  cssClasses?: string;
  accessibility?: string;
  isFixed?: boolean;
}

export interface Recording {
  startUrl: string;
  annotations: Annotation[];
  createdAt: number;
}
