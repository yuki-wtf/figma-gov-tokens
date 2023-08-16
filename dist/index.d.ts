export interface Tokens {
  component: Tokens_Component;
  content: Tokens_Content;
  surface: Tokens_Surface;
  border: Tokens_Border;
}

export interface Tokens_Component {
  tag: Tokens_Component_Tag;
}

export interface Tokens_Component_Tag {
  closed: TagStructure;
  pending: TagStructure;
  living: TagStructure;
  withdrawn: TagStructure;
  final: TagStructure;
  lastcall: TagStructure;
  review: TagStructure;
  draft: TagStructure;
  stagnant: TagStructure;
  idea: TagStructure;
  active: TagStructure;
}

export interface TagStructure {
  content: string;
  surface: string;
}

export interface Tokens_Content {
  accent: Tokens_Content_Accent;
  success: Tokens_Content_Success;
  default: Tokens_Content_Default;
  onsurface: Tokens_Content_Onsurface;
  danger: Tokens_Content_Danger;
  support: Tokens_Content_Support;
  links: Tokens_Content_Links;
  onsurfaceinverted: Tokens_Content_Onsurfaceinverted;
}

export interface Tokens_Content_Accent {
  disabled: string;
  default: string;
}

export interface Tokens_Content_Success {
  default: string;
}

export interface Tokens_Content_Default {
  disabled: string;
  selected: string;
  selectedinverted: string;
  hover: string;
  default: string;
}

export interface Tokens_Content_Onsurface {
  default: string;
}

export interface Tokens_Content_Danger {
  default: string;
}

export interface Tokens_Content_Support {
  hover: string;
  selected: string;
  disabled: string;
  default: string;
}

export interface Tokens_Content_Links {
  default: string;
}

export interface Tokens_Content_Onsurfaceinverted {
  default: string;
}

export interface Tokens_Surface {
  overlay: string;
  accentsecondary: Tokens_Surface_Accentsecondary;
  onbg: Tokens_Surface_Onbg;
  forms: Tokens_Surface_Forms;
  accent: Tokens_Surface_Accent;
  danger: Tokens_Surface_Danger;
  bgpage: string;
  cards: Tokens_Surface_Cards;
  success: Tokens_Surface_Success;
}

export interface Tokens_Surface_Accentsecondary {
  default: string;
}

export interface Tokens_Surface_Onbg {
  hover: string;
  default: string;
}

export interface Tokens_Surface_Forms {
  disabled: string;
  hover: string;
  default: string;
  selectedinverted: string;
  selected: string;
}

export interface Tokens_Surface_Accent {
  disabled: string;
  selected: string;
  hover: string;
  default: string;
}

export interface Tokens_Surface_Danger {
  default: string;
}

export interface Tokens_Surface_Cards {
  default: string;
}

export interface Tokens_Surface_Success {
  default: string;
}

export interface Tokens_Border {
  link: string;
  accent: string;
  forms: string;
  danger: string;
  light: string;
  dividers: string;
}

