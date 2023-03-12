import { DocumentFileRowSectionStyles } from "./Editor.types";

type Settings = {
  Renderer: {
    css: {
      letterSpacing: number;
      fontSize: number;
      carretWidth: number;
    }
  };
  defaultStyles: DocumentFileRowSectionStyles;
}

const Settings: Settings = {
  Renderer: {
    css: {
      letterSpacing: 0.4,
      fontSize: 18,
      carretWidth: 1,
    },
  },
  defaultStyles: {
    fontFamily: 'arial',
    fontStyle: 'normal',
    fontSize: 20,
    letterSpacing: 0.4,
  }
}

export default Settings